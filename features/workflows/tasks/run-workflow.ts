import toposort from "toposort"
import { logger, metadata, task } from "@trigger.dev/sdk"
import { getWorkflow } from "@/features/workflows/data"
import { Stagehand } from "@browserbasehq/stagehand"
import { nodeExecutors } from "@/features/workflows/nodes/node-executors"
import {
  interpolate,
  type NodeOutputs,
} from "@/features/workflows/lib/interpolate"

export type RunStep = {
  nodeId: string
  status: "pending" | "running" | "done" | "failed"
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

    // Live status for the canvas, published to run metadata under "steps".
    // Metadata drops a `set` whose value deep-equals what it already holds, so
    // each change builds a new array instead of mutating this one in place.
    let steps: RunStep[] = order.map((nodeId) => ({ nodeId, status: "pending" }))
    metadata.set("steps", steps)

    const setStatus = (nodeId: string, status: RunStep["status"]) => {
      steps = steps.map((step) =>
        step.nodeId === nodeId ? { ...step, status } : step
      )
      metadata.set("steps", steps)
    }

    let stagehand: Stagehand | undefined
    const getStagehand = async () => {
      if(stagehand) return stagehand
      stagehand = new Stagehand({
        env: "BROWSERBASE",
        apiKey: process.env.BROWSERBASE_API_KEY!,
        model: "google/gemini-2.5-flash",
        disablePino: true,
      })
      await stagehand.init()
      return stagehand
    }

    // Each node's result, keyed by node id. Nodes run in dependency order, so
    // anything a node references has already landed here.
    const outputs: NodeOutputs = {}

    for (const id of order) {
      const node = byId.get(id)!
      logger.log(`Running step: ${node.data.title}`)
      const executor = nodeExecutors[node.data.type]
      if (!executor) continue

      // Flush so "running" is pushed on its own; otherwise "done" would
      // overwrite it before the periodic flush and the spinner never shows.
      setStatus(id, "running")
      await metadata.flush()

      try {
        const values = Object.fromEntries(
          Object.entries(node.data.values).map(([key, text]) => [
            key,
            interpolate({ text, outputs }),
          ])
        )
        outputs[id] = await executor({ values, getStagehand })
      } catch (error) {
        // Rethrowing fails the run with no output, so this flush is the only
        // way the failed state reaches the canvas.
        setStatus(id, "failed")
        await metadata.flush()
        // Rethrowing also skips the close below, which would leave the
        // Browserbase session "running" until it times out. A close failure
        // is swallowed so it can't replace the step's real error.
        await stagehand?.close().catch(() => {})
        throw error
      }

      setStatus(id, "done")
    }

    await stagehand?.close()

    // Returned so a finished run's final state doesn't depend on a metadata flush.
    return { steps }
  },
})
