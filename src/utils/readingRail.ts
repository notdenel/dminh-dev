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
// cannot.
//
// Which leaves a choice on those pages, and only one honest answer. Drawing
// the stops that DO separate is the worst option: two dots on a three-heading
// article silently claim the third does not exist. So the rail is
// all-or-nothing, and the test is the filter's own answer rather than a
// heuristic about viewport heights — see railStops. Where a heading would be
// lost, the rail stops being navigation and becomes a map: every heading gets
// a mark, placed by where it truly sits in the ARTICLE, and the component
// renders those as inert marks rather than dead links.
//
// Adding scroll space so every heading could reach the top was measured and
// rejected: the three project pages needed 554-585px of blank page at a 900px
// viewport and 734-765px at 1080px, growing with the screen.

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * How far down the page the reader is, 0 to 1 — plain scroll position, the
 * same measure the horizontal bar has always used: empty at the top, full at
 * the foot, whatever the article's shape.
 */
export const railProgress = (scrollY: number, maxScroll: number) =>
  maxScroll <= 0 ? 0 : clamp01(scrollY / maxScroll);

export type RailStop = { index: number; at: number };

export type RailStops = {
  /** "nav" stops are scroll destinations and are safe to link. "marks" are
   *  structural only: they say where a heading sits, never where a click goes. */
  mode: "nav" | "marks";
  stops: RailStop[];
};

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

/**
 * Where each heading sits inside the ARTICLE, 0 to 1, for every heading.
 *
 * Unlike stopPositions this drops nothing, because it promises nothing about
 * clicking: two headings a scrollbar cannot separate still occupy different
 * places on the page, and saying so is the one true thing left to say.
 */
export const markPositions = (
  headingOffsets: number[],
  articleTop: number,
  articleHeight: number,
): RailStop[] =>
  headingOffsets.map((offset, index) => ({
    index,
    at: articleHeight <= 0 ? 0 : clamp01((offset - articleTop) / articleHeight),
  }));

/**
 * The rail's whole decision in one place: navigation when every heading has a
 * destination of its own, a structural map otherwise.
 *
 * The predicate is deliberately not "is the page tall enough". That was a
 * proxy, and a loose one — it hid the stops on pages whose headings were
 * perfectly separable. The filter already computes the real answer, so this
 * asks it: did anything get dropped? A partial rail is never returned.
 */
export const railStops = (
  headingOffsets: number[],
  maxScroll: number,
  minGap: number,
  articleTop: number,
  articleHeight: number,
): RailStops => {
  const nav = stopPositions(headingOffsets, maxScroll, minGap);

  return headingOffsets.length > 0 && nav.length === headingOffsets.length
    ? { mode: "nav", stops: nav }
    : { mode: "marks", stops: markPositions(headingOffsets, articleTop, articleHeight) };
};
