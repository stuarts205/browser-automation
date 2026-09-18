import Link from "next/link"
import { ArrowLeft, SearchX } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-start gap-2 p-4">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchX />
          </EmptyMedia>
          <EmptyTitle>Workflow not found</EmptyTitle>
          <EmptyDescription>
            This workflow does not exist or may have been deleted.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href="/">
              <ArrowLeft />
              Back to dashboard
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
