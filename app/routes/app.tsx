// ~/routes/app.tsx
import {
  type MetaFunction,
  type LoaderFunctionArgs,
  redirect,
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
    throw redirect("/login");
  }

  const dateKey = formatDateKey(new Date());
  throw redirect(`/${dateKey}`);
}

export default function AppRoute() {
  return null;
}
