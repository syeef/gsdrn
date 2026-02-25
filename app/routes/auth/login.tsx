import {
  Form,
  redirect,
  data,
  useActionData,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "react-router";
import { motion, AnimatePresence } from "motion/react";
import ButtonSignInWithGoogle from "~/components/ui/ButtonSignInWithGoogle/ButtonSignInWithGoogle";
import { getAuth } from "~/lib/auth.server";
import { LogoMark } from "~/components/ui/Icons/Icons";
import Title from "~/components/ui/Title/Title";

import styles from "../../styles/login.module.css";

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

const staggerParent = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      duration: 0.6, // page fade
      ease: "easeInOut",
      when: "beforeChildren",
      staggerChildren: 0.18, // gap between the 3 sections
    },
  },
};

const fadeItem = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function LogIn() {
  const actionData = useActionData<typeof action>();
  return (
    // <main
    //   style={{ maxWidth: 400, margin: "4rem auto", fontFamily: "sans-serif" }}
    // >
    //   <h1>Log in to App</h1>
    //   <Form method="post">
    //     <p>
    //       <label>
    //         Email
    //         <br />
    //         <input type="email" name="email" required />
    //       </label>
    //     </p>
    //     <p>
    //       <label>
    //         Password
    //         <br />
    //         <input type="password" name="password" required />
    //       </label>
    //     </p>
    //     {actionData?.error && (
    //       <p style={{ color: "red" }}>{actionData.error}</p>
    //     )}
    //     <button type="submit">Continue to App</button>
    //   </Form>

    //   <ButtonSignInWithGoogle />

    //   <p style={{ marginTop: "1rem" }}>
    //     New to App?<a href="/signup">Sign up</a>
    //   </p>
    // </main>

    <main className={styles.loginPage}>
      <div className={styles.container}>
        <div className={styles.illustration}></div>

        <motion.div
          className={styles.page}
          variants={staggerParent}
          initial="hidden"
          animate="show"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "100%",
              justifyContent: "center",
            }}
          >
            <div className={styles.content}>
              <motion.div className={styles.logoContainer} variants={fadeItem}>
                <LogoMark color={"#FFFFFF"} height={32} width={32} />
                <Title variant="Hedvig" as="h2">
                  Log In to Tiketana
                </Title>
              </motion.div>

              <ButtonSignInWithGoogle />
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
