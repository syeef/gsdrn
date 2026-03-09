export const WEEKDAY_KEYS = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
] as const;

export type WeekdayKey = (typeof WEEKDAY_KEYS)[number];

export type TimeBlock = {
  startMinute: number;
  endMinute: number;
};

export type DaySchedule = {
  enabled: boolean;
  blocks: TimeBlock[];
};

export type WorkingHoursDocument = {
  version: 1;
  enabled: boolean;
  days: Record<WeekdayKey, DaySchedule>;
};

export const MINUTES_PER_DAY = 24 * 60;
export const WORKING_HOURS_STEP_MINUTES = 30;
export const DEFAULT_WORK_START_MINUTE = 8 * 60 + 30;
export const DEFAULT_WORK_END_MINUTE = 17 * 60;

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const cloneBlocks = (blocks: TimeBlock[]) =>
  blocks.map((block) => ({
    startMinute: block.startMinute,
    endMinute: block.endMinute,
  }));

const buildDay = (enabled: boolean, blocks: TimeBlock[]): DaySchedule => ({
  enabled,
  blocks: cloneBlocks(blocks),
});

export function createDefaultWorkingHoursDocument(): WorkingHoursDocument {
  const weekdayDefaultBlock = [
    {
      startMinute: DEFAULT_WORK_START_MINUTE,
      endMinute: DEFAULT_WORK_END_MINUTE,
    },
  ];

  return {
    version: 1,
    enabled: true,
    days: {
      sun: buildDay(false, []),
      mon: buildDay(true, weekdayDefaultBlock),
      tue: buildDay(true, weekdayDefaultBlock),
      wed: buildDay(true, weekdayDefaultBlock),
      thu: buildDay(true, weekdayDefaultBlock),
      fri: buildDay(true, weekdayDefaultBlock),
      sat: buildDay(false, []),
    },
  };
}

export function normalizeWorkingHours(
  doc: WorkingHoursDocument,
): WorkingHoursDocument {
  const normalizedDays = {} as Record<WeekdayKey, DaySchedule>;

  for (const dayKey of WEEKDAY_KEYS) {
    const day = doc.days[dayKey];
    const blocks = cloneBlocks(day.blocks).sort((a, b) => {
      if (a.startMinute !== b.startMinute) {
        return a.startMinute - b.startMinute;
      }
      return a.endMinute - b.endMinute;
    });

    normalizedDays[dayKey] = {
      enabled: Boolean(day.enabled),
      blocks,
    };
  }

  return {
    version: 1,
    enabled: true,
    days: normalizedDays,
  };
}

export function validateWorkingHours(doc: WorkingHoursDocument): {
  ok: boolean;
  error?: string;
} {
  if (doc.version !== 1) {
    return { ok: false, error: "Working hours version must be 1." };
  }

  for (const dayKey of WEEKDAY_KEYS) {
    const day = doc.days[dayKey];
    if (!day) {
      return { ok: false, error: `Missing schedule for ${dayKey}.` };
    }
    if (!Array.isArray(day.blocks)) {
      return { ok: false, error: `Invalid blocks for ${dayKey}.` };
    }

    let previousEnd = -1;
    for (const block of day.blocks) {
      if (!Number.isInteger(block.startMinute) || !Number.isInteger(block.endMinute)) {
        return { ok: false, error: `Times must be integers for ${dayKey}.` };
      }
      if (
        block.startMinute % WORKING_HOURS_STEP_MINUTES !== 0 ||
        block.endMinute % WORKING_HOURS_STEP_MINUTES !== 0
      ) {
        return {
          ok: false,
          error: `Times for ${dayKey} must be in ${WORKING_HOURS_STEP_MINUTES}-minute steps.`,
        };
      }
      if (block.startMinute < 0 || block.endMinute > MINUTES_PER_DAY) {
        return {
          ok: false,
          error: `Times for ${dayKey} must be between 00:00 and 24:00.`,
        };
      }
      if (block.startMinute >= block.endMinute) {
        return {
          ok: false,
          error: `Start time must be before end time for ${dayKey}.`,
        };
      }
      if (previousEnd > block.startMinute) {
        return {
          ok: false,
          error: `Time ranges overlap for ${dayKey}.`,
        };
      }
      previousEnd = block.endMinute;
    }
  }

  return { ok: true };
}

export function parseWorkingHoursDocument(value: unknown): {
  ok: boolean;
  workingHours?: WorkingHoursDocument;
  error?: string;
} {
  if (!isObjectRecord(value)) {
    return { ok: false, error: "Working hours payload must be an object." };
  }

  if (value.version !== 1) {
    return { ok: false, error: "Working hours version must be 1." };
  }
  if ("enabled" in value && typeof value.enabled !== "boolean") {
    return { ok: false, error: "Working hours enabled must be a boolean." };
  }
  if (!isObjectRecord(value.days)) {
    return { ok: false, error: "Working hours days must be an object." };
  }

  const days = {} as Record<WeekdayKey, DaySchedule>;

  for (const dayKey of WEEKDAY_KEYS) {
    const rawDay = value.days[dayKey];
    if (!isObjectRecord(rawDay)) {
      return { ok: false, error: `Missing day payload for ${dayKey}.` };
    }
    if (typeof rawDay.enabled !== "boolean") {
      return { ok: false, error: `Day enabled must be boolean for ${dayKey}.` };
    }
    if (!Array.isArray(rawDay.blocks)) {
      return { ok: false, error: `Day blocks must be an array for ${dayKey}.` };
    }

    const parsedBlocks: TimeBlock[] = [];
    for (const rawBlock of rawDay.blocks) {
      if (!isObjectRecord(rawBlock)) {
        return { ok: false, error: `Invalid block payload for ${dayKey}.` };
      }
      if (
        typeof rawBlock.startMinute !== "number" ||
        typeof rawBlock.endMinute !== "number"
      ) {
        return { ok: false, error: `Invalid time values for ${dayKey}.` };
      }

      parsedBlocks.push({
        startMinute: rawBlock.startMinute,
        endMinute: rawBlock.endMinute,
      });
    }

    days[dayKey] = {
      enabled: rawDay.enabled,
      blocks: parsedBlocks,
    };
  }

  const normalized = normalizeWorkingHours({
    version: 1,
    enabled: true,
    days,
  });
  const validation = validateWorkingHours(normalized);

  if (!validation.ok) {
    return { ok: false, error: validation.error };
  }

  return { ok: true, workingHours: normalized };
}

export function copyDayToEnabledDays(
  doc: WorkingHoursDocument,
  sourceDay: WeekdayKey,
): WorkingHoursDocument {
  const normalized = normalizeWorkingHours(doc);
  const sourceBlocks = cloneBlocks(normalized.days[sourceDay].blocks);
  const nextDays = { ...normalized.days };

  for (const dayKey of WEEKDAY_KEYS) {
    if (!nextDays[dayKey].enabled) continue;
    nextDays[dayKey] = {
      ...nextDays[dayKey],
      blocks: cloneBlocks(sourceBlocks),
    };
  }

  return {
    ...normalized,
    days: nextDays,
  };
}
