This is NOT the Next.js you know
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in node_modules/next/dist/docs/ before writing any code. Heed deprecation notices.

Database types

Derive database types from the Drizzle schema — never hand-write custom or partial shapes for table rows. Export typeof table.$inferSelect (and $inferInsert when needed) from lib/schema.ts and import it. When a consumer needs only some columns, narrow with Pick<Row, ...> / Omit<Row, ...> rather than redeclaring a literal type. Don't add an insert type where db.insert(...).values() already enforces the shape.

<!-- TRIGGER.DEV SKILLS START -->
## Trigger.dev agent skills

This project has Trigger.dev agent skills installed in `.claude/skills/`. Before writing or changing Trigger.dev code (background tasks, scheduled tasks, realtime, or chat.agent AI agents), load the most relevant skill: `trigger-cost-savings`, `trigger-chat-agent-advanced`, `trigger-authoring-tasks`, `trigger-authoring-chat-agent`, `trigger-realtime-and-frontend`, `trigger-getting-started`.
<!-- TRIGGER.DEV SKILLS END -->
