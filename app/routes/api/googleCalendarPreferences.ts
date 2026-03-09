import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { getAuth } from "~/lib/auth.server";
import {
  getGoogleProviderAccountIdForUser,
  listGoogleCalendarsWithVisibilityForUser,
  upsertGoogleCalendarVisibilityPreference,
} from "~/server/googleCalendar.server";
import { getDbFromContext } from "~/utils/db.service.server";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export async function loader({ request, context }: LoaderFunctionArgs) {
  const auth = getAuth(context);
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const db = getDbFromContext(context);
  const typedUser = session.user as { id: string };

  try {
    const result = await listGoogleCalendarsWithVisibilityForUser(
      db,
      {
        GOOGLE_CLIENT_ID: context.cloudflare.env.GOOGLE_CLIENT_ID as string,
        GOOGLE_CLIENT_SECRET: context.cloudflare.env
          .GOOGLE_CLIENT_SECRET as string,
      },
      typedUser.id,
    );

    if (!result.connected) {
      return Response.json({ connected: false, calendars: [] });
    }

    return Response.json({
      connected: true,
      calendars: result.calendars.map((calendar) => ({
        ...calendar,
        visible:
          result.visibilityByCalendarId.get(calendar.calendarId) ??
          calendar.selectedByGoogle,
      })),
    });
  } catch (err) {
    console.error("Error in googleCalendarPreferences loader:", err);
    return Response.json({ connected: false, calendars: [] });
  }
}

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = getAuth(context);
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return Response.json(
      { ok: false, error: "Invalid payload" },
      { status: 400 },
    );
  }

  const { calendarId, visible } = payload as {
    calendarId?: unknown;
    visible?: unknown;
  };

  if (!isNonEmptyString(calendarId) || typeof visible !== "boolean") {
    return Response.json(
      { ok: false, error: "Invalid parameters" },
      { status: 400 },
    );
  }

  const db = getDbFromContext(context);
  const typedUser = session.user as { id: string };

  try {
    const providerAccountId = await getGoogleProviderAccountIdForUser(
      db,
      typedUser.id,
    );

    if (!providerAccountId) {
      return Response.json(
        { ok: false, error: "Google Calendar not connected" },
        { status: 400 },
      );
    }

    await upsertGoogleCalendarVisibilityPreference(db, {
      userId: typedUser.id,
      providerAccountId,
      calendarId: calendarId.trim(),
      visible,
    });

    return Response.json({
      ok: true,
      calendarId: calendarId.trim(),
      visible,
    });
  } catch (err) {
    console.error("Error in googleCalendarPreferences action:", err);
    return Response.json(
      { ok: false, error: "Failed to update calendar preference" },
      { status: 500 },
    );
  }
}
