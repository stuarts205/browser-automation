import { auth } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"
import { auth as triggerAuth } from "@trigger.dev/sdk"
import { ReactFlowProvider } from "@xyflow/react"

import { liveblocks } from "@/lib/liveblocks"
import { getWorkflow } from "@/features/workflows/data"
import { Room } from "@/features/workflows/components/room"
import { WorkflowRunsProvider } from "@/features/workflows/components/workflow-runs-provider"
import { WorkflowShell } from "@/features/workflows/components/workflow-shell"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { orgId } = await auth()
  if (!orgId) notFound()

  const workflow = await getWorkflow(orgId, id)
  if (!workflow) notFound()

  // Rooms are private by default under ID-token auth. Grant write access to the
  // owning org, matching the `groupIds: [orgId]` issued by the auth endpoint.
  await liveblocks.getOrCreateRoom(id, {
    organizationId: orgId,
    defaultAccesses: [],
    groupsAccesses: {
      [orgId]: ["room:write"],
    },
    metadata: {
      title: workflow.name,
    },
  })

  // Read-only token the browser uses to watch this workflow's runs live. Scoped
  // to the `workflow:<id>` tag that runs are triggered with, so it can't read
  // any other workflow's runs (or trigger anything).
  const publicAccessToken = await triggerAuth.createPublicToken({
    scopes: { read: { tags: [`workflow:${id}`] } },
    expirationTime: "1h",
  })

  // The provider sits above both the canvas and the sidebar so the palette can
  // reach the canvas's React Flow store.
  return (
    <ReactFlowProvider>
      <Room roomId={id}>
        <WorkflowRunsProvider
          workflowId={id}
          publicAccessToken={publicAccessToken}
        >
          <WorkflowShell workflowId={id} />
        </WorkflowRunsProvider>
      </Room>
    </ReactFlowProvider>
  )
}
