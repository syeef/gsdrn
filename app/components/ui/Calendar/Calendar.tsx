import * as React from "react";
import { Link, useFetcher } from "react-router";
import styles from "./Calendar.module.css";
import Button from "~/components/ui/Button/Button";
import { authClient } from "~/lib/auth.client";
import { formatDateKey, parseDateKey } from "~/utils/date";

import CalendarEmptyState from "~/assets/images/calendarEmptyState.png";
import CalendarConnectState from "~/assets/images/calendarConnect.png";
import { ShinyButton } from "../Button/ShinyButton";

type GoogleEventsResponse = {
  connected: boolean;
  events: GoogleEvent[];
  calendarStats: {
    totalCalendars: number;
    visibleCalendars: number;
  };
};

type GoogleEvent = {
  id?: string;
  summary?: string;
  location?: string;
  status?: string;
  colorId?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  attendees?: Array<{ responseStatus?: string }>;
  _calendarId?: string;
  _calendarSummary?: string;
};

type NormalizedEvent = {
  id: string;
  title: string;
  location: string | undefined;
  start: Date;
  end: Date;
  isAllDay: boolean;
  source: GoogleEvent;
};

const HOUR_HEIGHT = 72;
const HOURS = Array.from({ length: 24 }, (_, index) => index);
const COL_GAP = 8; // px gap between side-by-side overlapping events

function computeEventColumns<T extends { top: number; height: number }>(
  layouts: T[],
): Array<T & { columnIndex: number; columnCount: number }> {
  const n = layouts.length;
  if (n === 0) return [];

  // Greedily assign each event to the first column it fits in (no time overlap)
  const colIdx = new Array<number>(n).fill(0);
  const colEnds: number[] = [];

  for (let i = 0; i < n; i++) {
    const { top, height } = layouts[i];
    let placed = false;
    for (let c = 0; c < colEnds.length; c++) {
      if (colEnds[c] <= top) {
        colIdx[i] = c;
        colEnds[c] = top + height;
        placed = true;
        break;
      }
    }
    if (!placed) {
      colIdx[i] = colEnds.length;
      colEnds.push(top + height);
    }
  }

  // Union-find to group events that overlap (directly or transitively)
  const parent = Array.from({ length: n }, (_, i) => i);
  function find(x: number): number {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }
  function union(x: number, y: number) {
    parent[find(x)] = find(y);
  }

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const aEnd = layouts[i].top + layouts[i].height;
      const bEnd = layouts[j].top + layouts[j].height;
      if (layouts[i].top < bEnd && layouts[j].top < aEnd) {
        union(i, j);
      }
    }
  }

  // Max column index per cluster → determines total columns for each cluster
  const clusterMaxCol = new Map<number, number>();
  for (let i = 0; i < n; i++) {
    const root = find(i);
    clusterMaxCol.set(root, Math.max(clusterMaxCol.get(root) ?? 0, colIdx[i]));
  }

  return layouts.map((layout, i) => ({
    ...layout,
    columnIndex: colIdx[i],
    columnCount: (clusterMaxCol.get(find(i)) ?? 0) + 1,
  }));
}

const EVENT_PALETTE = [
  {
    accent: "#ffb347",
    bg: "rgba(255, 179, 71, 0.18)",
    muted: "rgba(255, 179, 71, 0.6)",
  },
  {
    accent: "#ff5f5f",
    bg: "rgba(255, 95, 95, 0.16)",
    muted: "rgba(255, 95, 95, 0.6)",
  },
  {
    accent: "#ffd66a",
    bg: "rgba(255, 214, 106, 0.18)",
    muted: "rgba(255, 214, 106, 0.65)",
  },
  {
    accent: "#ff984f",
    bg: "rgba(255, 152, 79, 0.16)",
    muted: "rgba(255, 152, 79, 0.6)",
  },
];

const formatHourLabel = (hour: number) =>
  `${hour.toString().padStart(2, "0")}:00`;

const parseAllDayDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const getPaletteIndex = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % EVENT_PALETTE.length;
};

type CalendarProps = {
  dateKey?: string;
};

