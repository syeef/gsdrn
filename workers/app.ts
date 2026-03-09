import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import { createRequestHandler } from "react-router";
import * as schema from "../database/schema";
import { reconcileOverdueScheduledTasksForAllUsers } from "../app/server/taskScheduling.server";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
    db: DrizzleD1Database<typeof schema>;
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  async fetch(request, env, ctx) {
    const db = drizzle(env.DB, { schema });

    return requestHandler(request, {
      cloudflare: { env, ctx },
      db,
    });
  },
  async scheduled(_controller, env, ctx) {
    const db = drizzle(env.DB, { schema });
    ctx.waitUntil(
      (async () => {
        try {
          const result = await reconcileOverdueScheduledTasksForAllUsers(
            db as any,
            env as any,
          );
          console.info("taskScheduling.cron.reconcile", result);
        } catch (error) {
          console.error("taskScheduling.cron.failed", error);
        }
      })(),
    );
  },
} satisfies ExportedHandler<Env>;
