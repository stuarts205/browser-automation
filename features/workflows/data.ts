import { desc, eq } from "drizzle-orm"
import { db } from "../../lib/db"
import * as schema from "../../lib/db/schema"

export function listWorkflows(orgId: string) {
  return db
    .select()
    .from(schema.workflows)
    .where(eq(schema.workflows.orgId, orgId))
    .orderBy(desc(schema.workflows.createdAt))
}

export async function createWorkflow(orgId: string, name: string) {
  const [workflow] = await db
    .insert(schema.workflows)
    .values({ orgId, name })
    .returning()

  return workflow
}
