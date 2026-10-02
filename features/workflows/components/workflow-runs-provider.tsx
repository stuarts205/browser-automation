"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"
import { useRealtimeRunsWithTag } from "@trigger.dev/react-hooks"

import type {
  RunStep,
  runWorkflowTask,
} from "@/features/workflows/tasks/run-workflow"

type LatestRunSteps = {
  steps: RunStep[]
  // True while the latest run is queued or executing.
  isLive: boolean
}

const NO_RUN: LatestRunSteps = { steps: [], isLive: false }

const WorkflowRunsContext = createContext<LatestRunSteps | null>(null)

// One realtime subscription to every run of this workflow (they're tagged
// `workflow:<id>` when triggered), shared with anything under it via
// `useLatestRunSteps`. The token is a read-only public access token minted on
// the server.
export function WorkflowRunsProvider({
  workflowId,
  publicAccessToken,
  children,
}: {
  workflowId: string
  publicAccessToken: string
  children: ReactNode
}) {
  const { runs } = useRealtimeRunsWithTag<typeof runWorkflowTask>(
    `workflow:${workflowId}`,
    {
      accessToken: publicAccessToken,
      // The canvas only paints status, so skip each run's payload.
      skipColumns: ["payload"],
    }
  )

  const latest = useMemo<LatestRunSteps>(() => {
    let run: (typeof runs)[number] | undefined
    for (const candidate of runs) {
      if (!run || candidate.createdAt.getTime() > run.createdAt.getTime()) {
        run = candidate
      }
    }
    if (!run) return NO_RUN

    return {
      // A finished run's output is the source of truth; while it's still going
      // (or if it threw and has no output) fall back to the live metadata.
      steps:
        run.output?.steps ?? (run.metadata?.steps as RunStep[] | undefined) ?? [],
      isLive: run.isQueued || run.isExecuting,
    }
  }, [runs])

  return (
    <WorkflowRunsContext.Provider value={latest}>
      {children}
    </WorkflowRunsContext.Provider>
  )
}

// The most recent run's steps and whether it's still live. Empty and not live
// until a run exists.
export function useLatestRunSteps(): LatestRunSteps {
  const value = useContext(WorkflowRunsContext)
  if (!value) {
    throw new Error("useLatestRunSteps must be used within WorkflowRunsProvider")
  }
  return value
}
