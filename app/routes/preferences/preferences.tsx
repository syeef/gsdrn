import { eq } from "drizzle-orm";
import * as React from "react";
import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect,
  useFetcher,
  useLoaderData,
} from "react-router";
import Button from "~/components/ui/Button/Button";
import Header from "~/components/ui/Header/Header";
import { IconPlus } from "~/components/ui/Icons/Icons";
import { userExt } from "~/database/schema";
import { authClient } from "~/lib/auth.client";
import { getAuth } from "~/lib/auth.server";
import styles from "~/styles/preferences.module.css";
import { getDbFromContext } from "~/utils/db.service.server";
import { hasEntitlement, type UserTier } from "~/utils/tier";
import { resolveUserTier } from "~/utils/tier.server";
import {
  copyDayToEnabledDays,
  normalizeWorkingHours,
  parseWorkingHoursDocument,
  validateWorkingHours,
  type TimeBlock,
  type WeekdayKey,
  type WorkingHoursDocument,
} from "~/utils/workingHours";

export const meta: MetaFunction = () => [
  { title: "Preferences | Tickatana" },
  { name: "description", content: "Manage your Tickatana preferences." },
];

type PreferencesLoaderData = {
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    image: string | null;
  };
  canUseWorkingHours: boolean;
};

type CalendarPreferenceItem = {
  calendarId: string;
  summary: string;
  description: string | null;
  backgroundColor: string | null;
  foregroundColor: string | null;
  accessRole: string | null;
  primary: boolean;
  selectedByGoogle: boolean;
  visible: boolean;
};

type CalendarPreferencesResponse = {
  connected: boolean;
  calendars: CalendarPreferenceItem[];
};

type CalendarPreferenceMutationResponse = {
  ok: boolean;
  calendarId?: string;
  visible?: boolean;
  error?: string;
};

type WorkingHoursPreferencesResponse = {
  ok: boolean;
  workingHours?: WorkingHoursDocument;
  updatedAt?: string;
  error?: string;
};

const DAY_DEFINITIONS: { key: WeekdayKey; label: string; chipLabel: string }[] = [
  { key: "sun", label: "Sunday", chipLabel: "S" },
  { key: "mon", label: "Monday", chipLabel: "M" },
  { key: "tue", label: "Tuesday", chipLabel: "T" },
  { key: "wed", label: "Wednesday", chipLabel: "W" },
  { key: "thu", label: "Thursday", chipLabel: "T" },
  { key: "fri", label: "Friday", chipLabel: "F" },
  { key: "sat", label: "Saturday", chipLabel: "S" },
];

const TIME_OPTIONS = Array.from({ length: (24 * 60) / 30 + 1 }, (_, index) =>
  index * 30,
);

const START_TIME_OPTIONS = TIME_OPTIONS.filter((minute) => minute < 24 * 60);
const END_TIME_OPTIONS = TIME_OPTIONS.filter((minute) => minute > 0);

