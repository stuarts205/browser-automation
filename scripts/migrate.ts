import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

config({ path: ".env.local" });

// Runs migrations over the Neon HTTP driver instead of `drizzle-kit migrate`,
// since raw Postgres (port 5432) connections are blocked on this network.
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

await migrate(db, { migrationsFolder: "./drizzle" });
console.log("Migrations applied.");
