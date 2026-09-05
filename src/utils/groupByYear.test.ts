import { test } from "node:test";
import assert from "node:assert/strict";
import { groupByYear } from "./groupByYear.ts";

const post = (iso: string) => ({ id: iso, date: new Date(iso) });

test("groupByYear buckets by year, newest year first", () => {
  const posts = ["2026-07-11", "2026-01-02", "2025-12-30", "2024-03-01"].map(post);
  const groups = groupByYear(posts, (p) => p.date);

  assert.deepEqual(
    groups.map(([year, items]) => [year, items.map((i) => i.id)]),
    [
      [2026, ["2026-07-11", "2026-01-02"]],
      [2025, ["2025-12-30"]],
      [2024, ["2024-03-01"]],
    ],
  );
});

test("groupByYear reads the year in UTC, not local time", () => {
  // 2026-01-01 is midnight UTC, which is still 2025 in Pacific time. Reading
  // it locally would file the post under the wrong year heading entirely.
  assert.deepEqual(
    groupByYear([post("2026-01-01")], (p) => p.date).map(([year]) => year),
    [2026],
  );
});

test("groupByYear returns nothing for an empty list", () => {
  assert.deepEqual(groupByYear([], (p: { date: Date }) => p.date), []);
});
