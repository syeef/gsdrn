import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  task,
  taskSchedule,
  userScheduleProfile,
  type Task,
  type TaskSchedule,
  type UserScheduleProfile,
} from "~/database/schema";
import {
  createTaskEvent,
  deleteTaskEvent,
  listEventsForUserWithinWindow,
  updateTaskEvent,
  type GoogleEnv,
} from "~/server/googleCalendar.server";
import { getWorkingHoursForUser } from "~/server/workingHours.server";
import type { DB } from "~/utils/db.service.server";
import { decryptAtRest } from "~/utils/encryption.server";
import type { WeekdayKey, WorkingHoursDocument } from "~/utils/workingHours";

const SLOT_STEP_MINUTES = 30;
const SLOT_STEP_MS = SLOT_STEP_MINUTES * 60 * 1000;
const SCHEDULING_HORIZON_DAYS = 7;
const SCHEDULING_HORIZON_MS = SCHEDULING_HORIZON_DAYS * 24 * 60 * 60 * 1000;
const MIN_ESTIMATE_MINUTES = 30;
const MAX_ESTIMATE_MINUTES = 240;
const DEFAULT_ESTIMATE_MINUTES = 60;

const WEEKDAY_FROM_SHORT: Record<string, WeekdayKey> = {
  Sun: "sun",
  Mon: "mon",
  Tue: "tue",
  Wed: "wed",
  Thu: "thu",
  Fri: "fri",
  Sat: "sat",
};

type WorkersAiBinding = {
  run: (model: string, input: unknown) => Promise<unknown>;
};

type SchedulingEnv = GoogleEnv & {
  AI?: WorkersAiBinding;
};

type LocalDateParts = {
  dateKey: string;
  weekday: WeekdayKey;
  minuteOfDay: number;
};

type BusyInterval = {
  startMs: number;
  endMs: number;
};

type DurationEstimate = {
  estimatedMinutes: number;
  aiCategory: string | null;
  aiConfidence: number | null;
};

type ScheduleSlot = {
  start: Date;
  end: Date;
};

export type TaskScheduleErrorCode =
  | "NEEDS_GOOGLE_WRITE_SCOPE"
  | "TASK_NOT_FOUND"
  | "TASK_DONE"
  | "NO_SLOT_FOUND"
  | "CALENDAR_NOT_CONNECTED"
  | "FORBIDDEN"
  | "INTERNAL";

export type TaskScheduleResult =
  | {
      ok: true;
      scheduledStart: string;
      scheduledEnd: string;
      estimatedMinutes: number;
      calendarId: string;
      eventId: string;
    }
  | {
      ok: false;
      code: TaskScheduleErrorCode;
      error?: string;
    };

const localPartsFormatterCache = new Map<string, Intl.DateTimeFormat>();

const getLocalPartsFormatter = (timeZone: string) => {
  const cached = localPartsFormatterCache.get(timeZone);
  if (cached) return cached;
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  localPartsFormatterCache.set(timeZone, formatter);
  return formatter;
};

