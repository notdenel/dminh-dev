import { test } from "node:test";
import assert from "node:assert/strict";
import {
  railProgress,
  railStops,
  markPositions,
  stopPositions,
} from "./readingRail.ts";

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

// A rail that shows SOME of an article's headings is worse than one that shows
// none: two dots on a three-heading page silently claims the third does not
// exist. So the mode is all-or-nothing, and the test is not a viewport
// heuristic but the filter's own answer — do ALL the headings survive?

test("railStops navigates when every heading has its own destination", () => {
  const r = railStops([435, 1200, 2100], 2700, 0.027, 300, 2400);

  assert.equal(r.mode, "nav");
  assert.deepEqual(r.stops.map((s) => s.index), [0, 1, 2]);
});

test("railStops falls back to marks when any heading would be dropped", () => {
  // /projects/simple-c-compiler at 1280x900: three headings, 517px of scroll,
  // and the last two both resolve to the foot of the page.
  const r = railStops([435, 717, 1101], 517, 0.027, 300, 900);

  assert.equal(r.mode, "marks");
});

test("marks mode keeps EVERY heading — it is never a subset", () => {
  const r = railStops([435, 717, 1101], 517, 0.027, 300, 900);

  assert.equal(r.stops.length, 3);
  assert.deepEqual(r.stops.map((s) => s.index), [0, 1, 2]);
});

test("marks are placed in article space, so they stay distinct", () => {
  const r = railStops([435, 717, 1101], 517, 0.027, 300, 900);
  const at = r.stops.map((s) => s.at);

  assert.deepEqual(at, [135 / 900, 417 / 900, 801 / 900]);
  assert.ok(at[1] - at[0] > 0.027 && at[2] - at[1] > 0.027);
});

test("railStops has no navigation to offer for an article with no headings", () => {
  const r = railStops([], 2700, 0.027, 300, 2400);

  assert.equal(r.mode, "marks");
  assert.deepEqual(r.stops, []);
});

test("markPositions places a heading by its offset into the article", () => {
  assert.deepEqual(markPositions([435, 717], 300, 900).map((s) => s.at), [
    135 / 900,
    417 / 900,
  ]);
});

test("markPositions clamps a heading outside the measured article", () => {
  assert.deepEqual(markPositions([100, 5000], 300, 900).map((s) => s.at), [0, 1]);
});

test("markPositions survives an article of no height", () => {
  assert.deepEqual(markPositions([435], 300, 0), [{ index: 0, at: 0 }]);
});
