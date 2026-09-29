import { and, desc, eq } from "drizzle-orm"
import { db } from "../../lib/db"
import * as schema from "../../lib/db/schema"
import { workflows } from "../../lib/db/schema"

export function listWorkflows(orgId: string) {
  return db
    .select()
    .from(schema.workflows)
    .where(eq(schema.workflows.orgId, orgId))
    .orderBy(desc(schema.workflows.createdAt))
}

export async function getWorkflow(orgId: string, id: string) {
  const [workflow] = await db
    .select()
    .from(workflows)
    .where(and(eq(workflows.orgId, orgId), eq(workflows.id, id)))

  return workflow
}

export async function createWorkflow(orgId: string, name: string) {
  const [workflow] = await db
    .insert(schema.workflows)
    .values({ orgId, name })
    .returning()

  return workflow
}
