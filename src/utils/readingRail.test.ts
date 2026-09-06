import { test } from "node:test";
import assert from "node:assert/strict";
import { railProgress, railHasStops, stopPositions } from "./readingRail.ts";

// The rail's fill and its stops must live in the SAME coordinate space, or
// they contradict each other on screen. They are both scroll positions.
//
// An earlier version placed the stops by their share of the ARTICLE while the
// fill tracked scroll. Measured on /projects/simple-c-compiler: clicking the
// FIRST stop — drawn at the very top of the rail — filled the rail to 84%,
// because reaching that heading costs 435 of the page's 517px of scroll.

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

// The whole point of the model: a stop sits where the fill will be once you
// have clicked it. Clicking a heading scrolls it to the top of the viewport,
// so its position is simply its document offset over the scroll range.
test("a stop sits exactly where clicking it leaves the fill", () => {
  const at = stopPositions([435, 1200, 2100], 2700);

  assert.deepEqual(
    at.map((s) => s.at),
    [435 / 2700, 1200 / 2700, 2100 / 2700],
  );
});

test("stopPositions keeps each stop's index so the component can pair them", () => {
  assert.deepEqual(stopPositions([435, 1200], 2700).map((s) => s.index), [0, 1]);
});

test("stopPositions clamps a heading inside the unreachable final viewport", () => {
  assert.equal(stopPositions([9999], 2700)[0].at, 1);
});

test("stopPositions returns nothing when there is no scroll range", () => {
  assert.deepEqual(stopPositions([435], 0), []);
});

test("stopPositions returns nothing for an article with no headings", () => {
  assert.deepEqual(stopPositions([], 2700), []);
});

// Two headings inside the final viewport resolve to the SAME scroll position:
// the bottom of the page. Drawn as two dots they overlap and swallow each
// other's clicks, which is the regression this guard exists to prevent.
test("stopPositions drops a stop that shares its destination with the previous", () => {
  const at = stopPositions([435, 2600, 2650], 2700, 0.05);

  assert.deepEqual(at.map((s) => s.index), [0, 1]);
});

test("stopPositions keeps stops that clear the minimum gap", () => {
  const at = stopPositions([0, 1350, 2700], 2700, 0.05);

  assert.deepEqual(at.map((s) => s.index), [0, 1, 2]);
});

test("stopPositions measures the gap from the last KEPT stop, not the last seen", () => {
  // Three near-identical stops must collapse to one, not ratchet forwards.
  const at = stopPositions([100, 200, 300], 10000, 0.05);

  assert.deepEqual(at.map((s) => s.index), [0]);
});

// Below one viewport of scroll, more than half the document sits in the final
// screen — which cannot be scrolled to — so most stops would be fiction. Real
// numbers from the project pages: 517, 603 and 801px of scroll at a 900px
// viewport, where every heading after the first shared the same destination.
test("railHasStops is false when the page scrolls less than one viewport", () => {
  assert.equal(railHasStops(517, 900), false);
  assert.equal(railHasStops(603, 900), false);
  assert.equal(railHasStops(801, 900), false);
});

test("railHasStops is true once the page scrolls a full viewport", () => {
  assert.equal(railHasStops(900, 900), true);
  assert.equal(railHasStops(2700, 900), true);
});
