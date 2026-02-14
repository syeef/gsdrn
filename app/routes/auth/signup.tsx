import {
  Form,
  redirect,
  data,
  useActionData,
  type ActionFunctionArgs,
} from "react-router";
import { getAuth } from "~/lib/auth.server";
// import { getDbFromContext } from "~/utils/db.service.server";

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = getAuth(context);
  const form = await request.formData();

  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(form.get("password") ?? "").trim();
  const firstName = String(form.get("firstName") ?? "").trim();
  const lastName = String(form.get("lastName") ?? "").trim();

  if (!email || !password || !firstName || !lastName) {
    return data({ error: "All fields are required" }, { status: 422 });
  }

  const res = await auth.api.signUpEmail({
    asResponse: true,
    body: { email, password, firstName, lastName },
    headers: { cookie: request.headers.get("cookie") ?? "" },
  });

  if (res.status < 200 || res.status >= 400) {
    return data({ error: "Failed to create account" }, { status: 400 });
  }

  const authSetCookie = res.headers.get("set-cookie") ?? "";
  const location = res.headers.get("location") || "/";

  const headers = new Headers();
  if (authSetCookie) headers.append("Set-Cookie", authSetCookie);

  try {
    const session = await auth.api.getSession({
      headers: { cookie: authSetCookie },
    });
    // const userId = session?.user?.id;
    // if (userId) {
    //   const db = getDbFromContext(context);
    // }
  } catch {}

  throw redirect(location, { headers });
}

export default function SignUp() {
  const actionData = useActionData<typeof action>();
  return (
    <main
      style={{ maxWidth: 400, margin: "4rem auto", fontFamily: "sans-serif" }}
    >
      <h1>Get started with App</h1>
      <Form method="post">
        <p>
          <label>
            First name
            <br />
            <input type="text" name="firstName" required />
          </label>
        </p>
        <p>
          <label>
            Last name
            <br />
            <input type="text" name="lastName" required />
          </label>
        </p>
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
      <p style={{ marginTop: "1rem" }}>
        Have an account? <a href="/login">Log in</a>
      </p>
    </main>
  );
}
