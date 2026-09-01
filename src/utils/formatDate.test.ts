import { test } from "node:test";
import assert from "node:assert/strict";
import {
  formatDisplayDate,
  formatMonthYear,
  formatMonthYearRange,
} from "./formatDate.ts";

test("formatDisplayDate does not shift the day in negative UTC offsets", () => {
  // Regression: `pubDate: 2026-07-11` once rendered as "Jul 10, 2026" because a
  // date-only string is midnight UTC and Pacific time is behind UTC.
  // This assertion is only meaningful in a negative-UTC-offset zone, so the
  // `test` script pins TZ=America/Los_Angeles to guarantee one everywhere.
  assert.equal(formatDisplayDate(new Date("2026-07-11")), "Jul 11, 2026");
});

test("formatDisplayDate uses the abbreviated month labels", () => {
  assert.equal(formatDisplayDate(new Date("2026-09-01")), "Sept 1, 2026");
  assert.equal(formatDisplayDate(new Date("2026-01-31")), "Jan 31, 2026");
});

test("formatMonthYear renders a month-year string", () => {
  assert.equal(formatMonthYear("2025-06"), "Jun 2025");
  assert.equal(formatMonthYear("2026-03"), "Mar 2026");
});

test("formatMonthYear returns its input unchanged when unparseable", () => {
  assert.equal(formatMonthYear("not-a-date"), "not-a-date");
  assert.equal(formatMonthYear("2025-13"), "2025-13");
});

test("formatMonthYearRange uses 'present' when there is no end date", () => {
  assert.equal(formatMonthYearRange("2025-06"), "Jun 2025 — present");
});

test("formatMonthYearRange renders a closed range", () => {
  assert.equal(formatMonthYearRange("2026-03", "2026-06"), "Mar 2026 — Jun 2026");
});

test("formatMonthYearRange returns undefined without a start date", () => {
  assert.equal(formatMonthYearRange(undefined, "2026-06"), undefined);
});
