"use client"

import { useRealtimeRun } from "@trigger.dev/react-hooks"
import { PlayIcon } from "lucide-react"
import { useState, useTransition } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import type { runWorkflowAction } from "@/features/workflows/actions"
import type { helloWorldTask } from "@/trigger/example"

type RunHandle = Awaited<ReturnType<typeof runWorkflowAction>>

interface RightSidebarProps {
  workflowId: string
  runWorkflowAction: (workflowId: string) => Promise<RunHandle>
}

const FINISHED_STATUSES = new Set([
  "COMPLETED",
  "CANCELED",
  "FAILED",
  "CRASHED",
  "SYSTEM_FAILURE",
  "EXPIRED",
  "TIMED_OUT",
])

export function RightSidebar({
  workflowId,
  runWorkflowAction,
}: RightSidebarProps) {
  const [isPending, startTransition] = useTransition()
  const [runHandle, setRunHandle] = useState<RunHandle | null>(null)

  const { run, error } = useRealtimeRun<typeof helloWorldTask>(
    runHandle?.runId,
    {
      accessToken: runHandle?.publicAccessToken,
      enabled: !!runHandle,
      skipColumns: ["payload"],
    }
  )

  const isRunning = !!runHandle && (!run || !FINISHED_STATUSES.has(run.status))

  function handleRun() {
    startTransition(async () => {
      setRunHandle(await runWorkflowAction(workflowId))
    })
  }

  return (
    <div className="flex size-full flex-col gap-4 p-4">
      <Button onClick={handleRun} disabled={isPending || isRunning}>
        {isPending || isRunning ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <PlayIcon data-icon="inline-start" />
        )}
        Run
      </Button>

      {runHandle && (
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Status</span>
            <Badge
              variant={
                run?.status === "COMPLETED"
                  ? "default"
                  : run && FINISHED_STATUSES.has(run.status)
                    ? "destructive"
                    : "secondary"
              }
            >
              {run?.status ?? "PENDING"}
            </Badge>
          </div>
          {run?.output && <p>{run.output.message}</p>}
          {run?.error && (
            <p className="text-destructive">{run.error.message}</p>
          )}
          {error && <p className="text-destructive">{error.message}</p>}
          <p className="truncate font-mono text-xs text-muted-foreground">
            {runHandle.runId}
          </p>
        </div>
      )}
    </div>
  )
}
