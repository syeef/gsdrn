import {
  type LoaderFunctionArgs,
  type MetaFunction,
  Link,
  redirect,
  useLoaderData,
} from "react-router";
import Header from "~/components/ui/Header/Header";
import { getAuth } from "~/lib/auth.server";
import styles from "~/styles/placeholders.module.css";

export const meta: MetaFunction = () => [
  { title: "Notes | Tickatana" },
  { name: "description", content: "Notes page coming soon." },
];

type LoaderData = {
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    image: string | null;
  };
};

export async function loader({
  request,
  context,
}: LoaderFunctionArgs): Promise<LoaderData> {
  const auth = getAuth(context);
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    throw redirect("/login");
  }

  const { user } = session;

  return {
    user: {
      firstName: (user as any).firstName ?? null,
      lastName: (user as any).lastName ?? null,
      email: (user as any).email,
      image: (user as any).image ?? null,
    },
  };
}

export default function NotesRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className={styles.page}>
      <Header user={data.user} title="Notes" />
      <main className={styles.content}>
        <section className={styles.card}>
          <h1 className={styles.title}>Notes page coming soon</h1>
          <p className={styles.body}>
            This section is a placeholder while the dedicated Notes experience
            is being built.
          </p>
          <Link to="/today" className={styles.link} prefetch="intent">
            Go to today
          </Link>
        </section>
      </main>
    </div>
  );
}
