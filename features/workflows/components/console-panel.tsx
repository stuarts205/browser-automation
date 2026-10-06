"use client"

import { useState } from "react"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

import {
  InspectorPanel,
  type InspectorTarget,
} from "@/features/workflows/components/inspector-panel"
import {
  isSameSelection,
  LogsPanel,
  type ConsoleSelection,
} from "@/features/workflows/components/logs-panel"
import {
  useWorkflowRuns,
  type WorkflowRun,
} from "@/features/workflows/components/workflow-runs-provider"

// What the output pane shows for a selection, or undefined if what it points at
// isn't there (the step is gone, or the run has no recording).
function toInspectorTarget(
  selected: ConsoleSelection,
  run: WorkflowRun
): InspectorTarget | undefined {
  if (selected.kind === "replay") {
    return run.sessionId === undefined
      ? undefined
      : { kind: "replay", sessionId: run.sessionId }
  }

  const step = run.steps.find((step) => step.nodeId === selected.nodeId)
  return step && { kind: "step", step }
}

// The console under the canvas: the logs list, plus an output view beside it
// (with a draggable divider) while a step or a run's replay is selected. Owns
// which row is selected, one at a time; clicking the selected row again clears
// it.
export function ConsolePanel() {
  const [selected, setSelected] = useState<ConsoleSelection | null>(null)
  const runs = useWorkflowRuns()

  const selectedRun = selected && runs.find((run) => run.id === selected.runId)
  const target =
    selected && selectedRun
      ? toInspectorTarget(selected, selectedRun)
      : undefined

  return (
    <ResizablePanelGroup orientation="horizontal" className="bg-background">
      <ResizablePanel id="logs" minSize="12rem">
        <LogsPanel
          selected={selected}
          onSelect={(next) =>
            setSelected((current) =>
              isSameSelection(current, next) ? null : next
            )
          }
        />
      </ResizablePanel>
      {selectedRun && target && (
        <>
          <ResizableHandle />
          <ResizablePanel id="inspector" minSize="12rem">
            <InspectorPanel run={selectedRun} target={target} />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  )
}
