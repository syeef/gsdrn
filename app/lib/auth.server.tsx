import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { Kysely, CamelCasePlugin } from "kysely";
import { D1Dialect } from "@noxharmonium/kysely-d1";
import { redirect, type AppLoadContext } from "react-router";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { Resend } from "resend";
import { APIError } from "better-auth/api";

import { renderToStaticMarkup } from "react-dom/server";
// import EmailsLogin from "~/components/ui/EmailsLogin/EmailsLogin";
import { getDbFromContext } from "~/utils/db.service.server";

let authInstance: any | undefined; // or `unknown`, then assert when you return

export function createBetterAuth(
  database: BetterAuthOptions["database"],
  env: {
    BETTER_AUTH_SECRET: string;
    RESEND_API_KEY: string;
    RESEND_FROM: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
  }
) {
  const kysely = (database as any).db as Kysely<any>; // optionally type your DB

  return betterAuth({
    database,
    emailAndPassword: { enabled: true },
    secret: env.BETTER_AUTH_SECRET,
    socialProviders: {
      google: {
        // prompt: "select_account consent",
        prompt: "select_account",
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        accessType: "offline",
        scope: [
          "openid",
          "email",
          "profile",
          "https://www.googleapis.com/auth/calendar.readonly",
        ],
      },
    },
    plugins: [
      // magicLink({
      //   sendMagicLink: async ({ email, url }) => {
      //     // const env = (request as any)?.cf?.env ?? (request as any)?.env ?? {};
      //     const apiKey = env.RESEND_API_KEY;
      //     const from = env.RESEND_FROM; // e.g. "Evroc <auth@yourdomain.com>"
      //     if (!apiKey || !from) {
      //       console.error("Missing RESEND_API_KEY or RESEND_FROM");
      //       return;
      //     }
      //     const row = await kysely
      //       .selectFrom("user")
      //       .select(["first_name as firstName", "name"])
      //       .where("email", "=", email)
      //       .executeTakeFirst();
      //     const greeting =
      //       row?.firstName ?? row?.name?.split(/\s+/)[0] ?? "there";
      //     const resend = new Resend(apiKey);
      //     // Simple HTML + text
      //     const subject = "Log in to evroc";
      //     const text = `Log in by clicking this link: ${url}`;
      //     const html = renderToStaticMarkup(
      //       <EmailsLogin
      //         firstName={greeting}
      //         actionUrl={url}
      //         expiryHours={72}
      //         supportEmail="support@evroc.com"
      //       />
      //     );
      //     await resend.emails.send({
      //       from,
      //       to: email,
      //       subject,
      //       html,
      //       text,
      //     });
      //   },
      // }),
    ],
    user: {
      additionalFields: {
        firstName: {
          type: "string",
          required: true,
        },
        lastName: {
          type: "string",
          required: true,
        },
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (payload /* user data from signup */) => {
            // If first/last aren’t explicitly provided (e.g., magic link), derive them from `name`
            if (!payload.firstName || !payload.lastName) {
              const full = (payload.name ?? "").trim();
              const [first = "", ...rest] = full.split(/\s+/);
              const last = rest.join(" ").trim();

              if (!first || !last) {
                // you can be looser if you prefer; here we require both
                // throw new APIError("BAD_REQUEST", {
                //   message:
                //     "Please provide a first and last name when requesting a magic link.",
                // });
                redirect("/auth/new-user");
              }

              return {
                data: {
                  ...payload,
                  firstName: payload.firstName ?? first,
                  lastName: payload.lastName ?? last,
                },
              };
            }
            return { data: payload };
          },
        },
      },
    },
  });
}

export function getAuth(ctx: AppLoadContext) {
  if (!authInstance) {
    authInstance = createBetterAuth(
      {
        db: new Kysely({
          dialect: new D1Dialect({ database: ctx.cloudflare.env.DB }),
          plugins: [new CamelCasePlugin()],
        }),
        type: "sqlite",
      },
      ctx.cloudflare.env as any
    );
  }
  // If you want typings here, assert once at the boundary:
  return authInstance as ReturnType<typeof createBetterAuth>;
}
