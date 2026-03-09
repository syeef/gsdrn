import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  account,
  googleCalendarPreference,
  type Account,
} from "~/database/schema";
import type { DB } from "~/utils/db.service.server";

export type GoogleEnv = {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
};

type GoogleCalendarListItem = {
  calendarId: string;
  summary: string;
  description: string | null;
  backgroundColor: string | null;
  foregroundColor: string | null;
  accessRole: string | null;
  primary: boolean;
  selectedByGoogle: boolean;
};

type GoogleAccountRow = Pick<
  Account,
  | "id"
  | "accountId"
  | "accessToken"
  | "refreshToken"
  | "accessTokenExpiresAt"
  | "scope"
>;

type GoogleCalendarsWithVisibilityResult = {
  connected: boolean;
  providerAccountId: string | null;
  accessToken: string | null;
  calendars: GoogleCalendarListItem[];
  visibilityByCalendarId: Map<string, boolean>;
};

type GoogleCalendarEventListItem = {
  id?: string;
  summary?: string;
  status?: string;
  transparency?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  _calendarId?: string;
  _calendarSummary?: string;
};

type GoogleEventMutationResult =
  | {
      ok: true;
      calendarId: string;
      eventId: string;
    }
  | {
      ok: false;
      code: "CALENDAR_NOT_CONNECTED" | "REQUEST_FAILED";
      status?: number;
      error?: string;
    };

