import assert from "node:assert/strict";
import test from "node:test";
import {
  isLabelColor,
  isLabelMode,
  normalizeLabelName,
  sanitizeLabelName,
  validateLabelName,
} from "./labels.js";

test("sanitizeLabelName trims and collapses whitespace", () => {
  assert.equal(sanitizeLabelName("   Jack's   Flight   Club   "), "Jack's Flight Club");
});

test("normalizeLabelName lowercases normalized form", () => {
  assert.equal(normalizeLabelName("  CloudFlare  "), "cloudflare");
});

test("validateLabelName rejects empty and too-long values", () => {
  const empty = validateLabelName("   ");
  assert.equal(empty.ok, false);

  const tooLong = validateLabelName("x".repeat(49));
  assert.equal(tooLong.ok, false);
});

test("validateLabelName returns sanitized and normalized names", () => {
  const valid = validateLabelName("  Team   Ops ");
  assert.equal(valid.ok, true);
  if (!valid.ok) return;
  assert.equal(valid.name, "Team Ops");
  assert.equal(valid.normalizedName, "team ops");
});

test("label mode and color guards enforce supported values", () => {
  assert.equal(isLabelMode("notes"), true);
  assert.equal(isLabelMode("todos"), true);
  assert.equal(isLabelMode("tasks"), false);

  assert.equal(isLabelColor("gray"), true);
  assert.equal(isLabelColor("blue"), true);
  assert.equal(isLabelColor("purple"), false);
});

