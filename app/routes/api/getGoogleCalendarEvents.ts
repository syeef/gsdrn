// ~/routes/getGoogleCalendarEvents.ts
import type { LoaderFunctionArgs } from "react-router";

import { getAuth } from "~/lib/auth.server";
import { getDbFromContext } from "~/utils/db.service.server";
import { listUpcomingEventsForUser } from "~/server/googleCalendar.server";
import { isValidDateKey } from "~/utils/date";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const auth = getAuth(context);

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    // Not logged in at all – 401 is fine here
    return new Response("Unauthorized", { status: 401 });
  }

  const db = getDbFromContext(context);
  const url = new URL(request.url);
  const dateParam = url.searchParams.get("date");
  const tzOffsetParam = url.searchParams.get("tzOffset");
  const tzOffset = tzOffsetParam ? Number(tzOffsetParam) : null;
  const dateKey = isValidDateKey(dateParam) ? dateParam : undefined;
  const tzOffsetMinutes = Number.isFinite(tzOffset) ? tzOffset : undefined;

  try {
    const result = await listUpcomingEventsForUser(
      db,
      {
        GOOGLE_CLIENT_ID: context.cloudflare.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: context.cloudflare.env.GOOGLE_CLIENT_SECRET,
      },
      session.user.id,
      { dateKey, tzOffsetMinutes }
    );

    // Normalize just in case
    if (!result || typeof result.connected !== "boolean") {
      return Response.json({ connected: false, events: [] });
    }

    return Response.json(result);
  } catch (err) {
    console.error("Error in getGoogleCalendarEvents loader:", err);
    // Last-resort safety: never blow up the UI for calendar issues
    return Response.json({ connected: false, events: [] });
  }
}
