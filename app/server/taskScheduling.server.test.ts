import assert from "node:assert/strict";
import test from "node:test";
import {
  extractTaskPlainText,
  findScheduleSlot,
  normalizeEstimatedMinutes,
} from "./taskScheduling.server.js";
import { createDefaultWorkingHoursDocument } from "../utils/workingHours.js";

test("extractTaskPlainText flattens rich text nodes", () => {
  const body = JSON.stringify([
    { text: "Write" },
    {
      type: "link",
      children: [{ text: "API docs" }],
    },
  ]);

  assert.equal(extractTaskPlainText(body), "Write API docs");
});

test("normalizeEstimatedMinutes clamps and rounds to 30-minute steps", () => {
  assert.equal(normalizeEstimatedMinutes(18, 1, "quick fix"), 30);
  assert.equal(normalizeEstimatedMinutes(61, 1, "regular task"), 90);
  assert.equal(normalizeEstimatedMinutes(400, 1, "huge migration"), 240);
});

test("findScheduleSlot respects working hours and busy intervals", () => {
  const workingHours = createDefaultWorkingHoursDocument();
  workingHours.days.mon.blocks = [{ startMinute: 9 * 60, endMinute: 17 * 60 }];

  const searchStart = new Date("2026-03-09T08:15:00.000Z");
  const busyIntervals = [
    {
      startMs: new Date("2026-03-09T09:00:00.000Z").getTime(),
      endMs: new Date("2026-03-09T10:00:00.000Z").getTime(),
    },
  ];

  const slot = findScheduleSlot({
    searchStart,
    durationMinutes: 60,
    timeZone: "Europe/London",
    workingHours,
    busyIntervals,
    horizonDays: 2,
  });

  assert.ok(slot);
  assert.equal(slot?.start.toISOString(), "2026-03-09T10:00:00.000Z");
  assert.equal(slot?.end.toISOString(), "2026-03-09T11:00:00.000Z");
});
