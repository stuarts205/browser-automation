import type { Stagehand } from "@browserbasehq/stagehand"

export async function extract({
  stagehand,
  instruction,
}: {
  stagehand: Stagehand
  instruction: string
}) {
  // With no schema, Stagehand returns the answer as a single string.
  const { extraction } = await stagehand.extract(instruction)

  return { extraction }
}
