import {
  Form,
  redirect,
  data,
  useActionData,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "react-router";
import ButtonSignInWithGoogle from "~/components/ui/ButtonSignInWithGoogle/ButtonSignInWithGoogle";
import { getAuth } from "~/lib/auth.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const auth = getAuth(context);
  const session = await auth.api.getSession({ headers: request.headers });
  if (session) return redirect("/");
  return null;
}

export async function action({ request, context }: ActionFunctionArgs) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(form.get("password") ?? "").trim();

  if (!email || !password) {
    return data({ error: "Email and password are required" }, { status: 422 });
  }

  const auth = getAuth(context);
  const res = await auth.api.signInEmail({
    asResponse: true,
    body: { email, password },
    headers: { cookie: request.headers.get("cookie") ?? "" },
  });

  if (res.status >= 200 && res.status < 400) {
    const setCookie = res.headers.get("set-cookie") ?? "";
    const location = res.headers.get("location") || "/app";
    throw redirect(location, {
      headers: setCookie ? { "Set-Cookie": setCookie } : undefined,
    });
  }

  return data({ error: "Invalid email or password" }, { status: 401 });
}

export default function LogIn() {
  const actionData = useActionData<typeof action>();
  return (
    <main
      style={{ maxWidth: 400, margin: "4rem auto", fontFamily: "sans-serif" }}
    >
      <h1>Log in to App</h1>
      <Form method="post">
        <p>
          <label>
            Email
            <br />
            <input type="email" name="email" required />
          </label>
        </p>
        <p>
          <label>
            Password
            <br />
            <input type="password" name="password" required />
          </label>
        </p>
        {actionData?.error && (
          <p style={{ color: "red" }}>{actionData.error}</p>
        )}
        <button type="submit">Continue to App</button>
      </Form>

      <ButtonSignInWithGoogle />

      <p style={{ marginTop: "1rem" }}>
        New to App?<a href="/signup">Sign up</a>
      </p>
    </main>
  );
}
