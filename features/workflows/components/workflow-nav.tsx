"use client"

import { useState } from "react"
import { Plus, Workflow } from "lucide-react"

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

const dummyWorkflows = [
  "dominant-wasp",
  "honest-reindeer",
  "expected-llama",
  "essential-ocelot",
  "creepy-echidna",
  "eastern-silkworm",
  "cultural-lion",
  "proud-weasel",
  "regional-bonobo",
]

export function WorkflowNav() {
  const { state } = useSidebar()
  const [activeWorkflow, setActiveWorkflow] = useState(dummyWorkflows[0])

  if (state === "collapsed") {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Popover>
                <PopoverTrigger asChild>
                  <SidebarMenuButton size="lg">
                    <Workflow />
                  </SidebarMenuButton>
                </PopoverTrigger>
                <PopoverContent side="right" align="start" className="p-2">
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton size="lg">
                        <Plus />
                        <span>New workflow</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                  <SidebarSeparator />
                  <SidebarMenu>
                    {dummyWorkflows.map((workflow, index) => (
                      <SidebarMenuItem key={workflow}>
                        <SidebarMenuButton size="lg" isActive={index === 0}>
                          <span>{workflow}</span>
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
        <Button variant="ghost" size="icon-sm">
          <Plus />
          <span className="sr-only">New workflow</span>
        </Button>
      </SidebarGroupAction>
      <SidebarGroupContent>
        <SidebarMenu className="gap-y-0.5">
          {dummyWorkflows.map((workflow, index) => (
            <SidebarMenuItem key={workflow}>
              <SidebarMenuButton size="lg" isActive={index === 0}>
                <span>{workflow}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
