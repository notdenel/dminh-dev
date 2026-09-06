// Blog listings group under a year heading, which lets each row drop the year
// from its own date. Generic over the item so it can be tested without
// pulling in astro:content, which node --test cannot resolve.
//
// Items keep the order they arrive in within a year, so the caller sorts once
// (newest first) and the buckets inherit it.
export const groupByYear = <T>(items: T[], dateOf: (item: T) => Date) => {
  const groups = new Map<number, T[]>();

  for (const item of items) {
    // getUTCFullYear, not getFullYear: a date-only frontmatter string is
    // midnight UTC, which is still the previous year in Pacific time.
    const year = dateOf(item).getUTCFullYear();
    const bucket = groups.get(year);

    if (bucket) {
      bucket.push(item);
    } else {
      groups.set(year, [item]);
    }
  }

  return [...groups].sort((a, b) => b[0] - a[0]);
};