async function ensureGoogleAccessToken(
  db: DB,
  env: GoogleEnv,
  accountRow: Pick<
    Account,
    "id" | "accessToken" | "refreshToken" | "accessTokenExpiresAt"
  >,
  options?: { forceRefresh?: boolean },
) {
  const forceRefresh = options?.forceRefresh ?? false;
  const nowSeconds = Math.floor(Date.now() / 1000);

  const expiresAtSeconds = accountRow.accessTokenExpiresAt
    ? Math.floor(accountRow.accessTokenExpiresAt.getTime() / 1000)
    : null;

  if (
    !forceRefresh &&
    accountRow.accessToken &&
    (!expiresAtSeconds || expiresAtSeconds - 60 > nowSeconds)
  ) {
    return accountRow.accessToken;
  }

  if (!accountRow.refreshToken) {
    if (accountRow.accessToken) {
      return accountRow.accessToken;
    }
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

async function getGoogleAccountCandidate(
  db: DB,
  userId: string,
): Promise<GoogleAccountRow | null> {
  const accountCandidates = await db.query.account.findMany({
    where: and(eq(account.userId, userId), eq(account.providerId, "google")),
    orderBy: (tbl, ops) => [ops.desc(tbl.updatedAt)],
  });

  const accountRow = accountCandidates.find(
    (candidate) => candidate.accessToken || candidate.refreshToken,
  );

  if (!accountRow || (!accountRow.accessToken && !accountRow.refreshToken)) {
    return null;
  }

  return {
    id: accountRow.id,
    accountId: accountRow.accountId,
    accessToken: accountRow.accessToken,
    refreshToken: accountRow.refreshToken,
    accessTokenExpiresAt: accountRow.accessTokenExpiresAt,
    scope: accountRow.scope,
  };
}

const normalizeCalendarListItem = (raw: any): GoogleCalendarListItem | null => {
  const calendarId =
    typeof raw?.id === "string" && raw.id.trim().length > 0 ? raw.id : null;
  if (!calendarId) return null;

  const summary =
    typeof raw?.summary === "string" && raw.summary.trim().length > 0
      ? raw.summary
      : "Untitled calendar";

  return {
    calendarId,
    summary,
    description: typeof raw?.description === "string" ? raw.description : null,
    backgroundColor:
      typeof raw?.backgroundColor === "string" ? raw.backgroundColor : null,
    foregroundColor:
      typeof raw?.foregroundColor === "string" ? raw.foregroundColor : null,
    accessRole: typeof raw?.accessRole === "string" ? raw.accessRole : null,
    primary: Boolean(raw?.primary),
    selectedByGoogle:
      typeof raw?.selected === "boolean" ? raw.selected : true,
  };
};

type CalendarListFetchResult =
  | {
      connected: false;
    }
  | {
      connected: true;
      accessToken: string;
      calendars: GoogleCalendarListItem[];
    };

async function fetchCalendarListForAccount(
  db: DB,
  env: GoogleEnv,
  accountRow: GoogleAccountRow,
  initialAccessToken: string,
): Promise<CalendarListFetchResult> {
  const fetchCalendarList = (token: string) =>
    fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

  let accessToken = initialAccessToken;
  let calendarListRes = await fetchCalendarList(accessToken);

  if (calendarListRes.status === 401 && accountRow.refreshToken) {
    try {
      accessToken = await ensureGoogleAccessToken(
        db,
        env,
        {
          id: accountRow.id,
          accessToken: accountRow.accessToken,
          refreshToken: accountRow.refreshToken,
          accessTokenExpiresAt: accountRow.accessTokenExpiresAt,
        },
        { forceRefresh: true },
      );
      calendarListRes = await fetchCalendarList(accessToken);
    } catch (err) {
      console.error("Error refreshing Google access token after 401:", err);
      return { connected: false };
    }
  }

  if (!calendarListRes.ok) {
    const text = await calendarListRes.text();
    console.error(
      "Failed to fetch calendar list:",
      calendarListRes.status,
      text,
    );

    if (calendarListRes.status === 401 || calendarListRes.status === 403) {
      return { connected: false };
    }

    throw new Error("Failed to fetch calendar list");
  }

  const calendarListData = await calendarListRes.json<{ items?: any[] }>();
  const calendars = (calendarListData.items ?? [])
    .map(normalizeCalendarListItem)
    .filter(
      (calendar): calendar is GoogleCalendarListItem => calendar !== null,
    )
    .sort((a, b) => {
      if (a.primary !== b.primary) {
        return a.primary ? -1 : 1;
      }
      return a.summary.localeCompare(b.summary);
    });

  return {
    connected: true,
    accessToken,
    calendars,
  };
}

async function resolveCalendarVisibility(
  db: DB,
  userId: string,
  providerAccountId: string,
  calendars: GoogleCalendarListItem[],
): Promise<Map<string, boolean>> {
  const visibilityRows = await db.query.googleCalendarPreference.findMany({
    where: and(
      eq(googleCalendarPreference.userId, userId),
      eq(googleCalendarPreference.providerId, "google"),
      eq(googleCalendarPreference.providerAccountId, providerAccountId),
    ),
  });

  const visibilityByCalendarId = new Map<string, boolean>(
    visibilityRows.map((row) => [row.calendarId, row.isVisible]),
  );

  const now = new Date();
  const missingRows = calendars
    .filter((calendar) => !visibilityByCalendarId.has(calendar.calendarId))
    .map((calendar) => ({
      id: nanoid(),
      userId,
      providerId: "google",
      providerAccountId,
      calendarId: calendar.calendarId,
      isVisible: calendar.selectedByGoogle,
      createdAt: now,
      updatedAt: now,
    }));

  if (missingRows.length > 0) {
    await db
      .insert(googleCalendarPreference)
      .values(missingRows)
      .onConflictDoNothing({
        target: [
          googleCalendarPreference.userId,
          googleCalendarPreference.providerId,
          googleCalendarPreference.providerAccountId,
          googleCalendarPreference.calendarId,
        ],
      });

    for (const row of missingRows) {
      visibilityByCalendarId.set(row.calendarId, row.isVisible);
    }
  }

  return visibilityByCalendarId;
}

export async function getGoogleProviderAccountIdForUser(
  db: DB,
  userId: string,
): Promise<string | null> {
  const accountRow = await getGoogleAccountCandidate(db, userId);
  return accountRow?.accountId ?? null;
}

const parseGoogleScopes = (scopeValue: string | null | undefined): Set<string> => {
  if (!scopeValue) return new Set();

  const raw = scopeValue.trim();
  if (!raw) return new Set();

  // Better Auth stores scopes as a comma-delimited string for Google.
  // Some providers/flows return whitespace-delimited scopes instead.
  // Support both to avoid false negatives in entitlement checks.
  return new Set(
    raw
      .split(/[\s,]+/)
      .map((scope) => scope.trim())
      .filter((scope) => scope.length > 0),
  );
};

const GOOGLE_CALENDAR_WRITE_SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
];

export async function hasCalendarWriteScope(
  db: DB,
  userId: string,
): Promise<boolean> {
  const accountRow = await getGoogleAccountCandidate(db, userId);
  if (!accountRow) return false;
  const scopes = parseGoogleScopes(accountRow.scope);
  return GOOGLE_CALENDAR_WRITE_SCOPES.some((scope) => scopes.has(scope));
}

export async function upsertGoogleCalendarVisibilityPreference(
  db: DB,
  options: {
    userId: string;
    providerAccountId: string;
    calendarId: string;
    visible: boolean;
  },
) {
  const now = new Date();

  await db
    .insert(googleCalendarPreference)
    .values({
      id: nanoid(),
      userId: options.userId,
      providerId: "google",
      providerAccountId: options.providerAccountId,
      calendarId: options.calendarId,
      isVisible: options.visible,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [
        googleCalendarPreference.userId,
        googleCalendarPreference.providerId,
        googleCalendarPreference.providerAccountId,
        googleCalendarPreference.calendarId,
      ],
      set: {
        isVisible: options.visible,
        updatedAt: now,
      },
    });
}

export async function listGoogleCalendarsWithVisibilityForUser(
  db: DB,
  env: GoogleEnv,
  userId: string,
): Promise<GoogleCalendarsWithVisibilityResult> {
  const accountRow = await getGoogleAccountCandidate(db, userId);
  if (!accountRow) {
    return {
      connected: false,
      providerAccountId: null,
      accessToken: null,
      calendars: [],
      visibilityByCalendarId: new Map(),
    };
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
    console.error("Error ensuring Google access token:", err);
    return {
      connected: false,
      providerAccountId: null,
      accessToken: null,
      calendars: [],
      visibilityByCalendarId: new Map(),
    };
  }

  const listResult = await fetchCalendarListForAccount(
    db,
    env,
    accountRow,
    accessToken,
  );
  if (!listResult.connected) {
    return {
      connected: false,
      providerAccountId: null,
      accessToken: null,
      calendars: [],
      visibilityByCalendarId: new Map(),
    };
  }

  const visibilityByCalendarId = await resolveCalendarVisibility(
    db,
    userId,
    accountRow.accountId,
    listResult.calendars,
  );

  return {
    connected: true,
    providerAccountId: accountRow.accountId,
    accessToken: listResult.accessToken,
    calendars: listResult.calendars,
    visibilityByCalendarId,
  };
}

const isCalendarVisible = (
  calendar: GoogleCalendarListItem,
  visibilityByCalendarId: Map<string, boolean>,
) => {
  const visible = visibilityByCalendarId.get(calendar.calendarId);
  return visible ?? calendar.selectedByGoogle;
};

export async function getPrimaryCalendarId(
  db: DB,
  env: GoogleEnv,
  userId: string,
): Promise<string | null> {
  const calendarState = await listGoogleCalendarsWithVisibilityForUser(
    db,
    env,
    userId,
  );
  if (!calendarState.connected) return null;

  const primary = calendarState.calendars.find((calendar) => calendar.primary);
  if (primary?.calendarId) return primary.calendarId;
  return calendarState.calendars[0]?.calendarId ?? null;
}

export async function listEventsForUserWithinWindow(
  db: DB,
  env: GoogleEnv,
  userId: string,
  options: {
    timeMin: string;
    timeMax: string;
    maxResultsPerCalendar?: number;
  },
) {
  const calendarState = await listGoogleCalendarsWithVisibilityForUser(
    db,
    env,
    userId,
  );

  if (!calendarState.connected || !calendarState.accessToken) {
    return {
      connected: false,
      events: [] as GoogleCalendarEventListItem[],
      calendarStats: {
        totalCalendars: 0,
        visibleCalendars: 0,
      },
    };
  }

  const maxResults = options.maxResultsPerCalendar ?? 100;
  const visibleCalendars = calendarState.calendars.filter((calendar) =>
    isCalendarVisible(calendar, calendarState.visibilityByCalendarId),
  );

  const allEvents: GoogleCalendarEventListItem[] = [];

  for (const calendar of visibleCalendars) {
    const params = new URLSearchParams({
      timeMin: options.timeMin,
      timeMax: options.timeMax,
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: String(maxResults),
    });

    const eventsRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        calendar.calendarId,
      )}/events?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${calendarState.accessToken}`,
        },
      },
    );

    if (!eventsRes.ok) {
      const text = await eventsRes.text();
      console.error(
        `Failed to fetch events for calendar ${calendar.calendarId}:`,
        eventsRes.status,
        text,
      );
      continue;
    }

    const eventsData = await eventsRes.json<{ items?: GoogleCalendarEventListItem[] }>();
    const items = eventsData.items ?? [];

    for (const event of items) {
      allEvents.push({
        ...event,
        _calendarId: calendar.calendarId,
        _calendarSummary: calendar.summary,
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
    calendarStats: {
      totalCalendars: calendarState.calendars.length,
      visibleCalendars: visibleCalendars.length,
    },
  };
}

async function getGoogleWriteAccessContext(
  db: DB,
  env: GoogleEnv,
  userId: string,
) {
  const calendarState = await listGoogleCalendarsWithVisibilityForUser(
    db,
    env,
    userId,
  );
  if (!calendarState.connected || !calendarState.accessToken) {
    return null;
  }

  const primary =
    calendarState.calendars.find((calendar) => calendar.primary) ??
    calendarState.calendars[0] ??
    null;

  if (!primary?.calendarId) return null;

  return {
    accessToken: calendarState.accessToken,
    primaryCalendarId: primary.calendarId,
  };
}

export async function createTaskEvent(
  db: DB,
  env: GoogleEnv,
  userId: string,
  options: {
    summary: string;
    start: Date;
    end: Date;
    timeZone: string;
    taskId: string;
    taskScheduleId: string;
    calendarId?: string | null;
  },
): Promise<GoogleEventMutationResult> {
  const writeCtx = await getGoogleWriteAccessContext(db, env, userId);
  if (!writeCtx) {
    return { ok: false, code: "CALENDAR_NOT_CONNECTED" };
  }

  const calendarId = options.calendarId ?? writeCtx.primaryCalendarId;
  const body = {
    summary: options.summary,
    start: { dateTime: options.start.toISOString(), timeZone: options.timeZone },
    end: { dateTime: options.end.toISOString(), timeZone: options.timeZone },
    transparency: "transparent",
    extendedProperties: {
      private: {
        taskId: options.taskId,
        taskScheduleId: options.taskScheduleId,
      },
    },
  };

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      calendarId,
    )}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${writeCtx.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to create Google Calendar event:", res.status, text);
    return {
      ok: false,
      code: "REQUEST_FAILED",
      status: res.status,
      error: text,
    };
  }

  const payload = await res.json<{ id?: string }>();
  if (!payload.id) {
    return {
      ok: false,
      code: "REQUEST_FAILED",
      error: "Missing event id from Google Calendar create response.",
    };
  }

  return { ok: true, calendarId, eventId: payload.id };
}

export async function updateTaskEvent(
  db: DB,
  env: GoogleEnv,
  userId: string,
  options: {
    calendarId: string;
    eventId: string;
    summary: string;
    start: Date;
    end: Date;
    timeZone: string;
    taskId: string;
    taskScheduleId: string;
  },
): Promise<GoogleEventMutationResult> {
  const writeCtx = await getGoogleWriteAccessContext(db, env, userId);
  if (!writeCtx) {
    return { ok: false, code: "CALENDAR_NOT_CONNECTED" };
  }

  const body = {
    summary: options.summary,
    start: { dateTime: options.start.toISOString(), timeZone: options.timeZone },
    end: { dateTime: options.end.toISOString(), timeZone: options.timeZone },
    transparency: "transparent",
    extendedProperties: {
      private: {
        taskId: options.taskId,
        taskScheduleId: options.taskScheduleId,
      },
    },
  };

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      options.calendarId,
    )}/events/${encodeURIComponent(options.eventId)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${writeCtx.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("Failed to update Google Calendar event:", res.status, text);
    return {
      ok: false,
      code: "REQUEST_FAILED",
      status: res.status,
      error: text,
    };
  }

  return {
    ok: true,
    calendarId: options.calendarId,
    eventId: options.eventId,
  };
}

export async function deleteTaskEvent(
  db: DB,
  env: GoogleEnv,
  userId: string,
  options: {
    calendarId: string;
    eventId: string;
  },
): Promise<GoogleEventMutationResult> {
  const writeCtx = await getGoogleWriteAccessContext(db, env, userId);
  if (!writeCtx) {
    return { ok: false, code: "CALENDAR_NOT_CONNECTED" };
  }

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      options.calendarId,
    )}/events/${encodeURIComponent(options.eventId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${writeCtx.accessToken}`,
      },
    },
  );

  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    console.error("Failed to delete Google Calendar event:", res.status, text);
    return {
      ok: false,
      code: "REQUEST_FAILED",
      status: res.status,
      error: text,
    };
  }

  return {
    ok: true,
    calendarId: options.calendarId,
    eventId: options.eventId,
  };
}

