import {
  type MetaFunction,
  type LoaderFunctionArgs,
  useLoaderData,
  redirect,
} from "react-router";
import { getAuth } from "~/lib/auth.server";
import AppPage, { type AppUserData } from "~/components/pages/AppPage/AppPage";
import { isValidDateKey } from "~/utils/date";

export const meta: MetaFunction = () => [
  { title: "Tickatana" },
  { name: "description", content: "Where Tasks Get Done" },
];

type LoaderData = AppUserData & { dateKey: string };

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  const auth = getAuth(context);
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    throw redirect("/login");
  }

  const dateKey = params.date;
  if (!isValidDateKey(dateKey)) {
    throw redirect("/today");
  }

  const { user } = session;

  return {
    firstName: (user as any).firstName ?? null,
    lastName: (user as any).lastName ?? null,
    email: (user as any).email,
    image: (user as any).image ?? null,
    dateKey,
  } satisfies LoaderData;
}

export default function AppDateRoute() {
  const data = useLoaderData<typeof loader>();
  return <AppPage user={data} dateKey={data.dateKey} />;
}
