import prettyMilliseconds from "pretty-ms"

import { cn } from "@/lib/utils"

import { NodeIcon } from "@/features/workflows/components/node-icon"
import {
  useWorkflowRuns,
  type WorkflowRun,
} from "@/features/workflows/components/workflow-runs-provider"
import type { RunStep } from "@/features/workflows/tasks/run-workflow"

// Every run has a step per node, so a step is identified by its run as well as
// its node.
export type StepSelection = { runId: string; nodeId: string }

// "WAITING_FOR_DEPLOY" -> "Waiting for deploy"
function formatStatus(status: string) {
  const text = status.toLowerCase().replace(/_/g, " ")
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function StepRow({
  run,
  step,
  isSelected,
  onSelect,
}: {
  run: WorkflowRun
  step: RunStep
  isSelected: boolean
  onSelect: (selection: StepSelection) => void
}) {
  // A run that ends mid-step (cancelled, crashed) leaves "running" behind, so
  // only spin while the run is actually live.
  const isRunning = step.status === "running" && run.isLive
  const isFailed = step.status === "failed"
  // Never ran: still pending, or cut off mid-step when its run ended.
  const isInactive =
    step.status === "pending" || (step.status === "running" && !run.isLive)

  return (
    <li>
      <button
        type="button"
        aria-pressed={isSelected}
        onClick={() => onSelect({ runId: run.id, nodeId: step.nodeId })}
        className={cn(
          "flex w-full items-center gap-2 py-1 pr-3 pl-6 text-left text-xs hover:bg-accent/50",
          isSelected && "bg-accent",
          isInactive && "opacity-50",
          isFailed && "text-destructive"
        )}
      >
        <NodeIcon type={step.type} running={isRunning} />
        <span className="min-w-0 truncate font-medium">{step.title}</span>
        <span
          className={cn(
            "ml-auto shrink-0 tabular-nums",
            !isFailed && "text-muted-foreground"
          )}
        >
          {step.durationMs !== undefined && prettyMilliseconds(step.durationMs)}
        </span>
      </button>
    </li>
  )
}

// Every run of the workflow, newest first, each with its steps listed below it.
export function LogsPanel({
  selected,
  onSelect,
}: {
  selected: StepSelection | null
  onSelect: (selection: StepSelection) => void
}) {
  const runs = useWorkflowRuns()

  if (runs.length === 0) {
    return <p className="p-3 text-sm text-muted-foreground">No runs yet</p>
  }

  return (
    <div className="flex flex-col">
      {runs.map((run) => (
        <section key={run.id}>
          <div className="flex items-center justify-between gap-2 border-b border-border bg-card px-3 py-1.5 text-xs">
            <span className="font-semibold">
              {run.createdAt.toLocaleString(undefined, {
                dateStyle: "short",
                timeStyle: "medium",
              })}
            </span>
            <span className="text-muted-foreground">
              {formatStatus(run.status)}
            </span>
          </div>
          <ul>
            {run.steps.map((step) => (
              <StepRow
                key={step.nodeId}
                run={run}
                step={step}
                isSelected={
                  selected?.runId === run.id && selected.nodeId === step.nodeId
                }
                onSelect={onSelect}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
