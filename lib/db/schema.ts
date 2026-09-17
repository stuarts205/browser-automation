import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Example table — replace with your real schema.
export const todos = pgTable("todos", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  done: boolean("done").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