function formatMinutes(minute: number): string {
  const hour24 = Math.floor(minute / 60) % 24;
  const minutes = minute % 60;
  const suffix = hour24 >= 12 ? "pm" : "am";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(minutes).padStart(2, "0")}${suffix}`;
}

function findNextAvailableBlock(blocks: TimeBlock[]): TimeBlock | null {
  const normalizedBlocks = [...blocks].sort(
    (a, b) => a.startMinute - b.startMinute,
  );

  for (let startMinute = 0; startMinute <= 24 * 60 - 60; startMinute += 30) {
    const endMinute = startMinute + 60;
    const overlaps = normalizedBlocks.some(
      (block) => startMinute < block.endMinute && endMinute > block.startMinute,
    );

    if (!overlaps) {
      return {
        startMinute,
        endMinute,
      };
    }
  }

  return null;
}

function enforceAlwaysEnabled(
  workingHours: WorkingHoursDocument,
): WorkingHoursDocument {
  return {
    ...workingHours,
    enabled: true,
  };
}

export async function loader({
  request,
  context,
}: LoaderFunctionArgs): Promise<PreferencesLoaderData> {
  const auth = getAuth(context);
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    throw redirect("/login");
  }

  const db = getDbFromContext(context);
  const user = session.user as {
    id: string;
    createdAt: Date;
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    image?: string | null;
  };

  const ext = await db.query.userExt.findFirst({
    where: eq(userExt.userId, user.id),
  });
  const storedTier = (ext?.tier ?? "free") as UserTier;
  const tier = await resolveUserTier(user, storedTier, db);

  return {
    user: {
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      email: user.email,
      image: user.image ?? null,
    },
    canUseWorkingHours: hasEntitlement(tier, "workingHours"),
  };
}

export default function PreferencesRoute() {
  const { user, canUseWorkingHours } = useLoaderData<typeof loader>();
  const calendarsFetcher = useFetcher<CalendarPreferencesResponse>();
  const saveFetcher = useFetcher<CalendarPreferenceMutationResponse>();
  const didLoadRef = React.useRef(false);
  const pendingChangeRef = React.useRef<{
    calendarId: string;
    previous: boolean;
  } | null>(null);

  const [isLinking, setIsLinking] = React.useState(false);
  const [calendarErrorMessage, setCalendarErrorMessage] = React.useState<
    string | null
  >(null);
  const [visibilityByCalendarId, setVisibilityByCalendarId] = React.useState<
    Record<string, boolean>
  >({});

  const [workingHours, setWorkingHours] =
    React.useState<WorkingHoursDocument | null>(null);
  const workingHoursRef = React.useRef<WorkingHoursDocument | null>(null);
  const confirmedWorkingHoursRef = React.useRef<WorkingHoursDocument | null>(
    null,
  );
  const latestWorkingHoursRequestIdRef = React.useRef(0);
  const saveControllerRef = React.useRef<AbortController | null>(null);
  const [workingHoursError, setWorkingHoursError] = React.useState<string | null>(
    null,
  );
  const [isWorkingHoursLoading, setIsWorkingHoursLoading] =
    React.useState(false);
  const [isWorkingHoursSaving, setIsWorkingHoursSaving] =
    React.useState(false);

  React.useEffect(() => {
    if (didLoadRef.current) return;
    didLoadRef.current = true;
    calendarsFetcher.load("/api/googleCalendarPreferences");
  }, [calendarsFetcher]);

  React.useEffect(() => {
    const calendars = calendarsFetcher.data?.calendars;
    if (!calendars || calendars.length === 0) return;

    setVisibilityByCalendarId((previous) => {
      const next = { ...previous };
      for (const calendar of calendars) {
        if (!(calendar.calendarId in next)) {
          next[calendar.calendarId] = calendar.visible;
        }
      }
      return next;
    });
  }, [calendarsFetcher.data]);

  React.useEffect(() => {
    if (saveFetcher.state !== "idle") return;
    if (!pendingChangeRef.current) return;

    const pending = pendingChangeRef.current;
    const didSucceed = saveFetcher.data?.ok === true;

    if (!didSucceed) {
      setVisibilityByCalendarId((previous) => ({
        ...previous,
        [pending.calendarId]: pending.previous,
      }));
      setCalendarErrorMessage(
        saveFetcher.data?.error ??
          "Failed to update calendar visibility. Please try again.",
      );
    }

    pendingChangeRef.current = null;
  }, [saveFetcher.data, saveFetcher.state]);

  const loadWorkingHours = React.useCallback(async () => {
    if (!canUseWorkingHours) return;

    setWorkingHoursError(null);
    setIsWorkingHoursLoading(true);

    try {
      const response = await fetch("/api/workingHoursPreferences", {
        method: "GET",
      });

      const payload = (await response.json()) as WorkingHoursPreferencesResponse;

      if (!response.ok || payload.ok !== true || !payload.workingHours) {
        throw new Error(
          payload.error ?? "Failed to load working hours preferences.",
        );
      }

      const parsed = parseWorkingHoursDocument(payload.workingHours);
      if (!parsed.ok || !parsed.workingHours) {
        throw new Error(parsed.error ?? "Invalid working hours response.");
      }

      const alwaysEnabled = enforceAlwaysEnabled(parsed.workingHours);
      setWorkingHours(alwaysEnabled);
      workingHoursRef.current = alwaysEnabled;
      confirmedWorkingHoursRef.current = alwaysEnabled;
    } catch (err) {
      console.error("Error loading working hours preferences:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load working hours preferences.";
      setWorkingHoursError(message);
      setWorkingHours(null);
      workingHoursRef.current = null;
      confirmedWorkingHoursRef.current = null;
    } finally {
      setIsWorkingHoursLoading(false);
    }
  }, [canUseWorkingHours]);

  React.useEffect(() => {
    if (!canUseWorkingHours) return;
    void loadWorkingHours();
  }, [canUseWorkingHours, loadWorkingHours]);

  React.useEffect(
    () => () => {
      saveControllerRef.current?.abort();
    },
    [],
  );

  const persistWorkingHours = React.useCallback(
    async (nextWorkingHours: WorkingHoursDocument) => {
      const payloadDoc = enforceAlwaysEnabled(nextWorkingHours);
      const requestId = latestWorkingHoursRequestIdRef.current + 1;
      latestWorkingHoursRequestIdRef.current = requestId;

      saveControllerRef.current?.abort();
      const controller = new AbortController();
      saveControllerRef.current = controller;

      setWorkingHoursError(null);
      setIsWorkingHoursSaving(true);

      try {
        const response = await fetch("/api/workingHoursPreferences", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ workingHours: payloadDoc }),
          signal: controller.signal,
        });

        const payload =
          (await response.json()) as WorkingHoursPreferencesResponse;

        if (requestId !== latestWorkingHoursRequestIdRef.current) {
          return;
        }

        if (!response.ok || payload.ok !== true || !payload.workingHours) {
          throw new Error(
            payload.error ?? "Failed to save working hours preferences.",
          );
        }

        const parsed = parseWorkingHoursDocument(payload.workingHours);
        if (!parsed.ok || !parsed.workingHours) {
          throw new Error(parsed.error ?? "Invalid saved working hours payload.");
        }

        const alwaysEnabled = enforceAlwaysEnabled(parsed.workingHours);
        setWorkingHours(alwaysEnabled);
        workingHoursRef.current = alwaysEnabled;
        confirmedWorkingHoursRef.current = alwaysEnabled;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        if (requestId !== latestWorkingHoursRequestIdRef.current) {
          return;
        }

        const rollback = confirmedWorkingHoursRef.current;
        if (rollback) {
          setWorkingHours(rollback);
          workingHoursRef.current = rollback;
        }

        const message =
          err instanceof Error
            ? err.message
            : "Failed to save working hours preferences.";
        setWorkingHoursError(message);
      } finally {
        if (requestId === latestWorkingHoursRequestIdRef.current) {
          setIsWorkingHoursSaving(false);
        }
      }
    },
    [],
  );

  const applyWorkingHoursUpdate = React.useCallback(
    (updater: (current: WorkingHoursDocument) => WorkingHoursDocument) => {
      const current = workingHoursRef.current;
      if (!current) return;

      const candidate = enforceAlwaysEnabled(
        normalizeWorkingHours(updater(current)),
      );
      const validation = validateWorkingHours(candidate);
      if (!validation.ok) {
        setWorkingHoursError(validation.error ?? "Invalid working hours update.");
        return;
      }

      setWorkingHoursError(null);
      setWorkingHours(candidate);
      workingHoursRef.current = candidate;
      void persistWorkingHours(candidate);
    },
    [persistWorkingHours],
  );

  const calendars = calendarsFetcher.data?.calendars ?? [];
  const renderedCalendars = calendars.map((calendar) => ({
    ...calendar,
    visible: visibilityByCalendarId[calendar.calendarId] ?? calendar.visible,
  }));

  const isCalendarInitialLoading =
    calendarsFetcher.state !== "idle" && !calendarsFetcher.data;
  const isCalendarSaving = saveFetcher.state !== "idle";
  const isSaving = isCalendarSaving || isWorkingHoursSaving;

  const requestGoogleCalendarAccess = React.useCallback(async () => {
    setCalendarErrorMessage(null);
    setIsLinking(true);

    try {
      await authClient.linkSocial({
        provider: "google",
        callbackURL: "/preferences",
        scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
      });

      calendarsFetcher.load("/api/googleCalendarPreferences");
    } catch (err) {
      console.error("Error linking Google Calendar:", err);
      setCalendarErrorMessage("Failed to connect Google Calendar.");
    } finally {
      setIsLinking(false);
    }
  }, [calendarsFetcher]);

  const handleCalendarToggle = (calendarId: string, nextVisible: boolean) => {
    if (isCalendarSaving) return;

    const previousVisible =
      visibilityByCalendarId[calendarId] ??
      calendars.find((calendar) => calendar.calendarId === calendarId)?.visible ??
      false;

    pendingChangeRef.current = {
      calendarId,
      previous: previousVisible,
    };

    setCalendarErrorMessage(null);
    setVisibilityByCalendarId((previous) => ({
      ...previous,
      [calendarId]: nextVisible,
    }));

    saveFetcher.submit(
      { calendarId, visible: nextVisible },
      {
        method: "post",
        action: "/api/googleCalendarPreferences",
        encType: "application/json",
      },
    );
  };

  const toggleDayEnabled = (dayKey: WeekdayKey, enabled: boolean) => {
    applyWorkingHoursUpdate((current) => ({
      ...current,
      days: {
        ...current.days,
        [dayKey]: {
          ...current.days[dayKey],
          enabled,
        },
      },
    }));
  };

  const copyDayBlocksToEnabledDays = (dayKey: WeekdayKey) => {
    applyWorkingHoursUpdate((current) => copyDayToEnabledDays(current, dayKey));
  };

  const addBlockToDay = (dayKey: WeekdayKey) => {
    const current = workingHoursRef.current;
    if (!current) return;

    const newBlock = findNextAvailableBlock(current.days[dayKey].blocks);
    if (!newBlock) {
      setWorkingHoursError(
        "No available 30-minute slot remains for that day.",
      );
      return;
    }

    applyWorkingHoursUpdate((next) => ({
      ...next,
      days: {
        ...next.days,
        [dayKey]: {
          ...next.days[dayKey],
          blocks: [...next.days[dayKey].blocks, newBlock],
        },
      },
    }));
  };

  const removeBlockFromDay = (dayKey: WeekdayKey, blockIndex: number) => {
    applyWorkingHoursUpdate((current) => ({
      ...current,
      days: {
        ...current.days,
        [dayKey]: {
          ...current.days[dayKey],
          blocks: current.days[dayKey].blocks.filter(
            (_block, index) => index !== blockIndex,
          ),
        },
      },
    }));
  };

  const updateBlockStartMinute = (
    dayKey: WeekdayKey,
    blockIndex: number,
    startMinute: number,
  ) => {
    applyWorkingHoursUpdate((current) => ({
      ...current,
      days: {
        ...current.days,
        [dayKey]: {
          ...current.days[dayKey],
          blocks: current.days[dayKey].blocks.map((block, index) =>
            index === blockIndex
              ? {
                  ...block,
                  startMinute,
                }
              : block,
          ),
        },
      },
    }));
  };

  const updateBlockEndMinute = (
    dayKey: WeekdayKey,
    blockIndex: number,
    endMinute: number,
  ) => {
    applyWorkingHoursUpdate((current) => ({
      ...current,
      days: {
        ...current.days,
        [dayKey]: {
          ...current.days[dayKey],
          blocks: current.days[dayKey].blocks.map((block, index) =>
            index === blockIndex
              ? {
                  ...block,
                  endMinute,
                }
              : block,
          ),
        },
      },
    }));
  };

  const enabledDayRows = workingHours
    ? DAY_DEFINITIONS.filter((day) => workingHours.days[day.key].enabled)
    : [];

  return (
    <div className={styles.page}>
      <Header user={user} title="Preferences" isSaving={isSaving} />
      <main className={styles.content}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Google Calendar</h2>
            <p>Choose which calendars are visible in your schedule.</p>
          </div>

          {isCalendarInitialLoading && (
            <p className={styles.statusMessage}>Loading calendars...</p>
          )}

          {!isCalendarInitialLoading && calendarsFetcher.data?.connected === false && (
            <div className={styles.connectPanel}>
              <p>
                Connect Google Calendar to manage which calendars are shown in
                your app.
              </p>
              <Button onClick={requestGoogleCalendarAccess} disabled={isLinking}>
                {isLinking ? "Connecting..." : "Connect Google Calendar"}
              </Button>
            </div>
          )}

          {!isCalendarInitialLoading && calendarsFetcher.data?.connected && (
            <>
              {calendarErrorMessage && (
                <p className={styles.errorMessage}>{calendarErrorMessage}</p>
              )}

              {renderedCalendars.length === 0 ? (
                <p className={styles.statusMessage}>
                  No calendars were found for this Google account.
                </p>
              ) : (
                <ul className={styles.calendarList}>
                  {renderedCalendars.map((calendar) => (
                    <li key={calendar.calendarId} className={styles.calendarItem}>
                      <label className={styles.calendarLabel}>
                        <input
                          type="checkbox"
                          checked={calendar.visible}
                          disabled={isCalendarSaving}
                          onChange={(event) =>
                            handleCalendarToggle(
                              calendar.calendarId,
                              event.target.checked,
                            )
                          }
                        />
                        <span
                          className={styles.calendarSwatch}
                          style={{
                            backgroundColor:
                              calendar.backgroundColor ?? "var(--gray-6)",
                            borderColor:
                              calendar.foregroundColor ?? "var(--gray-8)",
                          }}
                        />
                        <span className={styles.calendarText}>
                          <span className={styles.calendarName}>
                            {calendar.summary}
                          </span>
                          <span className={styles.calendarMeta}>
                            {calendar.primary ? "Primary" : "Secondary"}
                            {calendar.accessRole
                              ? ` • ${calendar.accessRole}`
                              : ""}
                            {!calendar.selectedByGoogle
                              ? " • Hidden in Google"
                              : ""}
                          </span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>

        {canUseWorkingHours && (
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Working Hours</h2>
              <p>
                Set your available time windows for future assisted scheduling.
              </p>
            </div>

            {isWorkingHoursLoading && (
              <p className={styles.statusMessage}>Loading working hours...</p>
            )}

            {!isWorkingHoursLoading && !workingHours && (
              <div className={styles.connectPanel}>
                {workingHoursError && (
                  <p className={styles.errorMessage}>{workingHoursError}</p>
                )}
                <Button onClick={() => void loadWorkingHours()}>
                  Retry loading working hours
                </Button>
              </div>
            )}

            {!isWorkingHoursLoading && workingHours && (
              <>
                {workingHoursError && (
                  <p className={styles.errorMessage}>{workingHoursError}</p>
                )}

                <div className={styles.dayChipList}>
                  {DAY_DEFINITIONS.map((day) => {
                    const dayEnabled = workingHours.days[day.key].enabled;
                    return (
                      <button
                        key={day.key}
                        type="button"
                        className={[
                          styles.dayChip,
                          dayEnabled ? styles.dayChipActive : null,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        aria-pressed={dayEnabled}
                        disabled={isWorkingHoursSaving}
                        onClick={() => toggleDayEnabled(day.key, !dayEnabled)}
                      >
                        {day.chipLabel}
                      </button>
                    );
                  })}
                </div>

                {enabledDayRows.length === 0 && (
                  <p className={styles.statusMessage}>
                    Enable at least one day to set available blocks.
                  </p>
                )}

                {enabledDayRows.length > 0 && (
                  <div className={styles.workingHoursRows}>
                    {enabledDayRows.map((day) => {
                      const blocks = workingHours.days[day.key].blocks;

                      return (
                        <div key={day.key} className={styles.workingHoursRow}>
                          <div className={styles.workingHoursRowHeader}>
                            <p className={styles.workingHoursDayLabel}>
                              {day.label}
                            </p>
                            <div className={styles.workingHoursRowActions}>
                              <button
                                type="button"
                                className={styles.inlineActionButton}
                                disabled={isWorkingHoursSaving}
                                onClick={() =>
                                  copyDayBlocksToEnabledDays(day.key)
                                }
                              >
                                Copy times to all
                              </button>
                              <button
                                type="button"
                                className={styles.iconActionButton}
                                disabled={isWorkingHoursSaving}
                                onClick={() => addBlockToDay(day.key)}
                                aria-label={`Add block for ${day.label}`}
                              >
                                <IconPlus width={14} height={14} />
                              </button>
                            </div>
                          </div>

                          {blocks.length === 0 ? (
                            <p className={styles.statusMessage}>
                              No blocks configured for this day.
                            </p>
                          ) : (
                            <div className={styles.timeBlockList}>
                              {blocks.map((block, blockIndex) => (
                                <div
                                  key={`${day.key}-${blockIndex}`}
                                  className={styles.timeBlockRow}
                                >
                                  <select
                                    value={block.startMinute}
                                    disabled={isWorkingHoursSaving}
                                    className={styles.timeSelect}
                                    onChange={(event) =>
                                      updateBlockStartMinute(
                                        day.key,
                                        blockIndex,
                                        Number(event.target.value),
                                      )
                                    }
                                  >
                                    {START_TIME_OPTIONS.map((minute) => (
                                      <option key={`start-${minute}`} value={minute}>
                                        {formatMinutes(minute)}
                                      </option>
                                    ))}
                                  </select>

                                  <span className={styles.toLabel}>to</span>

                                  <select
                                    value={block.endMinute}
                                    disabled={isWorkingHoursSaving}
                                    className={styles.timeSelect}
                                    onChange={(event) =>
                                      updateBlockEndMinute(
                                        day.key,
                                        blockIndex,
                                        Number(event.target.value),
                                      )
                                    }
                                  >
                                    {END_TIME_OPTIONS.map((minute) => (
                                      <option key={`end-${minute}`} value={minute}>
                                        {formatMinutes(minute)}
                                      </option>
                                    ))}
                                  </select>

                                  <button
                                    type="button"
                                    className={styles.removeBlockButton}
                                    disabled={isWorkingHoursSaving}
                                    onClick={() =>
                                      removeBlockFromDay(day.key, blockIndex)
                                    }
                                    aria-label={`Remove block ${blockIndex + 1} for ${day.label}`}
                                  >
                                    -
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