export function isValidTimeZone(timeZone: string): boolean {
  if (typeof timeZone !== "string" || timeZone.trim().length === 0) return false;
  try {
    Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function getLocalDateParts(date: Date, timeZone: string): LocalDateParts {
  const formatter = getLocalPartsFormatter(timeZone);
  const parts = formatter.formatToParts(date);
  const values: Record<string, string> = {};
  for (const part of parts) {
    values[part.type] = part.value;
  }
  const year = values.year ?? "1970";
  const month = values.month ?? "01";
  const day = values.day ?? "01";
  const weekdayLabel = values.weekday ?? "Mon";
  const weekday = WEEKDAY_FROM_SHORT[weekdayLabel] ?? "mon";
  const hour = Number(values.hour ?? "0");
  const minute = Number(values.minute ?? "0");
  const minuteOfDay = hour * 60 + minute;
  return {
    dateKey: `${year}-${month}-${day}`,
    weekday,
    minuteOfDay,
  };
}

function roundUpToStep(ms: number): number {
  return Math.ceil(ms / SLOT_STEP_MS) * SLOT_STEP_MS;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function extractTaskPlainText(taskBody: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(taskBody);
  } catch {
    return "";
  }

  const walk = (node: unknown): string => {
    if (!node || typeof node !== "object") return "";
    if ("text" in node && typeof (node as { text?: unknown }).text === "string") {
      return (node as { text: string }).text;
    }
    const children = (node as { children?: unknown }).children;
    if (!Array.isArray(children)) return "";
    return children.map(walk).join(" ");
  };

  if (!Array.isArray(parsed)) return "";
  return parsed.map(walk).join(" ").replace(/\s+/g, " ").trim();
}

function applyKeywordHeuristics(description: string, minutes: number): number {
  const text = description.toLowerCase();
  let delta = 0;

  if (/\b(quick|tiny|minor|small|brief)\b/.test(text)) delta -= 15;
  if (/\b(email|reply|follow up|follow-up|admin)\b/.test(text)) delta -= 15;
  if (/\b(research|design|implement|integration|refactor)\b/.test(text)) delta += 30;
  if (/\b(deep|architecture|migration|comprehensive|strategy)\b/.test(text)) {
    delta += 45;
  }

  return minutes + clamp(delta, -30, 45);
}

function roundToStep(minutes: number): number {
  return Math.ceil(minutes / SLOT_STEP_MINUTES) * SLOT_STEP_MINUTES;
}

export function normalizeEstimatedMinutes(
  baseMinutes: number,
  paceMultiplier: number,
  description: string,
): number {
  const safeBase = Number.isFinite(baseMinutes) ? baseMinutes : DEFAULT_ESTIMATE_MINUTES;
  const safePace = Number.isFinite(paceMultiplier) ? paceMultiplier : 1;
  const paceAdjusted = safeBase * safePace;
  const heuristicAdjusted = applyKeywordHeuristics(description, paceAdjusted);
  return roundToStep(
    clamp(heuristicAdjusted, MIN_ESTIMATE_MINUTES, MAX_ESTIMATE_MINUTES),
  );
}

function parseAiJsonBlock(input: string): Record<string, unknown> | null {
  const start = input.indexOf("{");
  const end = input.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const parsed = JSON.parse(input.slice(start, end + 1));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function estimateWithWorkersAi(
  ai: WorkersAiBinding,
  description: string,
): Promise<{ minutes: number; category: string | null; confidence: number | null } | null> {
  const model = "@cf/meta/llama-3.1-8b-instruct";
  const prompt = [
    "Estimate focused work duration for a single task.",
    "Return JSON only with keys: minutes(number), category(string), confidence(number 0..1).",
    "minutes must be between 15 and 300.",
    `Task: ${description}`,
  ].join("\n");

  try {
    const response = await ai.run(model, {
      messages: [
        {
          role: "system",
          content:
            "You are a task duration estimator. Respond with strict JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 128,
    });

    let responseText: string | null = null;
    if (typeof response === "string") {
      responseText = response;
    } else if (response && typeof response === "object") {
      const r = response as Record<string, unknown>;
      if (typeof r.response === "string") responseText = r.response;
      if (!responseText && typeof r.result === "string") responseText = r.result;
    }

    if (!responseText) return null;
    const parsed = parseAiJsonBlock(responseText);
    if (!parsed) return null;

    const minutes = Number(parsed.minutes);
    const confidence = Number(parsed.confidence);
    const category =
      typeof parsed.category === "string" && parsed.category.trim().length > 0
        ? parsed.category.trim()
        : null;

    if (!Number.isFinite(minutes)) return null;
    return {
      minutes,
      category,
      confidence: Number.isFinite(confidence) ? clamp(confidence, 0, 1) : null,
    };
  } catch (error) {
    console.warn("Workers AI estimation failed, using heuristic fallback:", error);
    return null;
  }
}

function fallbackDurationEstimate(description: string): {
  minutes: number;
  category: string;
  confidence: number;
} {
  const text = description.toLowerCase();
  let minutes = DEFAULT_ESTIMATE_MINUTES;
  let category = "general";
  let confidence = 0.5;

  if (text.length < 48 || /\b(quick|tiny|minor)\b/.test(text)) {
    minutes = 30;
    category = "quick";
    confidence = 0.6;
  } else if (/\b(email|reply|follow up|follow-up|admin)\b/.test(text)) {
    minutes = 45;
    category = "admin";
    confidence = 0.65;
  } else if (/\b(research|design|implement|integration|refactor)\b/.test(text)) {
    minutes = 90;
    category = "deep-work";
    confidence = 0.7;
  } else if (/\b(migration|architecture|comprehensive|strategy)\b/.test(text)) {
    minutes = 120;
    category = "deep-work";
    confidence = 0.72;
  }

  return { minutes, category, confidence };
}

async function estimateDuration(
  description: string,
  paceMultiplier: number,
  ai?: WorkersAiBinding,
): Promise<DurationEstimate> {
  const trimmed = description.trim();
  if (!trimmed) {
    const normalized = normalizeEstimatedMinutes(
      DEFAULT_ESTIMATE_MINUTES,
      paceMultiplier,
      trimmed,
    );
    return { estimatedMinutes: normalized, aiCategory: "general", aiConfidence: 0.2 };
  }

  const aiEstimate = ai ? await estimateWithWorkersAi(ai, trimmed) : null;
  const fallback = fallbackDurationEstimate(trimmed);
  const base = aiEstimate?.minutes ?? fallback.minutes;
  const normalized = normalizeEstimatedMinutes(base, paceMultiplier, trimmed);

  return {
    estimatedMinutes: normalized,
    aiCategory: aiEstimate?.category ?? fallback.category,
    aiConfidence: aiEstimate?.confidence ?? fallback.confidence,
  };
}

function toBusyIntervals(events: Array<Record<string, unknown>>): BusyInterval[] {
  const intervals: BusyInterval[] = [];
  for (const rawEvent of events) {
    const event = rawEvent as {
      status?: string;
      transparency?: string;
      start?: { dateTime?: string; date?: string };
      end?: { dateTime?: string; date?: string };
    };
    if (event.status === "cancelled") continue;
    if (event.transparency === "transparent") continue;

    const startRaw = event.start?.dateTime ?? event.start?.date;
    const endRaw = event.end?.dateTime ?? event.end?.date;
    if (!startRaw) continue;

    const start = new Date(startRaw);
    const end = new Date(endRaw ?? start.getTime() + SLOT_STEP_MS);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) continue;

    const startMs = start.getTime();
    const endMs = Math.max(end.getTime(), startMs + SLOT_STEP_MS);
    intervals.push({ startMs, endMs });
  }

  intervals.sort((a, b) => a.startMs - b.startMs);
  return intervals;
}

function overlapsBusyInterval(
  startMs: number,
  endMs: number,
  busyIntervals: BusyInterval[],
): boolean {
  for (const interval of busyIntervals) {
    if (interval.endMs <= startMs) continue;
    if (interval.startMs >= endMs) break;
    if (interval.startMs < endMs && interval.endMs > startMs) return true;
  }
  return false;
}

function fitsWorkingHoursSegment(
  segmentStartMs: number,
  timeZone: string,
  workingHours: WorkingHoursDocument,
): boolean {
  const local = getLocalDateParts(new Date(segmentStartMs), timeZone);
  const day = workingHours.days[local.weekday];
  if (!day?.enabled) return false;

  const segmentEndMinute = local.minuteOfDay + SLOT_STEP_MINUTES;
  return day.blocks.some(
    (block) =>
      local.minuteOfDay >= block.startMinute && segmentEndMinute <= block.endMinute,
  );
}

function fitsWorkingHoursRange(
  startMs: number,
  endMs: number,
  timeZone: string,
  workingHours: WorkingHoursDocument,
): boolean {
  for (let cursor = startMs; cursor < endMs; cursor += SLOT_STEP_MS) {
    if (!fitsWorkingHoursSegment(cursor, timeZone, workingHours)) {
      return false;
    }
  }
  return true;
}

export function findScheduleSlot(options: {
  searchStart: Date;
  durationMinutes: number;
  timeZone: string;
  workingHours: WorkingHoursDocument;
  busyIntervals: BusyInterval[];
  horizonDays?: number;
}): ScheduleSlot | null {
  const horizonDays = options.horizonDays ?? SCHEDULING_HORIZON_DAYS;
  const startMs = roundUpToStep(options.searchStart.getTime());
  const durationMs = options.durationMinutes * 60 * 1000;
  const horizonEndMs = startMs + horizonDays * 24 * 60 * 60 * 1000;

  for (
    let candidateStart = startMs;
    candidateStart + durationMs <= horizonEndMs;
    candidateStart += SLOT_STEP_MS
  ) {
    const candidateEnd = candidateStart + durationMs;

    if (
      !fitsWorkingHoursRange(
        candidateStart,
        candidateEnd,
        options.timeZone,
        options.workingHours,
      )
    ) {
      continue;
    }

    if (overlapsBusyInterval(candidateStart, candidateEnd, options.busyIntervals)) {
      continue;
    }

    return {
      start: new Date(candidateStart),
      end: new Date(candidateEnd),
    };
  }

  return null;
}

function localDateKey(date: Date, timeZone: string): string {
  return getLocalDateParts(date, timeZone).dateKey;
}

async function getTaskScheduleForTask(
  db: DB,
  userId: string,
  taskId: string,
): Promise<TaskSchedule | null> {
  const row = await db.query.taskSchedule.findFirst({
    where: and(eq(taskSchedule.userId, userId), eq(taskSchedule.taskId, taskId)),
  });
  return row ?? null;
}

async function getOrCreateScheduleProfile(
  db: DB,
  userId: string,
  timeZone: string,
): Promise<UserScheduleProfile> {
  const existing = await db.query.userScheduleProfile.findFirst({
    where: eq(userScheduleProfile.userId, userId),
  });
  const now = new Date();

  if (!existing) {
    await db.insert(userScheduleProfile).values({
      userId,
      timeZone,
      paceMultiplier: 1,
      successCount: 0,
      rescheduleCount: 0,
      createdAt: now,
      updatedAt: now,
    });
    const inserted = await db.query.userScheduleProfile.findFirst({
      where: eq(userScheduleProfile.userId, userId),
    });
    if (!inserted) {
      throw new Error("Failed to create scheduling profile.");
    }
    return inserted;
  }

  if (existing.timeZone !== timeZone) {
    await db
      .update(userScheduleProfile)
      .set({
        timeZone,
        updatedAt: now,
      })
      .where(eq(userScheduleProfile.userId, userId));
    return {
      ...existing,
      timeZone,
      updatedAt: now,
    };
  }

  return existing;
}

async function upsertTaskScheduleRow(
  db: DB,
  options: {
    userId: string;
    taskId: string;
    scheduleId: string;
    status: "scheduled" | "unscheduled" | "completed";
    calendarId: string | null;
    eventId: string | null;
    scheduledStart: Date | null;
    scheduledEnd: Date | null;
    estimatedMinutes: number | null;
    aiCategory: string | null;
    aiConfidence: number | null;
    autoRescheduleCount?: number;
    lastScheduledLocalDate: string | null;
    lastErrorCode: string | null;
    lastErrorMessage: string | null;
  },
) {
  const now = new Date();

  await db
    .insert(taskSchedule)
    .values({
      id: options.scheduleId,
      userId: options.userId,
      taskId: options.taskId,
      status: options.status,
      calendarId: options.calendarId,
      eventId: options.eventId,
      scheduledStart: options.scheduledStart,
      scheduledEnd: options.scheduledEnd,
      estimatedMinutes: options.estimatedMinutes,
      aiCategory: options.aiCategory,
      aiConfidence: options.aiConfidence,
      autoRescheduleCount: options.autoRescheduleCount ?? 0,
      lastScheduledLocalDate: options.lastScheduledLocalDate,
      lastErrorCode: options.lastErrorCode,
      lastErrorMessage: options.lastErrorMessage,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [taskSchedule.userId, taskSchedule.taskId],
      set: {
        status: options.status,
        calendarId: options.calendarId,
        eventId: options.eventId,
        scheduledStart: options.scheduledStart,
        scheduledEnd: options.scheduledEnd,
        estimatedMinutes: options.estimatedMinutes,
        aiCategory: options.aiCategory,
        aiConfidence: options.aiConfidence,
        autoRescheduleCount: options.autoRescheduleCount,
        lastScheduledLocalDate: options.lastScheduledLocalDate,
        lastErrorCode: options.lastErrorCode,
        lastErrorMessage: options.lastErrorMessage,
        updatedAt: now,
      },
    });
}

async function loadTaskForScheduling(
  db: DB,
  userId: string,
  taskId: string,
): Promise<Task | null> {
  const row = await db.query.task.findFirst({
    where: and(eq(task.userId, userId), eq(task.id, taskId)),
  });
  return row ?? null;
}

async function fetchBusyIntervals(
  db: DB,
  env: SchedulingEnv,
  userId: string,
  windowStart: Date,
): Promise<{ connected: boolean; busyIntervals: BusyInterval[] }> {
  const timeMin = windowStart.toISOString();
  const timeMax = new Date(windowStart.getTime() + SCHEDULING_HORIZON_MS).toISOString();
  const eventsResult = await listEventsForUserWithinWindow(db, env, userId, {
    timeMin,
    timeMax,
    maxResultsPerCalendar: 200,
  });

  if (!eventsResult.connected) {
    return { connected: false, busyIntervals: [] };
  }

  return {
    connected: true,
    busyIntervals: toBusyIntervals(eventsResult.events as Array<Record<string, unknown>>),
  };
}

async function writeOrMoveCalendarEvent(
  db: DB,
  env: SchedulingEnv,
  userId: string,
  options: {
    existingSchedule: TaskSchedule | null;
    summary: string;
    start: Date;
    end: Date;
    timeZone: string;
    taskId: string;
    taskScheduleId: string;
  },
): Promise<{ calendarId: string; eventId: string } | TaskScheduleResult> {
  const existing = options.existingSchedule;
  if (existing?.calendarId && existing.eventId) {
    const moved = await updateTaskEvent(db, env, userId, {
      calendarId: existing.calendarId,
      eventId: existing.eventId,
      summary: options.summary,
      start: options.start,
      end: options.end,
      timeZone: options.timeZone,
      taskId: options.taskId,
      taskScheduleId: options.taskScheduleId,
    });

    if (moved.ok) {
      return { calendarId: moved.calendarId, eventId: moved.eventId };
    }

    if (moved.code === "CALENDAR_NOT_CONNECTED") {
      return { ok: false, code: "CALENDAR_NOT_CONNECTED" };
    }
  }

  const created = await createTaskEvent(db, env, userId, {
    summary: options.summary,
    start: options.start,
    end: options.end,
    timeZone: options.timeZone,
    taskId: options.taskId,
    taskScheduleId: options.taskScheduleId,
    calendarId: existing?.calendarId ?? null,
  });

  if (!created.ok) {
    if (created.code === "CALENDAR_NOT_CONNECTED") {
      return { ok: false, code: "CALENDAR_NOT_CONNECTED" };
    }
    return { ok: false, code: "INTERNAL", error: created.error };
  }

  return {
    calendarId: created.calendarId,
    eventId: created.eventId,
  };
}

export async function scheduleTaskForUser(
  db: DB,
  env: SchedulingEnv,
  options: {
    userId: string;
    taskId: string;
    timeZone: string;
    now?: Date;
  },
): Promise<TaskScheduleResult> {
  const now = options.now ?? new Date();

  if (!isValidTimeZone(options.timeZone)) {
    return { ok: false, code: "INTERNAL", error: "Invalid timezone." };
  }

  const row = await loadTaskForScheduling(db, options.userId, options.taskId);
  if (!row) {
    return { ok: false, code: "TASK_NOT_FOUND" };
  }
  if (row.status === "done") {
    return { ok: false, code: "TASK_DONE" };
  }

  const decryptedBody = await decryptAtRest(row.body, env);
  const taskText = extractTaskPlainText(decryptedBody);
  const summary = taskText.length > 0 ? taskText.slice(0, 120) : "Scheduled task";

  const profile = await getOrCreateScheduleProfile(
    db,
    options.userId,
    options.timeZone,
  );
  const workingHours = await getWorkingHoursForUser(db, options.userId);
  const busyResult = await fetchBusyIntervals(db, env, options.userId, now);

  if (!busyResult.connected) {
    return { ok: false, code: "CALENDAR_NOT_CONNECTED" };
  }

  const estimate = await estimateDuration(taskText, profile.paceMultiplier, env.AI);
  const slot = findScheduleSlot({
    searchStart: now,
    durationMinutes: estimate.estimatedMinutes,
    timeZone: profile.timeZone,
    workingHours,
    busyIntervals: busyResult.busyIntervals,
  });

  if (!slot) {
    const existing = await getTaskScheduleForTask(db, options.userId, options.taskId);
    const scheduleId = existing?.id ?? nanoid();
    await upsertTaskScheduleRow(db, {
      userId: options.userId,
      taskId: options.taskId,
      scheduleId,
      status: "unscheduled",
      calendarId: existing?.calendarId ?? null,
      eventId: existing?.eventId ?? null,
      scheduledStart: existing?.scheduledStart ?? null,
      scheduledEnd: existing?.scheduledEnd ?? null,
      estimatedMinutes: estimate.estimatedMinutes,
      aiCategory: estimate.aiCategory,
      aiConfidence: estimate.aiConfidence,
      autoRescheduleCount: existing?.autoRescheduleCount ?? 0,
      lastScheduledLocalDate: existing?.lastScheduledLocalDate ?? null,
      lastErrorCode: "NO_SLOT_FOUND",
      lastErrorMessage: "No suitable slot found within 7 days.",
    });
    return { ok: false, code: "NO_SLOT_FOUND" };
  }

  const existing = await getTaskScheduleForTask(db, options.userId, options.taskId);
  const scheduleId = existing?.id ?? nanoid();

  const eventWrite = await writeOrMoveCalendarEvent(db, env, options.userId, {
    existingSchedule: existing,
    summary,
    start: slot.start,
    end: slot.end,
    timeZone: profile.timeZone,
    taskId: options.taskId,
    taskScheduleId: scheduleId,
  });

  if ("ok" in eventWrite && !eventWrite.ok) {
    return eventWrite;
  }

  await upsertTaskScheduleRow(db, {
    userId: options.userId,
    taskId: options.taskId,
    scheduleId,
    status: "scheduled",
    calendarId: eventWrite.calendarId,
    eventId: eventWrite.eventId,
    scheduledStart: slot.start,
    scheduledEnd: slot.end,
    estimatedMinutes: estimate.estimatedMinutes,
    aiCategory: estimate.aiCategory,
    aiConfidence: estimate.aiConfidence,
    autoRescheduleCount: existing?.autoRescheduleCount ?? 0,
    lastScheduledLocalDate: localDateKey(slot.start, profile.timeZone),
    lastErrorCode: null,
    lastErrorMessage: null,
  });

  return {
    ok: true,
    scheduledStart: slot.start.toISOString(),
    scheduledEnd: slot.end.toISOString(),
    estimatedMinutes: estimate.estimatedMinutes,
    calendarId: eventWrite.calendarId,
    eventId: eventWrite.eventId,
  };
}

async function adjustPaceOnSuccess(db: DB, userId: string) {
  const profile = await db.query.userScheduleProfile.findFirst({
    where: eq(userScheduleProfile.userId, userId),
  });
  if (!profile) return;
  await db
    .update(userScheduleProfile)
    .set({
      successCount: (profile.successCount ?? 0) + 1,
      paceMultiplier: clamp((profile.paceMultiplier ?? 1) * 0.98, 0.7, 2),
      updatedAt: new Date(),
    })
    .where(eq(userScheduleProfile.userId, userId));
}

async function adjustPaceOnReschedule(db: DB, userId: string) {
  const profile = await db.query.userScheduleProfile.findFirst({
    where: eq(userScheduleProfile.userId, userId),
  });
  if (!profile) return;
  await db
    .update(userScheduleProfile)
    .set({
      rescheduleCount: (profile.rescheduleCount ?? 0) + 1,
      paceMultiplier: clamp((profile.paceMultiplier ?? 1) * 1.06, 0.7, 2.5),
      updatedAt: new Date(),
    })
    .where(eq(userScheduleProfile.userId, userId));
}

export async function handleTaskCompletedForScheduling(
  db: DB,
  env: SchedulingEnv,
  options: {
    userId: string;
    taskId: string;
    now?: Date;
  },
) {
  const now = options.now ?? new Date();
  const schedule = await getTaskScheduleForTask(db, options.userId, options.taskId);
  if (!schedule) return;

  if (
    schedule.status === "scheduled" &&
    schedule.scheduledStart &&
    schedule.scheduledStart.getTime() > now.getTime() &&
    schedule.calendarId &&
    schedule.eventId
  ) {
    await deleteTaskEvent(db, env, options.userId, {
      calendarId: schedule.calendarId,
      eventId: schedule.eventId,
    });
  }

  await upsertTaskScheduleRow(db, {
    userId: options.userId,
    taskId: options.taskId,
    scheduleId: schedule.id,
    status: "completed",
    calendarId: schedule.calendarId,
    eventId: schedule.eventId,
    scheduledStart: schedule.scheduledStart,
    scheduledEnd: schedule.scheduledEnd,
    estimatedMinutes: schedule.estimatedMinutes,
    aiCategory: schedule.aiCategory,
    aiConfidence: schedule.aiConfidence,
    autoRescheduleCount: schedule.autoRescheduleCount ?? 0,
    lastScheduledLocalDate: schedule.lastScheduledLocalDate,
    lastErrorCode: null,
    lastErrorMessage: null,
  });

  await adjustPaceOnSuccess(db, options.userId);
}

async function reconcileScheduledTaskRow(
  db: DB,
  env: SchedulingEnv,
  row: TaskSchedule,
  timeZone: string,
  now: Date,
): Promise<boolean> {
  const currentLocalDate = localDateKey(now, timeZone);
  if (!row.lastScheduledLocalDate) return false;
  if (currentLocalDate <= row.lastScheduledLocalDate) return false;

  const currentTask = await loadTaskForScheduling(db, row.userId, row.taskId);
  if (!currentTask || currentTask.status === "done") {
    await handleTaskCompletedForScheduling(db, env, {
      userId: row.userId,
      taskId: row.taskId,
      now,
    });
    return false;
  }

  const decryptedBody = await decryptAtRest(currentTask.body, env);
  const taskText = extractTaskPlainText(decryptedBody);
  const summary = taskText.length > 0 ? taskText.slice(0, 120) : "Scheduled task";

  const workingHours = await getWorkingHoursForUser(db, row.userId);
  const busyResult = await fetchBusyIntervals(db, env, row.userId, now);
  if (!busyResult.connected) {
    await upsertTaskScheduleRow(db, {
      userId: row.userId,
      taskId: row.taskId,
      scheduleId: row.id,
      status: "unscheduled",
      calendarId: row.calendarId,
      eventId: row.eventId,
      scheduledStart: row.scheduledStart,
      scheduledEnd: row.scheduledEnd,
      estimatedMinutes: row.estimatedMinutes,
      aiCategory: row.aiCategory,
      aiConfidence: row.aiConfidence,
      autoRescheduleCount: row.autoRescheduleCount ?? 0,
      lastScheduledLocalDate: row.lastScheduledLocalDate,
      lastErrorCode: "CALENDAR_NOT_CONNECTED",
      lastErrorMessage: "Calendar disconnected during auto-reschedule.",
    });
    return false;
  }

  const duration = clamp(
    row.estimatedMinutes ?? DEFAULT_ESTIMATE_MINUTES,
    MIN_ESTIMATE_MINUTES,
    MAX_ESTIMATE_MINUTES,
  );
  const slot = findScheduleSlot({
    searchStart: now,
    durationMinutes: roundToStep(duration),
    timeZone,
    workingHours,
    busyIntervals: busyResult.busyIntervals,
  });

  if (!slot) {
    await upsertTaskScheduleRow(db, {
      userId: row.userId,
      taskId: row.taskId,
      scheduleId: row.id,
      status: "unscheduled",
      calendarId: row.calendarId,
      eventId: row.eventId,
      scheduledStart: row.scheduledStart,
      scheduledEnd: row.scheduledEnd,
      estimatedMinutes: row.estimatedMinutes,
      aiCategory: row.aiCategory,
      aiConfidence: row.aiConfidence,
      autoRescheduleCount: row.autoRescheduleCount ?? 0,
      lastScheduledLocalDate: currentLocalDate,
      lastErrorCode: "NO_SLOT_FOUND",
      lastErrorMessage: "No slot available in preferred hours.",
    });
    return false;
  }

  const eventWrite = await writeOrMoveCalendarEvent(db, env, row.userId, {
    existingSchedule: row,
    summary,
    start: slot.start,
    end: slot.end,
    timeZone,
    taskId: row.taskId,
    taskScheduleId: row.id,
  });

  if ("ok" in eventWrite && !eventWrite.ok) {
    await upsertTaskScheduleRow(db, {
      userId: row.userId,
      taskId: row.taskId,
      scheduleId: row.id,
      status: "unscheduled",
      calendarId: row.calendarId,
      eventId: row.eventId,
      scheduledStart: row.scheduledStart,
      scheduledEnd: row.scheduledEnd,
      estimatedMinutes: row.estimatedMinutes,
      aiCategory: row.aiCategory,
      aiConfidence: row.aiConfidence,
      autoRescheduleCount: row.autoRescheduleCount ?? 0,
      lastScheduledLocalDate: currentLocalDate,
      lastErrorCode: eventWrite.code,
      lastErrorMessage: eventWrite.error ?? "Failed to move scheduled event.",
    });
    return false;
  }

  await upsertTaskScheduleRow(db, {
    userId: row.userId,
    taskId: row.taskId,
    scheduleId: row.id,
    status: "scheduled",
    calendarId: eventWrite.calendarId,
    eventId: eventWrite.eventId,
    scheduledStart: slot.start,
    scheduledEnd: slot.end,
    estimatedMinutes: row.estimatedMinutes,
    aiCategory: row.aiCategory,
    aiConfidence: row.aiConfidence,
    autoRescheduleCount: (row.autoRescheduleCount ?? 0) + 1,
    lastScheduledLocalDate: currentLocalDate,
    lastErrorCode: null,
    lastErrorMessage: null,
  });

  await adjustPaceOnReschedule(db, row.userId);
  return true;
}

export async function reconcileOverdueScheduledTasksForUser(
  db: DB,
  env: SchedulingEnv,
  options: {
    userId: string;
    fallbackTimeZone?: string | null;
    now?: Date;
  },
): Promise<{ movedCount: number }> {
  const now = options.now ?? new Date();
  const profile = await db.query.userScheduleProfile.findFirst({
    where: eq(userScheduleProfile.userId, options.userId),
  });
  const timeZone = profile?.timeZone ?? options.fallbackTimeZone ?? null;

  if (!timeZone || !isValidTimeZone(timeZone)) {
    return { movedCount: 0 };
  }

  if (!profile) {
    await getOrCreateScheduleProfile(db, options.userId, timeZone);
  }

  const rows = await db.query.taskSchedule.findMany({
    where: and(eq(taskSchedule.userId, options.userId), eq(taskSchedule.status, "scheduled")),
  });

  let movedCount = 0;
  for (const row of rows) {
    const moved = await reconcileScheduledTaskRow(db, env, row, timeZone, now);
    if (moved) movedCount += 1;
  }

  return { movedCount };
}

export async function reconcileOverdueScheduledTasksForAllUsers(
  db: DB,
  env: SchedulingEnv,
  options?: { now?: Date },
): Promise<{ scannedUsers: number; movedCount: number }> {
  const rows = await db.query.taskSchedule.findMany({
    where: eq(taskSchedule.status, "scheduled"),
  });
  const userIds = Array.from(new Set(rows.map((row) => row.userId)));
  let movedCount = 0;

  for (const userId of userIds) {
    const result = await reconcileOverdueScheduledTasksForUser(db, env, {
      userId,
      now: options?.now,
    });
    movedCount += result.movedCount;
  }

  return {
    scannedUsers: userIds.length,
    movedCount,
  };
}
