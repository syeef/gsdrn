// import type { Config } from "drizzle-kit";

// export default {
//   out: "./drizzle",
//   schema: ["./database/schema.ts"],
//   dialect: "sqlite",
//   driver: "d1-http",
//   dbCredentials: {
//     databaseId: process.env.CLOUDFLARE_DATABASE_ID,
//     accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
//     token: process.env.CLOUDFLARE_TOKEN!,
//   },
// } satisfies Config;

import { drizzleD1Config } from "@deox/drizzle-d1-utils";

// https://orm.drizzle.team/docs/drizzle-config-file
export default drizzleD1Config(
  {
    out: "./drizzle",
    schema: ["./database/schema.ts"],
  },
  {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    apiToken: process.env.CLOUDFLARE_TOKEN,
    binding: process.env.CLOUDFLARE_D1_DATABASE_BINDING,
    remote: process.env.REMOTE === "true" || process.env.REMOTE === "1",
    environment: process.env.ENV,
  },
);
