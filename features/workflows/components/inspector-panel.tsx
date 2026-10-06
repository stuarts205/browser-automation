import type { WorkflowRun } from "@/features/workflows/components/workflow-runs-provider"
import type { RunStep } from "@/features/workflows/tasks/run-workflow"

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

// The selected step's result: its error if it failed, else its output as
// formatted JSON, else a short note on why there's nothing.
export function InspectorPanel({
  run,
  step,
}: {
  run: WorkflowRun
  step: RunStep
}) {
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
