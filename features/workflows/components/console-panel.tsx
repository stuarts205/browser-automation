"use client"

import { useState } from "react"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

import { InspectorPanel } from "@/features/workflows/components/inspector-panel"
import {
  LogsPanel,
  type StepSelection,
} from "@/features/workflows/components/logs-panel"
import { useWorkflowRuns } from "@/features/workflows/components/workflow-runs-provider"

// The console under the canvas: the logs list, plus an output view beside it
// (with a draggable divider) while a step is selected. Owns which step is
// selected; clicking the selected step again clears it.
export function ConsolePanel() {
  const [selected, setSelected] = useState<StepSelection | null>(null)
  const runs = useWorkflowRuns()

  const selectedRun = selected && runs.find((run) => run.id === selected.runId)
  const selectedStep = selectedRun?.steps.find(
    (step) => step.nodeId === selected?.nodeId
  )

  return (
    <ResizablePanelGroup orientation="horizontal" className="bg-background">
      <ResizablePanel id="logs" minSize="12rem">
        <LogsPanel
          selected={selected}
          onSelect={(next) =>
            setSelected((current) =>
              current?.runId === next.runId && current.nodeId === next.nodeId
                ? null
                : next
            )
          }
        />
      </ResizablePanel>
      {selectedRun && selectedStep && (
        <>
          <ResizableHandle />
          <ResizablePanel id="inspector" minSize="12rem">
            <InspectorPanel run={selectedRun} step={selectedStep} />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  )
}
