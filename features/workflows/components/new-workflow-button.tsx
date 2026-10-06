"use client"

import { useTransition } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { createWorkflowAction } from "@/features/workflows/actions"
import { generateSlug } from "@/features/workflows/lib/generate-slug"

// Creates a workflow with a generated name. Running inside a transition lets the
// router handle the action's redirect to the new workflow on success.
export function NewWorkflowButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await createWorkflowAction(generateSlug())
        })
      }}
    >
      <Plus />
      New workflow
    </Button>
  )
}
