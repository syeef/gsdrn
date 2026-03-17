// ~/routes/app.tsx
import * as React from "react";
import {
  type MetaFunction,
  type LoaderFunctionArgs,
  useNavigate,
} from "react-router";
import { getAuth } from "~/lib/auth.server";
import { formatDateKey } from "~/utils/date";

export const meta: MetaFunction = () => [
  { title: "Tickatana" },
  { name: "description", content: "Where Tasks Get Done" },
];

export async function loader({ request, context }: LoaderFunctionArgs) {
  const auth = getAuth(context);
  const session = await auth.api.getSession({ headers: request.headers });

  // If not logged in, send them to login
  if (!session) {
    return Response.redirect("/login", 302);
  }

  return null;
}

export default function AppRoute() {
  const navigate = useNavigate();

  React.useEffect(() => {
    // Keep the landing route aligned with the browser's local day; using the
    // server day here can send rollover results to a different page date.
    navigate(`/${formatDateKey(new Date())}`, { replace: true });
  }, [navigate]);

  return null;
}
