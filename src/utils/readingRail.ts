// The reading rail's arithmetic, kept out of the component so it can be tested
// under plain `node --test` — the component only measures the DOM and hands
// the numbers here.
//
// Everything is measured against the ARTICLE's own extent, never against the
// scroll range. Mapping headings onto the scroll range looks equivalent and is
// not: on a short page a heading near the end can never be scrolled to the top
// of the viewport, so it clamps. On /projects/simple-c-compiler — 511px of
// scroll, headings at 429/711/1096 — that put two of three stops on 100% and
// they stacked, one swallowing the other's clicks.
//
// Progress is likewise what the reader has SEEN (the bottom of the viewport),
// not how far they have scrolled. That is what keeps the last stop reachable
// on a page whose article barely overflows the screen.
//
// Every function is pure and takes current measurements: an earlier version
// cached the range when the stops were built, and a reflow after the web fonts
// landed left the foot of the article reporting 89%.

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * The slice of the document the rail spans.
 *
 * It begins at the first heading, because the rail measures the sectioned body
 * and the introduction above it sits outside. An article with no headings has
 * nothing to rebase to and spans its whole self.
 */
export const railRange = (
  headingOffsets: number[],
  articleTop: number,
  articleBottom: number,
) => {
  const start = headingOffsets[0] ?? articleTop;

  // Guard the degenerate cases — an article shorter than its own heading, or
  // one measured mid-reflow — so nothing downstream divides by zero.
  return { start, end: Math.max(start + 1, articleBottom) };
};

/**
 * How far down the page the reader is, 0 to 1 — plain scroll position, the
 * same measure the horizontal bar has always used.
 *
 * Measuring what had been SEEN instead (the bottom of the viewport against the
 * article's extent) is arguably more truthful, but it opened the rail 53-58%
 * full on the short project pages, which does not read as progress.
 *
 * The stops are deliberately NOT on this scale — see stopPositions.
 */
export const railProgress = (scrollY: number, maxScroll: number) =>
  maxScroll <= 0 ? 0 : clamp01(scrollY / maxScroll);

/**
 * Where each heading sits along the rail, 0 to 1, in document order.
 *
 * By its share of the ARTICLE, not of the scroll range. Those coincide on a
 * long post and diverge on a short one, where several headings sit inside the
 * final viewport and can never be scrolled to the top — on a scroll scale they
 * all clamp to 1 and the stops pile up on each other, swallowing each other's
 * clicks. Spacing them by the article keeps every stop distinct and keeps the
 * dots agreeing with the fill, which is what a reader actually sees.
 */
export const stopPositions = (
  headingOffsets: number[],
  start: number,
  end: number,
) => headingOffsets.map((offset) => clamp01((offset - start) / (end - start)));
