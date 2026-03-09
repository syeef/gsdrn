import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type LoaderFunctionArgs,
} from "react-router";
import { getAuth } from "~/lib/auth.server";

import { eq } from "drizzle-orm";
import { userExt } from "~/database/schema";
import type { UserTier } from "~/database/schema";
import { getDbFromContext } from "~/utils/db.service.server";
import { resolveUserTier } from "~/utils/tier.server";
import { TRIAL_DURATION_MS } from "~/utils/tier";

import type { Route } from "./+types/root";
import "./app.css";
import "./styles/tokens.css";

// export async function loader({ request, context }: LoaderFunctionArgs) {
//   const auth = getAuth(context);
//   const session = await auth.api.getSession({
//     headers: { cookie: request.headers.get("cookie") ?? "" },
//   });

//   return { user: session?.user ?? null };
// }

export async function loader({ request, context }: LoaderFunctionArgs) {
  const auth = getAuth(context);
  const db = getDbFromContext(context);
  const session = await auth.api.getSession({
    // headers: { cookie: request.headers.get("cookie") ?? "" },
    headers: request.headers,
  });
  const user = session?.user ?? null;

  let onboarding: { status: string; choice?: string | null } | null = null;
  let tier: UserTier | null = null;
  let trialEndsAt: string | null = null;

  if (user) {
    const ext = await db.query.userExt.findFirst({
      where: eq(userExt.userId, user.id),
    });
    onboarding = ext
      ? { status: ext.onboardingStatus, choice: ext.onboardingChoice }
      : { status: "pending" };

    const typedUser = user as { id: string; createdAt: Date };
    const storedTier = (ext?.tier ?? "free") as UserTier;
    tier = await resolveUserTier(typedUser, storedTier, db);
    if (tier === "trial") {
      trialEndsAt = new Date(
        typedUser.createdAt.getTime() + TRIAL_DURATION_MS,
      ).toISOString();
    }
  }

  return { user, onboarding, tier, trialEndsAt };
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,200..900;1,200..900&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Default favicon (fallback for unsupported browsers) */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />

        {/* Light mode favicon */}
        <link
          rel="icon"
          href="/favicon.ico"
          type="image/x-icon"
          media="(prefers-color-scheme: light)"
        />

        {/* Dark mode favicon */}
        <link
          rel="icon"
          href="/favicon.ico"
          type="image/x-icon"
          media="(prefers-color-scheme: dark)"
        />

        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