function resolveTimeWindow(options?: { dateKey?: string; tzOffsetMinutes?: number }) {
  let timeMin: string;
  let timeMax: string;

  if (options?.dateKey) {
    const [year, month, day] = options.dateKey.split("-").map(Number);
    const fallbackOffset = new Date(year, month - 1, day).getTimezoneOffset();
    const offsetMinutes = options.tzOffsetMinutes ?? fallbackOffset ?? 0;
    const startUtcMs =
      Date.UTC(year, month - 1, day, 0, 0, 0) + offsetMinutes * 60 * 1000;
    const endUtcMs = startUtcMs + 24 * 60 * 60 * 1000;
    timeMin = new Date(startUtcMs).toISOString();
    timeMax = new Date(endUtcMs).toISOString();
  } else {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfTomorrow = new Date(startOfToday);
    endOfTomorrow.setDate(endOfTomorrow.getDate() + 2);

    timeMin = startOfToday.toISOString();
    timeMax = endOfTomorrow.toISOString();
  }

  return { timeMin, timeMax };
}

export async function listUpcomingEventsForUser(
  db: DB,
  env: GoogleEnv,
  userId: string,
  options?: { dateKey?: string; tzOffsetMinutes?: number },
) {
  const { timeMin, timeMax } = resolveTimeWindow(options);
  return listEventsForUserWithinWindow(db, env, userId, {
    timeMin,
    timeMax,
    maxResultsPerCalendar: 50,
  });
}
