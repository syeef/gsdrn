import { eq } from "drizzle-orm";
import { workingHoursPreference } from "~/database/schema";
import type { DB } from "~/utils/db.service.server";
import {
  copyDayToEnabledDays,
  createDefaultWorkingHoursDocument,
  normalizeWorkingHours,
  parseWorkingHoursDocument,
  validateWorkingHours,
  type WeekdayKey,
  type WorkingHoursDocument,
} from "~/utils/workingHours";

export {
  copyDayToEnabledDays,
  createDefaultWorkingHoursDocument,
  normalizeWorkingHours,
  validateWorkingHours,
  type WeekdayKey,
  type WorkingHoursDocument,
};

export async function getWorkingHoursForUser(
  db: DB,
  userId: string,
): Promise<WorkingHoursDocument> {
  const row = await db.query.workingHoursPreference.findFirst({
    where: eq(workingHoursPreference.userId, userId),
  });

  if (!row) {
    return createDefaultWorkingHoursDocument();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(row.scheduleJson);
  } catch {
    return createDefaultWorkingHoursDocument();
  }

  const parsedResult = parseWorkingHoursDocument(parsed);
  if (!parsedResult.ok || !parsedResult.workingHours) {
    return createDefaultWorkingHoursDocument();
  }

  const normalized = normalizeWorkingHours({
    ...parsedResult.workingHours,
    enabled: true,
  });
  const validation = validateWorkingHours(normalized);
  if (!validation.ok) {
    return createDefaultWorkingHoursDocument();
  }

  return normalized;
}

export async function upsertWorkingHoursForUser(
  db: DB,
  userId: string,
  workingHours: WorkingHoursDocument,
): Promise<WorkingHoursDocument> {
  const normalized = normalizeWorkingHours(workingHours);
  const validation = validateWorkingHours(normalized);
  if (!validation.ok) {
    throw new Error(validation.error ?? "Invalid working hours payload.");
  }

  const now = new Date();
  const scheduleJson = JSON.stringify(normalized);

  await db
    .insert(workingHoursPreference)
    .values({
      userId,
      enabled: true,
      scheduleJson,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [workingHoursPreference.userId],
      set: {
        enabled: true,
        scheduleJson,
        updatedAt: now,
      },
    });

  return normalized;
}
