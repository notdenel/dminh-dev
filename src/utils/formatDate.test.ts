import { test } from "node:test";
import assert from "node:assert/strict";
import {
  formatDisplayDate,
  formatMonthYear,
  formatMonthYearRange,
  formatYearRail,
  formatDayMonth,
} from "./formatDate.ts";

// new Date("2026-07-11") is midnight UTC, so the day-shift assertion below can
// only fail in a negative-UTC-offset zone. Pin one here rather than in the npm
// script, so the guard works on any platform and under any ambient TZ.
process.env.TZ = "America/Los_Angeles";

test("formatDisplayDate does not shift the day in negative UTC offsets", () => {
  // Regression: `pubDate: 2026-07-11` once rendered as "jul 10, 2026" because a
  // date-only string is midnight UTC and Pacific time is behind UTC.
  assert.equal(formatDisplayDate(new Date("2026-07-11")), "jul 11, 2026");
});

test("formatDisplayDate uses the abbreviated month labels", () => {
  assert.equal(formatDisplayDate(new Date("2026-09-01")), "sept 1, 2026");
  assert.equal(formatDisplayDate(new Date("2026-01-31")), "jan 31, 2026");
});

test("formatMonthYear renders a month-year string", () => {
  assert.equal(formatMonthYear("2025-06"), "jun 2025");
  assert.equal(formatMonthYear("2026-03"), "mar 2026");
});

test("formatMonthYear returns its input unchanged when unparseable", () => {
  assert.equal(formatMonthYear("not-a-date"), "not-a-date");
  assert.equal(formatMonthYear("2025-13"), "2025-13");
});

test("formatMonthYearRange uses 'present' when there is no end date", () => {
  assert.equal(formatMonthYearRange("2025-06"), "jun 2025 — present");
});

test("formatMonthYearRange renders a closed range", () => {
  assert.equal(formatMonthYearRange("2026-03", "2026-06"), "mar 2026 — jun 2026");
});

test("formatMonthYearRange returns undefined without a start date", () => {
  assert.equal(formatMonthYearRange(undefined, "2026-06"), undefined);
});

// The project year rail is a timeline, not a date: it answers "when" at a
// glance, so it collapses to the least text that still says it.
test("formatYearRail marks an unfinished project with an open range", () => {
  assert.equal(formatYearRail("2025-06"), "2025 —");
});

test("formatYearRail collapses a same-year range to the single year", () => {
  assert.equal(formatYearRail("2026-03", "2026-06"), "2026");
});

test("formatYearRail abbreviates the end of a multi-year range", () => {
  assert.equal(formatYearRail("2025-09", "2026-06"), "2025–26");
});

test("formatYearRail returns undefined without a start date", () => {
  assert.equal(formatYearRail(undefined, "2026-06"), undefined);
});

test("formatDayMonth drops the year for a post under a year heading", () => {
  assert.equal(formatDayMonth(new Date("2026-07-11")), "jul 11");
  assert.equal(formatDayMonth(new Date("2026-09-01")), "sept 1");
});

test("formatDayMonth does not shift the day in negative UTC offsets", () => {
  assert.equal(formatDayMonth(new Date("2026-01-01")), "jan 1");
});
