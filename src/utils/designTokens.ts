// Reads the design tokens straight out of global.css so the swatches and the
// type specimen are the site's real values rather than a screenshot of them.
// A picture of a palette goes stale the moment a colour is retuned; this
// cannot, because it has no second copy to drift from.
//
// The comment above a declaration is carried along with it. Those comments are
// the reasoning — why --color-faint is #7d7e8e and not #6f7080 — and that is
// the part worth showing.

export type Token = {
  name: string;
  value: string;
  note?: string;
};

// Only @theme blocks. Tailwind generates the utilities from these, so they are
// the tokens; anything declared elsewhere is a local variable.
const THEME_BLOCK = /@theme[^{]*\{([\s\S]*?)\n\}/g;

// A declaration, plus whatever comment sits immediately above it. `[^;]*`
// spans the multi-line font stacks without swallowing the next declaration.
const DECLARATION = /(?:\/\*([\s\S]*?)\*\/\s*)?(--[\w-]+)\s*:\s*([^;]+);/g;

const tidy = (text: string) => text.replace(/\s+/g, " ").trim();

/**
 * A section heading rather than a note about the token below it.
 *
 * Attaching a group label to whichever token happens to follow it would state
 * a reason that token does not have, so this errs towards discarding. Two
 * shapes appear in global.css: an ALL-CAPS label (NEUTRALS, SURFACES,
 * TYPEFACES, TYPE SCALE), and one in lower case ("accent roles — the names
 * components use"). A label names its group and stops; a rationale runs to at
 * least one full sentence, which is what separates the second kind.
 */
const isHeading = (comment: string) => {
  const text = tidy(comment);

  const [first] = text.split(" ");

  if (first.length > 1 && first === first.toUpperCase() && /[A-Z]/.test(first)) {
    return true;
  }

  return text.length < 60 && !text.includes(".");
};

export const parseTokens = (css: string): Token[] => {
  const tokens: Token[] = [];

  for (const block of css.matchAll(THEME_BLOCK)) {
    for (const [, comment, name, value] of block[1].matchAll(DECLARATION)) {
      const note = comment && !isHeading(comment) ? tidy(comment) : undefined;

      tokens.push({ name, value: tidy(value), ...(note ? { note } : {}) });
    }
  }

  return tokens;
};

/**
 * The literal behind a token, following one var() hop.
 *
 * The accent roles are aliases — `--color-accent: var(--color-accent-500)` —
 * and a swatch labelled `var(--color-accent-500)` tells a reader nothing.
 */
export const resolveToken = (tokens: Token[], name: string): string => {
  const value = tokens.find((t) => t.name === name)?.value ?? "";
  const reference = value.match(/^var\((--[\w-]+)\)$/);

  if (!reference) return value;

  return tokens.find((t) => t.name === reference[1])?.value ?? value;
};

export const tokensMatching = (tokens: Token[], prefix: string) =>
  tokens.filter((token) => token.name.startsWith(prefix));
