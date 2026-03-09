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
  const typedUser = session.user as { id: string };
  const url = new URL(request.url);
  const dateParam = url.searchParams.get("date");
  const tzOffsetParam = url.searchParams.get("tzOffset");
  const tzOffset = tzOffsetParam ? Number(tzOffsetParam) : undefined;
  const dateKey =
    isValidDateKey(dateParam) && typeof dateParam === "string"
      ? dateParam
      : undefined;
  const tzOffsetMinutes =
    tzOffset !== undefined && Number.isFinite(tzOffset)
      ? tzOffset
      : undefined;

  try {
    const result = await listUpcomingEventsForUser(
      db,
      {
        GOOGLE_CLIENT_ID: context.cloudflare.env.GOOGLE_CLIENT_ID as string,
        GOOGLE_CLIENT_SECRET: context.cloudflare.env
          .GOOGLE_CLIENT_SECRET as string,
      },
      typedUser.id,
      { dateKey, tzOffsetMinutes }
    );

    // Normalize just in case
    if (!result || typeof result.connected !== "boolean") {
      return Response.json({
        connected: false,
        events: [],
        calendarStats: { totalCalendars: 0, visibleCalendars: 0 },
      });
    }

    return Response.json(result);
  } catch (err) {
    console.error("Error in getGoogleCalendarEvents loader:", err);
    // Last-resort safety: never blow up the UI for calendar issues
    return Response.json({
      connected: false,
      events: [],
      calendarStats: { totalCalendars: 0, visibleCalendars: 0 },
    });
  }
}
