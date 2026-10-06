import { Workflow } from "lucide-react"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { NewWorkflowButton } from "@/features/workflows/components/new-workflow-button"

export default function Page() {
  return (
    <div className="flex flex-1 flex-col items-start gap-2 p-4">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Workflow />
          </EmptyMedia>
          <EmptyTitle>No workflow selected</EmptyTitle>
          <EmptyDescription>
            Select a workflow from the sidebar or create a new one to get
            started.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <NewWorkflowButton />
        </EmptyContent>
      </Empty>
    </div>
  )
}
