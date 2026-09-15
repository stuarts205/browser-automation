import { OrganizationSwitcher, UserButton } from "@clerk/nextjs"
import { Plus, Workflow } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader className="flex-row items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
        <OrganizationSwitcher
          hidePersonal={false}
          appearance={{
            elements: {
              rootBox: "min-w-0 group-data-[collapsible=icon]:!hidden",
              organizationSwitcherTrigger:
                "w-full justify-between gap-2 rounded-md p-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            },
          }}
        />
        <SidebarTrigger className="shrink-0" />
      </SidebarHeader>
      <SidebarContent>
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
                  <SidebarMenuButton
                    size="lg"
                    isActive={index === 0}
                    tooltip={workflow}
                  >
                    <Workflow />
                    <span className="group-data-[collapsible=icon]:hidden">
                      {workflow}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:items-center">
        <UserButton
          appearance={{
            elements: {
              rootBox: "w-full",
              userButtonTrigger:
                "w-full justify-start group-data-[collapsible=icon]:justify-center",
              userButtonOuterIdentifier: "group-data-[collapsible=icon]:hidden",
            },
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
