import { test } from "node:test";
import assert from "node:assert/strict";
import { parseTokens, resolveToken } from "./designTokens.ts";

const CSS = `
:root { --not-a-token: red; }

@theme static {
    --color-accent-500: #8b69ce;
}

@theme {
    /* NEUTRALS */
    --color-ink: #f2f2f4;

    /* #6f7080 measured 3.89:1 and failed WCAG AA, so this is the
       smallest lift that clears 4.5 — measured 4.74:1. */
    --color-faint: #7d7e8e;

    --color-accent: var(--color-accent-500);

    --font-ui:
        "Jost Variable", "Jost", ui-sans-serif,
        system-ui, sans-serif;

    --text-display: clamp(2.375rem, 1.55rem + 3.6vw, 3.25rem);
}
`;

test("parseTokens reads declarations from every @theme block", () => {
  const names = parseTokens(CSS).map((t) => t.name);

  assert.ok(names.includes("--color-accent-500"), "missed the static block");
  assert.ok(names.includes("--color-ink"), "missed the main block");
});

test("parseTokens ignores declarations outside @theme", () => {
  assert.equal(
    parseTokens(CSS).find((t) => t.name === "--not-a-token"),
    undefined,
  );
});

test("parseTokens keeps a multi-line value on one line", () => {
  const font = parseTokens(CSS).find((t) => t.name === "--font-ui");

  assert.ok(font);
  assert.ok(!font.value.includes("\n"), "value still spans lines");
  assert.ok(font.value.startsWith('"Jost Variable"'));
  assert.ok(font.value.endsWith("sans-serif"));
});

test("parseTokens keeps a value containing commas and parens intact", () => {
  const t = parseTokens(CSS).find((x) => x.name === "--text-display");

  assert.equal(t?.value, "clamp(2.375rem, 1.55rem + 3.6vw, 3.25rem)");
});

// The comments above these declarations are the reasoning behind them, which
// is the whole point of showing the tokens rather than a picture of them.
test("parseTokens attaches the comment directly above a token as its note", () => {
  const faint = parseTokens(CSS).find((t) => t.name === "--color-faint");

  assert.ok(faint?.note?.includes("4.74:1"));
  assert.ok(!faint?.note?.includes("/*"), "comment markers left in the note");
});

test("parseTokens does not attach a section heading comment as a note", () => {
  // "NEUTRALS" labels the group, not the token under it.
  assert.equal(parseTokens(CSS).find((t) => t.name === "--color-ink")?.note, undefined);
});

test("parseTokens leaves a token with no comment noteless", () => {
  assert.equal(parseTokens(CSS).find((t) => t.name === "--color-accent")?.note, undefined);
});

test("resolveToken follows a var() reference to a literal", () => {
  const tokens = parseTokens(CSS);

  assert.equal(resolveToken(tokens, "--color-accent"), "#8b69ce");
});

test("resolveToken returns a literal value unchanged", () => {
  assert.equal(resolveToken(parseTokens(CSS), "--color-ink"), "#f2f2f4");
});

test("resolveToken gives back the raw value when the reference is unknown", () => {
  const tokens = [{ name: "--x", value: "var(--nope)" }];

  assert.equal(resolveToken(tokens, "--x"), "var(--nope)");
});

// Both of these are real group labels from global.css. Attached to whichever
// token happens to follow, they would state a reason that token does not have.
test("a lowercase group label is a heading, not a note", () => {
  const css = `@theme {
    /* accent roles — the names components use */
    --color-accent: #8b69ce;
}`;

  assert.equal(parseTokens(css)[0].note, undefined);
});

test("a block heading that introduces several tokens is not a note", () => {
  const css = `@theme {
    /* TYPEFACES — four, by job.
       ui     = the voice: the h1, section headings, every title
       copy   = prose */
    --font-ui: "Jost";
}`;

  assert.equal(parseTokens(css)[0].note, undefined);
});

test("a rationale that runs to a sentence is still a note", () => {
  const css = `@theme {
    /* #6f7080 measured 3.89:1 on --color-page and failed WCAG AA. #7d7e8e is
       the smallest lift that clears 4.5 — measured 4.74:1. */
    --color-faint: #7d7e8e;
}`;

  assert.ok(parseTokens(css)[0].note?.includes("4.74:1"));
});
