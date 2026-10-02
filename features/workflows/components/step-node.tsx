import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"

import { useLatestRunSteps } from "@/features/workflows/components/workflow-runs-provider"
import {
  nodeRegistry,
  type StepNodeType,
} from "@/features/workflows/nodes/node-registry"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

function StepNodeComponent({ id, data, selected }: NodeProps<StepNodeType>) {
  const { type, kind, title, values } = data
  const def = nodeRegistry[type]
  const Icon = def.icon
  const fields = def.fields.filter((field) => values[field.key])

  // A trigger starts the flow and takes no input, so it has no target handle.
  const hasTarget = kind !== "trigger"

  const { steps, isLive } = useLatestRunSteps()
  const status = steps.find((step) => step.nodeId === id)?.status
  // A run that ends mid-node (cancelled, crashed) leaves "running" behind, so
  // only spin while the run is actually live.
  const isRunning = status === "running" && isLive
  const isFailed = status === "failed"

  return (
    <div
      className={cn(
        "h-14 w-60 rounded-xl border-2 border-border bg-card text-card-foreground ring-2 ring-ring ring-offset-2 ring-offset-background",
        isRunning && "border-blue-500",
        isFailed && "border-destructive",
        selected && "ring-foreground"
      )}
    >
      {hasTarget && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ transform: "translate(-100%, -50%)" }}
          className="h-3.5! w-1.5! min-w-0! rounded-l-xs! rounded-r-none! border-0! bg-border!"
        />
      )}

      <div className="flex h-full items-center gap-3 px-3">
        <div
          className={cn(
            "flex size-7.5 shrink-0 items-center justify-center rounded-md",
            def.accent
          )}
        >
          {isRunning ? <Spinner /> : <Icon className="size-4" />}
        </div>
        <span className="truncate text-sm font-semibold">{title}</span>
      </div>

      {fields.length > 0 && (
        <>
          <div className="border-t border-border" />
          <div className="flex flex-col gap-1.5 px-3 py-2.5">
            {fields.map((field) => (
              <div
                key={field.key}
                className="flex items-center justify-between gap-4 text-xs"
              >
                <span className="shrink-0 text-muted-foreground">{field.label}</span>
                <span className="truncate font-medium">{values[field.key]}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <Handle
        type="source"
        position={Position.Right}
        style={{ transform: "translate(100%, -50%)" }}
        className="h-3.5! w-1.5! min-w-0! rounded-l-none! rounded-r-xs! border-0! bg-border!"
      />
    </div>
  )
}

export const StepNode = memo(StepNodeComponent)