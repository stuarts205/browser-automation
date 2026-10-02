import toposort from "toposort"
import { logger, task } from "@trigger.dev/sdk"
import { getWorkflow } from "@/features/workflows/data"
import { Stagehand } from "@browserbasehq/stagehand"
import { nodeExecutors } from "@/features/workflows/nodes/node-executors"

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

    for (const id of order) {
      const node = byId.get(id)!
      logger.log(`Running step: ${node.data.title}`)
      // TODO: actually execute the node instead of just logging it, and report
      // its progress so the UI can watch the run live.
      const executor = nodeExecutors[node.data.type]
      if (executor) {
        await executor({
          values: node.data.values, getStagehand
        })
      }
    }

    await stagehand?.close()

    return { steps: order.length }
  },
})
