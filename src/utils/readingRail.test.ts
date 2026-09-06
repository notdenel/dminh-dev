import { test } from "node:test";
import assert from "node:assert/strict";
import { railRange, railProgress, stopPositions } from "./readingRail.ts";

// The rail is measured against the ARTICLE's own extent, not against the
// scroll range. Mapping headings onto the scroll range was the original bug:
// on a short page a heading near the end can never reach the top of the
// viewport, so every late heading clamped to 1 and the stops stacked. Real
// numbers from /projects/simple-c-compiler — 511px of scroll, headings at
// 429/711/1096 — put two of the three stops on top of each other.

test("railRange starts at the first heading and ends with the article", () => {
  assert.deepEqual(railRange([429, 711, 1096], 200, 1250), { start: 429, end: 1250 });
});

test("railRange falls back to the article top when there are no headings", () => {
  assert.deepEqual(railRange([], 200, 1250), { start: 200, end: 1250 });
});

test("railRange never returns an empty or inverted range", () => {
  assert.ok(railRange([900], 200, 900).end > railRange([900], 200, 900).start);
  assert.ok(railRange([], 500, 100).end > railRange([], 500, 100).start);
});

// Progress is plain scroll position, as the horizontal bar always was: empty
// at the top of the page and full at the bottom, whatever the article's shape.
// Measuring what the reader had SEEN instead (the viewport bottom) opened the
// rail 53-58% full on the short project pages, which does not read as progress.
test("railProgress is 0 at the top of the page", () => {
  assert.equal(railProgress(0, 1400), 0);
});

test("railProgress is 1 at the foot of the page", () => {
  assert.equal(railProgress(1400, 1400), 1);
});

test("railProgress reports the midpoint of the scroll range", () => {
  assert.equal(railProgress(700, 1400), 0.5);
});

test("railProgress clamps outside the scroll range", () => {
  assert.equal(railProgress(-50, 1400), 0);
  assert.equal(railProgress(99999, 1400), 1);
});

test("railProgress survives a page with nothing to scroll", () => {
  assert.equal(railProgress(0, 0), 0);
});

// Regression, the reason this model exists: every heading must land on a
// distinct position even when the page barely scrolls.
test("stopPositions spreads real headings that the scroll range would stack", () => {
  const { start, end } = railRange([429, 711, 1096], 200, 1250);
  const at = stopPositions([429, 711, 1096], start, end);

  assert.equal(at[0], 0);
  assert.ok(at[1] > 0 && at[1] < 1, `middle stop landed at ${at[1]}`);
  assert.ok(at[2] > at[1], "stops must stay in document order");
  assert.equal(new Set(at).size, 3, "no two stops may share a position");
});

test("stopPositions puts the first stop at the top of the rail", () => {
  assert.equal(stopPositions([400, 900, 1400], 400, 1400)[0], 0);
});

test("stopPositions places the rest by their share of the article", () => {
  assert.deepEqual(stopPositions([400, 900, 1400], 400, 1400), [0, 0.5, 1]);
});

test("stopPositions clamps anything outside the range", () => {
  assert.deepEqual(stopPositions([100, 9999], 400, 1400), [0, 1]);
});

test("stopPositions returns nothing for an article with no headings", () => {
  assert.deepEqual(stopPositions([], 0, 1), []);
});
