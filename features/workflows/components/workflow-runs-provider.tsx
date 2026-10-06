"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"
import { useRealtimeRunsWithTag } from "@trigger.dev/react-hooks"

import type {
  RunStep,
  runWorkflowTask,
} from "@/features/workflows/tasks/run-workflow"

type RealtimeWorkflowRun = ReturnType<
  typeof useRealtimeRunsWithTag<typeof runWorkflowTask>
>["runs"][number]

// One run of this workflow and what it did, step by step.
export type WorkflowRun = {
  id: string
  createdAt: Date
  // Trigger.dev's run status. Beyond the steps, this is the only way to tell a
  // run that was cancelled or crashed from one that finished.
  status: RealtimeWorkflowRun["status"]
  // True while the run is queued or executing.
  isLive: boolean
  steps: RunStep[]
}

type LatestRunSteps = Pick<WorkflowRun, "steps" | "isLive">

const NO_RUN: LatestRunSteps = { steps: [], isLive: false }

type WorkflowRunsValue = {
  // Every run, newest first.
  runs: WorkflowRun[]
  latest: LatestRunSteps
}

const WorkflowRunsContext = createContext<WorkflowRunsValue | null>(null)

function toWorkflowRun(run: RealtimeWorkflowRun): WorkflowRun {
  return {
    id: run.id,
    createdAt: run.createdAt,
    status: run.status,
    isLive: run.isQueued || run.isExecuting,
    // A finished run's output is the source of truth; while it's still going
    // (or if it threw and has no output) fall back to the live metadata.
    steps:
      run.output?.steps ?? (run.metadata?.steps as RunStep[] | undefined) ?? [],
  }
}

// One realtime subscription to every run of this workflow (they're tagged
// `workflow:<id>` when triggered), shared with anything under it via
// `useWorkflowRuns` and `useLatestRunSteps`. The token is a read-only public
// access token minted on the server.
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
      // Nothing shows a run's payload (just the workflow and org ids), so skip it.
      skipColumns: ["payload"],
    }
  )

  const value = useMemo<WorkflowRunsValue>(() => {
    const workflowRuns = runs
      .map(toWorkflowRun)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return { runs: workflowRuns, latest: workflowRuns[0] ?? NO_RUN }
  }, [runs])

  return (
    <WorkflowRunsContext.Provider value={value}>
      {children}
    </WorkflowRunsContext.Provider>
  )
}

function useWorkflowRunsContext(): WorkflowRunsValue {
  const value = useContext(WorkflowRunsContext)
  if (!value) {
    throw new Error("Workflow run hooks must be used within WorkflowRunsProvider")
  }
  return value
}

// Every run of this workflow with its steps, newest first. Empty until a run
// exists.
export function useWorkflowRuns(): WorkflowRun[] {
  return useWorkflowRunsContext().runs
}

// The most recent run's steps and whether it's still live. Empty and not live
// until a run exists.
export function useLatestRunSteps(): LatestRunSteps {
  return useWorkflowRunsContext().latest
}
