"use client"
import { Plus, Workflow as WorkflowIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { generateSlug } from "@/features/workflows/lib/generate-slug"
import type { Workflow } from "@/lib/db/schema"
import { useTransition } from "react"

interface WorkflowNavProps {
  workflows: Workflow[]
  createWorkflowAction: (name: string) => Promise<void>
}

export function WorkflowNav({
  workflows,
  createWorkflowAction,
}: WorkflowNavProps) {
  const { state } = useSidebar()
  const [isPending, startTransition] = useTransition()

  function handleCreateWorkflow() {
    startTransition(async () => {
      await createWorkflowAction(generateSlug())
    })
  }

  if (state === "collapsed") {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Popover>
                <PopoverTrigger asChild>
                  <SidebarMenuButton size="lg">
                    <WorkflowIcon />
                  </SidebarMenuButton>
                </PopoverTrigger>
                <PopoverContent side="right" align="start" className="p-2">
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton size="lg" onClick={handleCreateWorkflow} disabled={isPending}>
                        <Plus />
                        <span>New workflow</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                  <SidebarSeparator />
                  <SidebarMenu>
                    {workflows.map((workflow) => (
                      <SidebarMenuItem key={workflow.id}>
                        <SidebarMenuButton size="lg">
                          <span>{workflow.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </PopoverContent>
              </Popover>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workflows</SidebarGroupLabel>
      <SidebarGroupAction title="New workflow" asChild>
        <Button variant="ghost" size="icon-sm" onClick={handleCreateWorkflow} disabled={isPending}>
          <Plus />
          <span className="sr-only">New workflow</span>
        </Button>
      </SidebarGroupAction>
      <SidebarGroupContent>
        <SidebarMenu className="gap-y-0.5">
          {workflows.map((workflow) => (
            <SidebarMenuItem key={workflow.id}>
              <SidebarMenuButton size="lg">
                <span>{workflow.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
