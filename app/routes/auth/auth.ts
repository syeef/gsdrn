import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { getAuth } from "~/lib/auth.server";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const auth = getAuth(context);
  return auth.handler(request);
}

export async function action({ context, request }: ActionFunctionArgs) {
  const auth = getAuth(context);
  return auth.handler(request);
}
