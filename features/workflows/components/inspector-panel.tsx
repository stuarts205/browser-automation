import { SessionReplay } from "@/features/workflows/components/session-replay"
import type { WorkflowRun } from "@/features/workflows/components/workflow-runs-provider"
import type { RunStep } from "@/features/workflows/tasks/run-workflow"

// What the pane shows: one step's result, or the recording of a whole run.
export type InspectorTarget =
  { kind: "step"; step: RunStep } | { kind: "replay"; sessionId: string }

// What to say when a step has neither an error nor an output.
function emptyNote(step: RunStep, isLive: boolean) {
  switch (step.status) {
    case "pending":
      return isLive ? "Waiting to run." : "This step didn't run."
    case "running":
      return isLive ? "Running…" : "This step was interrupted before it finished."
    default:
      return "This step produced no output."
  }
}

// The selected row's result. For a step: its error if it failed, else its
// output as formatted JSON, else a short note on why there's nothing. For a
// run's replay: the recording, in place of any step's output.
export function InspectorPanel({
  run,
  target,
}: {
  run: WorkflowRun
  target: InspectorTarget
}) {
  if (target.kind === "replay") {
    return <SessionReplay sessionId={target.sessionId} />
  }

  const { step } = target

  if (step.error !== undefined) {
    return (
      <pre className="p-3 font-mono text-xs wrap-break-word whitespace-pre-wrap text-destructive">
        {step.error}
      </pre>
    )
  }

  if (step.output !== undefined) {
    return (
      <pre className="p-3 font-mono text-xs wrap-break-word whitespace-pre-wrap">
        {JSON.stringify(step.output, null, 2)}
      </pre>
    )
  }

  return (
    <p className="p-3 text-sm text-muted-foreground">
      {emptyNote(step, run.isLive)}
    </p>
  )
}
