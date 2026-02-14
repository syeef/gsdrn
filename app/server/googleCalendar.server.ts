// ~/server/googleCalendar.server.ts
import type { DB } from "~/utils/db.service.server";
import { account, type Account } from "~/database/schema";
import { and, eq } from "drizzle-orm";

type GoogleEnv = {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
};

async function ensureGoogleAccessToken(
  db: DB,
  env: GoogleEnv,
  accountRow: Pick<
    Account,
    "id" | "accessToken" | "refreshToken" | "accessTokenExpiresAt"
  >
) {
  const nowSeconds = Math.floor(Date.now() / 1000);

  const expiresAtSeconds = accountRow.accessTokenExpiresAt
    ? Math.floor(accountRow.accessTokenExpiresAt.getTime() / 1000)
    : null;

  if (
    accountRow.accessToken &&
    expiresAtSeconds &&
    expiresAtSeconds - 60 > nowSeconds
  ) {
    return accountRow.accessToken;
  }

  if (!accountRow.refreshToken) {
    throw new Error("No refresh token stored for Google account");
  }

  const body = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: accountRow.refreshToken,
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Google token refresh failed:", text);
    throw new Error("Failed to refresh Google access token");
  }

  const data = await res.json<{
    access_token: string;
    expires_in: number;
    token_type: string;
  }>();

  const newAccessToken = data.access_token;
  const newExpiresAt = new Date((nowSeconds + data.expires_in) * 1000);

  await db
    .update(account)
    .set({
      accessToken: newAccessToken,
      accessTokenExpiresAt: newExpiresAt,
    })
    .where(eq(account.id, accountRow.id));

  return newAccessToken;
}

export async function listUpcomingEventsForUser(
  db: DB,
  env: GoogleEnv,
  userId: string,
  options?: { dateKey?: string; tzOffsetMinutes?: number }
) {
  // 1) If there's no Google account linked, just say not connected
  const accountRow = await db.query.account.findFirst({
    where: (tbl, ops) =>
      ops.and(ops.eq(tbl.userId, userId), ops.eq(tbl.providerId, "google")),
  });

  if (!accountRow || (!accountRow.accessToken && !accountRow.refreshToken)) {
    return { connected: false, events: [] as any[] };
  }

  let accessToken: string;
  try {
    accessToken = await ensureGoogleAccessToken(db, env, {
      id: accountRow.id,
      accessToken: accountRow.accessToken,
      refreshToken: accountRow.refreshToken,
      accessTokenExpiresAt: accountRow.accessTokenExpiresAt,
    });
  } catch (err) {
    // Failed to refresh (revoked, no permission, etc.)
    console.error("Error ensuring Google access token:", err);
    return { connected: false, events: [] as any[] };
  }

  let timeMin: string;
  let timeMax: string;

  if (options?.dateKey) {
    const [year, month, day] = options.dateKey.split("-").map(Number);
    const fallbackOffset = new Date(year, month - 1, day).getTimezoneOffset();
    const offsetMinutes =
      options.tzOffsetMinutes ?? fallbackOffset ?? 0;
    const startUtcMs =
      Date.UTC(year, month - 1, day, 0, 0, 0) + offsetMinutes * 60 * 1000;
    const endUtcMs = startUtcMs + 24 * 60 * 60 * 1000;
    timeMin = new Date(startUtcMs).toISOString();
    timeMax = new Date(endUtcMs).toISOString();
  } else {
    // Time window: today + tomorrow
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfTomorrow = new Date(startOfToday);
    endOfTomorrow.setDate(endOfTomorrow.getDate() + 2);

    timeMin = startOfToday.toISOString();
    timeMax = endOfTomorrow.toISOString();
  }

  // 2) Fetch calendar list
  const calendarListRes = await fetch(
    "https://www.googleapis.com/calendar/v3/users/me/calendarList",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!calendarListRes.ok) {
    const text = await calendarListRes.text();
    console.error(
      "Failed to fetch calendar list:",
      calendarListRes.status,
      text
    );

    // If it's a permission/auth issue, treat as "not connected"
    if (calendarListRes.status === 401 || calendarListRes.status === 403) {
      return { connected: false, events: [] as any[] };
    }

    throw new Error("Failed to fetch calendar list");
  }

  const calendarListData = await calendarListRes.json();
  const calendars: any[] = calendarListData.items ?? [];

  const allEvents: any[] = [];

  for (const cal of calendars) {
    const calendarId = cal.id as string;

    const params = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "50",
    });

    const eventsRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        calendarId
      )}/events?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!eventsRes.ok) {
      const text = await eventsRes.text();
      console.error(
        `Failed to fetch events for calendar ${calendarId}:`,
        eventsRes.status,
        text
      );

      // If one calendar is forbidden, just skip it
      if (eventsRes.status === 401 || eventsRes.status === 403) {
        continue;
      }

      continue;
    }

    const eventsData = await eventsRes.json();
    const items: any[] = eventsData.items ?? [];

    for (const event of items) {
      allEvents.push({
        ...event,
        _calendarId: calendarId,
        _calendarSummary: cal.summary,
      });
    }
  }

  allEvents.sort((a, b) => {
    const aStart = a.start?.dateTime ?? a.start?.date;
    const bStart = b.start?.dateTime ?? b.start?.date;
    const aTime = aStart ? new Date(aStart).getTime() : 0;
    const bTime = bStart ? new Date(bStart).getTime() : 0;
    return aTime - bTime;
  });

  return {
    connected: true,
    events: allEvents,
  };
}
