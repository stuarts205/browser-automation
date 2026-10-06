import toposort from "toposort"
import { logger, metadata, task } from "@trigger.dev/sdk"
import { getWorkflow } from "@/features/workflows/data"
import { Stagehand } from "@browserbasehq/stagehand"
import {
  nodeExecutors,
  type StepOutput,
} from "@/features/workflows/nodes/node-executors"
import type { NodeType } from "@/features/workflows/nodes/node-registry"
import {
  interpolate,
  type NodeOutputs,
} from "@/features/workflows/lib/interpolate"

// Everything the canvas and console show for one node in one run.
export type RunStep = {
  nodeId: string
  // Snapshotted from the node when the run starts: the registry gives `type`'s
  // icon, and `title` is copied so renaming the node later doesn't rewrite
  // what an old run shows.
  type: NodeType
  title: string
  status: "pending" | "running" | "done" | "failed"
  // Set once the step finishes, whether it succeeded or threw.
  durationMs?: number
  // What the node produced. Only on a "done" step.
  output?: StepOutput
  // The thrown error's message. Only on a "failed" step.
  error?: string
}

export const runWorkflowTask  = task({
  id: "run-workflow",
  run: async ({ workflowId, orgId }: { workflowId: string; orgId: string }) => {
    const workflow = await getWorkflow(orgId, workflowId)
    if (!workflow?.graph) {
      throw new Error(`Workflow ${workflowId} has no graph`)
    }

    const { nodes, edges } = workflow.graph
    const byId = new Map(nodes.map((node) => [node.id, node]))
    const connected = new Set(edges.flatMap((e) => [e.source, e.target]))
    const order = toposort
      .array(
        nodes.map((n) => n.id),
        edges.map((e) => [e.source, e.target])
      )
      .filter((id) => connected.has(id))

    logger.log(`Running workflow ${workflow.name}`, { steps: order.length })

    // Live state for the canvas and console, published to run metadata under
    // "steps". Metadata drops a `set` whose value deep-equals what it already
    // holds, so each change builds a new array instead of mutating this one in
    // place.
    let steps: RunStep[] = order.map((nodeId) => {
      const { type, title } = byId.get(nodeId)!.data
      return { nodeId, type, title, status: "pending" }
    })
    metadata.set("steps", steps)

    const updateStep = (
      nodeId: string,
      patch: Partial<Omit<RunStep, "nodeId" | "type" | "title">>
    ) => {
      steps = steps.map((step) =>
        step.nodeId === nodeId ? { ...step, ...patch } : step
      )
      metadata.set("steps", steps)
    }

    let stagehand: Stagehand | undefined
    // The Browserbase session this run drove, for replaying it afterwards. Read
    // right after `init()` because `close()` clears it from Stagehand. Stays
    // undefined if no node ever opened a browser.
    let sessionId: string | undefined
    const getStagehand = async () => {
      if(stagehand) return stagehand
      stagehand = new Stagehand({
        env: "BROWSERBASE",
        apiKey: process.env.BROWSERBASE_API_KEY!,
        model: "google/gemini-2.5-flash",
        disablePino: true,
      })
      await stagehand.init()
      sessionId = stagehand.browserbaseSessionID
      return stagehand
    }

    // Each node's result, keyed by node id. Nodes run in dependency order, so
    // anything a node references has already landed here.
    const outputs: NodeOutputs = {}

    for (const id of order) {
      const node = byId.get(id)!
      logger.log(`Running step: ${node.data.title}`)
      const executor = nodeExecutors[node.data.type]
      if (!executor) {
        // Only triggers get here (every action needs an executor). They do no
        // work and have no output, so they just read as completed.
        updateStep(id, { status: "done" })
        continue
      }

      // Flush so "running" is pushed on its own; otherwise "done" would
      // overwrite it before the periodic flush and the spinner never shows.
      updateStep(id, { status: "running" })
      await metadata.flush()

      const startedAt = Date.now()
      let output: StepOutput
      try {
        const values = Object.fromEntries(
          Object.entries(node.data.values).map(([key, text]) => [
            key,
            interpolate({ text, outputs }),
          ])
        )
        output = await executor({ values, getStagehand })
      } catch (error) {
        // Rethrowing fails the run with no output, so this flush is the only
        // way the failed state reaches the canvas.
        updateStep(id, {
          status: "failed",
          durationMs: Date.now() - startedAt,
          error: error instanceof Error ? error.message : String(error),
        })
        await metadata.flush()
        // Rethrowing also skips the close below, which would leave the
        // Browserbase session "running" until it times out. A close failure
        // is swallowed so it can't replace the step's real error.
        await stagehand?.close().catch(() => {})
        throw error
      }

      outputs[id] = output
      updateStep(id, {
        status: "done",
        durationMs: Date.now() - startedAt,
        output,
      })
    }

    await stagehand?.close()

    // Returned so a finished run's final state doesn't depend on a metadata flush.
    // `sessionId` is deliberately output-only: the recording isn't ready until
    // the session closes, so nothing should offer a replay while the run is live.
    return { steps, sessionId }
  },
})
