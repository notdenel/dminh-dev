// The reading rail's arithmetic, kept out of the component so it can be tested
// under plain `node --test` — the component only measures the DOM and hands
// the numbers here.
//
// One rule holds the whole model together: the fill and the stops are measured
// in the SAME space, and that space is scroll position. A stop therefore sits
// exactly where the fill lands once you have clicked it.
//
// The earlier version placed stops by their share of the ARTICLE while the
// fill tracked scroll, which contradicted itself on screen. Measured on
// /projects/simple-c-compiler: clicking the first stop, drawn at the very top
// of the rail, filled the rail to 84%, because reaching that heading costs 435
// of the page's 517px of scroll — nearly all of it is the page header.
//
// That article space was itself a fix for stops stacking on short pages, so
// note why this does not reintroduce it: the last viewport-height of any
// document cannot be scrolled through, so every heading inside it resolves to
// the same destination. No indicator can separate positions the scrollbar
// cannot. Rather than draw that fiction, short pages show no stops at all —
// see railHasStops — and the gap guard below covers the rest.

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * How far down the page the reader is, 0 to 1 — plain scroll position, the
 * same measure the horizontal bar has always used: empty at the top, full at
 * the foot, whatever the article's shape.
 */
export const railProgress = (scrollY: number, maxScroll: number) =>
  maxScroll <= 0 ? 0 : clamp01(scrollY / maxScroll);

/**
 * Whether the page is long enough for its stops to mean anything.
 *
 * Below one viewport of scroll, more than half the document lies in the final
 * screen and cannot be scrolled to, so the stops would be mostly fiction — on
 * every project page today, every heading after the first shares a
 * destination. The rail still shows; it is simply a progress rail with no
 * navigation it cannot honour.
 */
export const railHasStops = (maxScroll: number, viewportHeight: number) =>
  maxScroll >= viewportHeight;

/**
 * Where each heading sits along the rail, 0 to 1, paired with its index.
 *
 * Clicking a heading scrolls it to the top of the viewport, so its position is
 * its document offset over the scroll range — which is what makes a stop agree
 * with the fill. `minGap` drops a stop sharing a destination with the one
 * before it: two headings in the final viewport both resolve to the foot of
 * the page, and drawn as two dots they overlap and swallow each other's
 * clicks. The gap is always measured from the last KEPT stop, so a run of
 * near-identical headings collapses to one instead of ratcheting forwards.
 */
export const stopPositions = (
  headingOffsets: number[],
  maxScroll: number,
  minGap = 0,
) => {
  if (maxScroll <= 0) return [];

  const kept: { index: number; at: number }[] = [];

  headingOffsets.forEach((offset, index) => {
    const at = clamp01(offset / maxScroll);
    const last = kept[kept.length - 1];

    if (!last || at - last.at >= minGap) kept.push({ index, at });
  });

  return kept;
};
