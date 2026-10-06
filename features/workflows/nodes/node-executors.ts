import type { Stagehand } from "@browserbasehq/stagehand"
import type { RunMetadata } from "@trigger.dev/sdk"

import type {
  ActionNodeType,
  NodeType,
} from "@/features/workflows/nodes/node-registry"
import { act } from "./act"
import { agent } from "./agent"
import { extract } from "./extract"
import { observe } from "./observe"
import { openUrl } from "./open-url"
import { sendEmail } from "./send-email"

export type NodeContext = {
  values: Record<string, string>
  getStagehand: () => Promise<Stagehand>
}

// What a node returns. It's published on the run's step (run metadata, then the
// run output), so it has to be plain JSON — a return that isn't won't compile.
export type StepOutput = RunMetadata[string]

export type NodeExecutor = (ctx: NodeContext) => Promise<StepOutput>

export const nodeExecutors: Partial<Record<NodeType, NodeExecutor>> = {
  "open-url": async ({ values, getStagehand }) => 
    openUrl({ stagehand: await getStagehand(), url: values.url }),
  act: async ({ values, getStagehand }) =>
    act({ stagehand: await getStagehand(), instruction: values.instruction }),
  extract: async ({ values, getStagehand }) =>
    extract({
      stagehand: await getStagehand(),
      instruction: values.instruction,
    }),
  observe: async ({ values, getStagehand }) =>
    observe({
      stagehand: await getStagehand(),
      instruction: values.instruction,
    }),
  agent: async ({ values, getStagehand }) =>
    agent({
      stagehand: await getStagehand(),
      instruction: values.instruction,
    }),
  "send-email": async ({ values }) =>
    sendEmail({ to: values.to, subject: values.subject, body: values.body }),
} satisfies Record<ActionNodeType, NodeExecutor>