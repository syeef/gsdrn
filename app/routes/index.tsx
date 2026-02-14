import * as React from "react";
import {
  NavLink,
  type MetaFunction,
  type LoaderFunctionArgs,
  redirect,
} from "react-router";
import styles from "../styles/index.module.css";
import { getAuth } from "~/lib/auth.server";
import Title from "~/components/ui/Title/Title";

export const meta: MetaFunction = () => [
  { title: "GSDRN" },
  { name: "description", content: "Get Shit Done Right Now" },
];

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  if (url.pathname !== "/") return null;

  const auth = getAuth(context);
  const session = await auth.api.getSession({ headers: request.headers });

  if (session) {
    throw redirect("/app");
  }

  return null;
}

export default function IndexPage() {
  return (
    <>
      <div className={styles.container}>
        <div className={styles.heroContainer}>
          <div className={styles.heroTextContainer}>
            <Title
              as="h1"
              variant="GoogleSans"
              headingColor="orange"
              className={styles.heroText}
            >
              Be productive, feel great.
            </Title>
          </div>
          <div className={styles.heroContent}></div>
          <div className={styles.heroLaptop}></div>
          <div className={styles.heroBackground}></div>
        </div>

        <div>
          <ul>
            <NavLink to="/signup">Sign Up</NavLink>
            <NavLink to="/login">Login</NavLink>
          </ul>
        </div>
      </div>
    </>
  );
}

// export { IndexPage };
