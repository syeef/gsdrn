import assert from "node:assert/strict";
import test from "node:test";
import {
  createDefaultWorkingHoursDocument,
  normalizeWorkingHours,
  validateWorkingHours,
} from "./workingHours.js";

test("normalizeWorkingHours sorts blocks by start minute", () => {
  const doc = createDefaultWorkingHoursDocument();
  doc.days.mon.blocks = [
    { startMinute: 600, endMinute: 660 },
    { startMinute: 510, endMinute: 570 },
  ];

  const normalized = normalizeWorkingHours(doc);
  assert.deepEqual(normalized.days.mon.blocks, [
    { startMinute: 510, endMinute: 570 },
    { startMinute: 600, endMinute: 660 },
  ]);
});

test("validateWorkingHours accepts multiple non-overlapping blocks", () => {
  const doc = createDefaultWorkingHoursDocument();
  doc.days.mon.blocks = [
    { startMinute: 510, endMinute: 600 },
    { startMinute: 630, endMinute: 720 },
  ];

  const result = validateWorkingHours(normalizeWorkingHours(doc));
  assert.equal(result.ok, true);
});

test("validateWorkingHours rejects overlapping blocks", () => {
  const doc = createDefaultWorkingHoursDocument();
  doc.days.mon.blocks = [
    { startMinute: 510, endMinute: 630 },
    { startMinute: 600, endMinute: 690 },
  ];

  const result = validateWorkingHours(normalizeWorkingHours(doc));
  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /overlap/i);
});

test("validateWorkingHours rejects non 30-minute boundaries", () => {
  const doc = createDefaultWorkingHoursDocument();
  doc.days.tue.blocks = [{ startMinute: 515, endMinute: 600 }];

  const result = validateWorkingHours(normalizeWorkingHours(doc));
  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /30-minute/i);
});

test("validateWorkingHours rejects start minute that is not before end minute", () => {
  const doc = createDefaultWorkingHoursDocument();
  doc.days.wed.blocks = [{ startMinute: 600, endMinute: 600 }];

  const result = validateWorkingHours(normalizeWorkingHours(doc));
  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /before end/i);
});