export default function Calendar({ dateKey }: CalendarProps) {
  const eventsFetcher = useFetcher<GoogleEventsResponse>();
  const [now, setNow] = React.useState(() => new Date());
  const requestedDateKeyRef = React.useRef<string | null>(null);
  const [loadedDateKey, setLoadedDateKey] = React.useState<string | null>(null);
  const selectedDate = React.useMemo(() => {
    if (dateKey) {
      const parsed = parseDateKey(dateKey);
      if (parsed) return parsed;
    }
    return new Date();
  }, [dateKey]);
  const resolvedDateKey = React.useMemo(
    () => formatDateKey(selectedDate),
    [selectedDate],
  );
  const buildEventsUrl = React.useCallback(() => {
    const offsetMinutes = selectedDate.getTimezoneOffset();
    return `/api/getGoogleCalendarEvents?date=${resolvedDateKey}&tzOffset=${offsetMinutes}`;
  }, [resolvedDateKey, selectedDate]);

  const loadEventsForDate = React.useCallback(
    (force: boolean = false) => {
      if (eventsFetcher.state !== "idle") return;
      if (!force && requestedDateKeyRef.current === resolvedDateKey) return;
      requestedDateKeyRef.current = resolvedDateKey;
      if (force) {
        setLoadedDateKey(null);
      }
      eventsFetcher.load(buildEventsUrl());
    },
    [buildEventsUrl, eventsFetcher, eventsFetcher.state, resolvedDateKey],
  );

  const requestGoogleCalendarAccess = React.useCallback(async () => {
    const callbackURL =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : undefined;

    await authClient.linkSocial({
      provider: "google",
      callbackURL,
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
    });

    // If the auth client handled linking without full page navigation,
    // force-refresh calendar data to reflect the newly linked account.
    loadEventsForDate(true);
  }, [loadEventsForDate]);

  // Kick off fetch to /getGoogleCalendarEvents for the current date.
  React.useEffect(() => {
    loadEventsForDate(false);
  }, [loadEventsForDate]);

  React.useEffect(() => {
    if (eventsFetcher.state !== "idle") return;
    if (!requestedDateKeyRef.current) return;
    if (!eventsFetcher.data) return;
    setLoadedDateKey(requestedDateKeyRef.current);
  }, [eventsFetcher.state, eventsFetcher.data]);

  React.useEffect(() => {
    if (loadedDateKey && loadedDateKey !== resolvedDateKey) {
      setLoadedDateKey(null);
    }
  }, [loadedDateKey, resolvedDateKey]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const hasLoadedForDate = loadedDateKey === resolvedDateKey;
  const isLoadingEvents = !hasLoadedForDate;

  const timelineScrollRef = React.useRef<HTMLDivElement | null>(null);

  // Prevent auto-scroll from constantly overriding a user's manual scroll.
  const isAutoScrollingRef = React.useRef(false);
  const userScrolledRef = React.useRef(false);
  const didInitialAutoScrollRef = React.useRef(false);

  const clampNumber = (n: number, min: number, max: number) =>
    Math.max(min, Math.min(max, n));

  const isConnected = hasLoadedForDate
    ? (eventsFetcher.data?.connected ?? false)
    : false;
  const events = hasLoadedForDate ? (eventsFetcher.data?.events ?? []) : [];
  const calendarStats = hasLoadedForDate
    ? (eventsFetcher.data?.calendarStats ?? {
        totalCalendars: 0,
        visibleCalendars: 0,
      })
    : { totalCalendars: 0, visibleCalendars: 0 };
  const minuteHeight = HOUR_HEIGHT / 60;
  const gridHeight = HOURS.length * HOUR_HEIGHT;

  const dayStart = React.useMemo(() => {
    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);
    return start;
  }, [selectedDate]);

  const dayEnd = React.useMemo(() => {
    const end = new Date(dayStart);
    end.setDate(end.getDate() + 1);
    return end;
  }, [dayStart]);

  const timeFormatter = React.useMemo(
    () =>
      new Intl.DateTimeFormat([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    [],
  );

  const dateFormatter = React.useMemo(
    () =>
      new Intl.DateTimeFormat([], {
        weekday: "long",
        month: "short",
        day: "numeric",
      }),
    [],
  );

  const normalizedEvents = React.useMemo(() => {
    return events
      .map((event) => {
        const startRaw = event.start?.dateTime ?? event.start?.date;
        if (!startRaw) {
          return null;
        }

        const isAllDay = Boolean(event.start?.date && !event.start?.dateTime);
        const start =
          isAllDay && event.start?.date
            ? parseAllDayDate(event.start.date)
            : new Date(startRaw);
        const end = isAllDay
          ? event.end?.date
            ? parseAllDayDate(event.end.date)
            : new Date(start.getTime() + 24 * 60 * 60 * 1000)
          : new Date(event.end?.dateTime ?? event.end?.date ?? startRaw);

        const safeEnd =
          end.getTime() <= start.getTime()
            ? new Date(start.getTime() + 30 * 60 * 1000)
            : end;

        return {
          id: event.id ?? `${event._calendarId ?? "event"}-${startRaw}`,
          title: event.summary ?? "Untitled event",
          location: event.location ?? undefined,
          start,
          end: safeEnd,
          isAllDay,
          source: event,
        } satisfies NormalizedEvent;
      })
      .filter((event): event is NormalizedEvent => Boolean(event))
      .filter((event) => event.end > dayStart && event.start < dayEnd)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [events, dayEnd, dayStart]);

  const allDayEvents = normalizedEvents.filter((event) => event.isAllDay);
  const timedEvents = normalizedEvents.filter((event) => !event.isAllDay);

  const eventLayouts = React.useMemo(() => {
    const base = timedEvents.map((event) => {
      const startMinutes = Math.max(
        0,
        (event.start.getTime() - dayStart.getTime()) / 60000,
      );
      const endMinutes = Math.min(
        24 * 60,
        (event.end.getTime() - dayStart.getTime()) / 60000,
      );
      const durationMinutes = Math.max(endMinutes - startMinutes, 20);
      const top = startMinutes * minuteHeight;
      const height = durationMinutes * minuteHeight;
      const timeLabel = `${timeFormatter.format(
        event.start,
      )} - ${timeFormatter.format(event.end)}`;

      const seed = event.source.colorId ?? event.source._calendarId ?? event.id;
      const palette = EVENT_PALETTE[getPaletteIndex(seed)];

      return { ...event, top, height, timeLabel, palette };
    });

    return computeEventColumns(base);
  }, [timedEvents, dayStart, minuteHeight, timeFormatter]);

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowOffset = nowMinutes * minuteHeight;
  const showNowLine = formatDateKey(now) === formatDateKey(dayStart);

  // Reset "user scrolled" when the day changes (so tomorrow auto-scroll works again).
  React.useEffect(() => {
    userScrolledRef.current = false;
    didInitialAutoScrollRef.current = false;
  }, [dayStart]);

  const timelineReady =
    isConnected && !isLoadingEvents && timedEvents.length > 0;

  React.useEffect(() => {
    if (!showNowLine) return;
    if (!timelineReady) return;

    const el = timelineScrollRef.current;
    if (!el) return;

    if (userScrolledRef.current) return;

    const viewportHeight = el.clientHeight;
    if (viewportHeight <= 0) return;

    const targetFromTop = viewportHeight * 0.35;

    // Use the real scrollHeight to clamp (more reliable than gridHeight)
    const maxScrollTop = Math.max(0, el.scrollHeight - viewportHeight);

    const nextScrollTop = clampNumber(
      nowOffset - targetFromTop,
      0,
      maxScrollTop,
    );

    isAutoScrollingRef.current = true;

    el.scrollTo({
      top: nextScrollTop,
      behavior: didInitialAutoScrollRef.current ? "smooth" : "auto",
    });

    didInitialAutoScrollRef.current = true;

    window.setTimeout(() => {
      isAutoScrollingRef.current = false;
    }, 250);
  }, [showNowLine, nowOffset, timelineReady]);

  return (
    <section className={styles.calendar}>
      {/* <header className={styles.calendarHeader}>
        <div>
          <p className={styles.calendarTitle}>Today</p>
          <p className={styles.calendarDate}>{dateFormatter.format(dayStart)}</p>
        </div>
        {isConnected && !isLoadingEvents && (
          <span className={styles.calendarMeta}>
            {timedEvents.length} event{timedEvents.length === 1 ? "" : "s"}
          </span>
        )}
      </header> */}
      {/* 1. Loading state while we don't yet know if they're connected */}
      {isLoadingEvents && (
        <p className={styles.stateMessage}>Loading your calendar…</p>
      )}

      {/* 2. If NOT connected, show the "Connect" button */}
      {!isLoadingEvents && !isConnected && (
        <div className={styles.connectPanel}>
          {/* <p>Connect Google Calendar to see your schedule for this day.</p>
          <Button onClick={requestGoogleCalendarAccess}>
            Connect to Google Calendar
          </Button> */}

          <div className={styles.calendarEmptyStateContent}>
            <p className={styles.stateMessage}>
              Your schedule appears here once your calendar is connected.
            </p>
            <ShinyButton variant="Button" onClick={requestGoogleCalendarAccess}>
              Connect Google Calendar
            </ShinyButton>
            <img src={CalendarConnectState} alt="" />
          </div>
        </div>
      )}

      {/* 3. If connected, show events (and no button) */}
      {!isLoadingEvents && isConnected && (
        <>
          {calendarStats.visibleCalendars === 0 ? (
            <div className={styles.connectPanel}>
              <p>All calendars are currently hidden for this account.</p>
              <Link to="/preferences" className={styles.preferencesLink}>
                Manage calendar visibility
              </Link>
            </div>
          ) : (
            <>
              {allDayEvents.length > 0 && (
                <div className={styles.allDayRow}>
                  <span className={styles.allDayLabel}>All day</span>
                  <div className={styles.allDayEvents}>
                    {allDayEvents.map((event) => (
                      <span key={event.id} className={styles.allDayChip}>
                        {event.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {timedEvents.length === 0 ? (
                <>
                  <div className={styles.calendarEmptyStateContainer}>
                    <div className={styles.calendarEmptyStateContent}>
                      <p className={styles.stateMessage}>
                        Relax and enjoy the time, there's nothing scheduled
                        today.
                      </p>
                      <img src={CalendarEmptyState} alt="" />
                    </div>
                  </div>
                </>
              ) : (
                <div className={styles.timeline}>
                  {/* <div className={styles.timelineScroll}> */}
                  <div
                    className={styles.timelineScroll}
                    ref={timelineScrollRef}
                    onScroll={() => {
                      // Ignore scroll events caused by our own scrollTo()
                      if (isAutoScrollingRef.current) return;
                      userScrolledRef.current = true;
                    }}
                  >
                    <div
                      className={styles.hourLabels}
                      style={{ height: gridHeight }}
                    >
                      {HOURS.map((hour) => (
                        <div key={hour} className={styles.hourLabel}>
                          {formatHourLabel(hour)}
                        </div>
                      ))}
                    </div>
                    <div className={styles.grid} style={{ height: gridHeight }}>
                      {HOURS.map((hour) => (
                        <div key={hour} className={styles.hourRow} />
                      ))}
                      <div
                        className={styles.eventsLayer}
                        style={
                          {
                            ["--event-col-gap" as any]: `${COL_GAP}px`,
                          } as React.CSSProperties
                        }
                      >
                        {eventLayouts.map((event) => (
                          <div
                            key={event.id}
                            className={styles.eventCard}
                            style={
                              {
                                top: `${event.top}px`,
                                height: `${event.height}px`,
                                left: `calc(${event.columnIndex} * (100% + ${COL_GAP}px) / ${event.columnCount})`,
                                width: `calc((100% - ${COL_GAP * (event.columnCount - 1)}px) / ${event.columnCount})`,
                                ["--event-accent" as any]: event.palette.accent,
                                ["--event-bg" as any]: event.palette.bg,
                                ["--event-muted" as any]: event.palette.muted,
                              } as React.CSSProperties
                            }
                          >
                            <div className={styles.eventHeader}>
                              <span className={styles.eventTitle}>
                                {event.title}
                              </span>
                              <span className={styles.eventTime}>
                                {event.timeLabel}
                              </span>
                            </div>
                            {/* {event.location && (
                              <span className={styles.eventLocation}>
                                {event.location}
                              </span>
                            )} */}
                          </div>
                        ))}
                      </div>
                      {showNowLine && (
                        <div
                          className={styles.nowLine}
                          style={{ top: `${nowOffset}px` }}
                        >
                          <span className={styles.nowDot} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}
