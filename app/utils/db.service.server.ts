// ~/utils/db.service.server.ts
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import * as authSchema from "~/database/schema";

// --- Merge all tables into one schema object ---
export const dbSchema = {
  ...authSchema,
};

export type DB = DrizzleD1Database<typeof dbSchema>;

// --- Create a D1-bound Drizzle instance from Remix context ---
export function getDbFromContext(context: any): DB {
  const d1 = context?.cloudflare?.env?.DB;
  if (!d1) throw new Error("No database in context.cloudflare.env.DB");
  return drizzle(d1, { schema: dbSchema });
}

// Optional: export individual schema groups if needed elsewhere
export { authSchema };
