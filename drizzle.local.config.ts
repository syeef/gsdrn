import type { Config } from "drizzle-kit";

export default {
  out: "./drizzle",
  schema: ["./database/schema.ts", "./database/productSchema.ts"],
  dialect: "sqlite",
  dbCredentials: {
    url: ".wrangler/state/v3/d1/DB/sqlite.db",
  },
} satisfies Config;
