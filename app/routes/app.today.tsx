import * as React from "react";
import type { LoaderFunctionArgs } from "react-router";
import { useNavigate } from "react-router";
import { formatDateKey } from "~/utils/date";

export async function loader(_args: LoaderFunctionArgs) {
  return null;
}

export default function AppTodayRoute() {
  const navigate = useNavigate();

  React.useEffect(() => {
    // "Today" must be derived in the browser so it matches the todos loader's
    // rollover target and the date the user actually expects to see.
    navigate(`/${formatDateKey(new Date())}`, { replace: true });
  }, [navigate]);

  return null;
}
