import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { formatDateKey } from "~/utils/date";

export async function loader(_args: LoaderFunctionArgs) {
  const dateKey = formatDateKey(new Date());
  throw redirect(`/${dateKey}`);
}

export default function AppTodayRoute() {
  return null;
}
