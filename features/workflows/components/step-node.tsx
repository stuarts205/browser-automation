import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"

import {
  nodeRegistry,
  type StepNodeType,
} from "@/features/workflows/nodes/node-registry"
import { cn } from "@/lib/utils"

function StepNodeComponent({ data, selected }: NodeProps<StepNodeType>) {
  const { type, kind, title } = data
  const def = nodeRegistry[type]
  const Icon = def.icon

  // A trigger starts the flow and takes no input, so it has no target handle.
  const hasTarget = kind !== "trigger"

  return (
    <div
      className={cn(
        "h-14 w-60 rounded-xl border-2 border-border bg-card text-card-foreground ring-2 ring-ring ring-offset-2 ring-offset-background",
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
          <Icon className="size-4" />
        </div>
        <span className="truncate text-sm font-semibold">{title}</span>
      </div>

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