import { redirect, type ActionFunctionArgs } from "react-router";
import { getAuth } from "~/lib/auth.server";

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = getAuth(context);

  // Call Better Auth's sign-out endpoint as a Response
  const res = await auth.api.signOut({
    asResponse: true,
    headers: { cookie: request.headers.get("cookie") ?? "" },
  });

  // Forward the cookie-clearing header to the browser
  const setCookie = res.headers.get("set-cookie");
  return redirect("/login", {
    headers: setCookie ? { "Set-Cookie": setCookie } : undefined,
  });
}

// This route doesn’t render a UI
export default function SignOut() {
  return null;
}
