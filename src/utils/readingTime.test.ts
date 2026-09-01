import { test } from "node:test";
import assert from "node:assert/strict";
import { getReadingTime } from "./readingTime.ts";

test("short content still reports a one minute floor", () => {
  assert.equal(getReadingTime("a few words only"), "1 min read");
});

test("empty content does not return zero or NaN", () => {
  assert.equal(getReadingTime(""), "1 min read");
});

test("word count drives the estimate at 225 wpm", () => {
  // 900 words / 225 wpm = 4 minutes exactly
  assert.equal(getReadingTime("word ".repeat(900)), "4 min read");
});

test("code blocks add scanning time beyond their word count", () => {
  const prose = "word ".repeat(225); // 1 minute of prose
  const withCode = prose + "\n\n```js\n" + "const x = 1;\n".repeat(30) + "```\n";
  // 30 non-empty lines x 2s = 60s of code scanning on top of 60s of prose
  assert.equal(getReadingTime(prose), "1 min read");
  assert.equal(getReadingTime(withCode), "2 min read");
});

test("images add viewing time on a decreasing curve", () => {
  const prose = "word ".repeat(225);
  const images = Array.from(
    { length: 5 },
    (_, i) => `![alt${i}](./images/x${i}.png)`,
  ).join("\n\n");
  // 12 + 11 + 10 + 9 + 8 = 50s on top of 60s of prose -> 110s -> 2 min
  assert.equal(getReadingTime(prose + "\n\n" + images), "2 min read");
});

test("code block contents are excluded from the word count", () => {
  const fenced = "```\n" + "word ".repeat(500) + "\n```";
  // Those 500 words must not be counted as prose. One block, 1 line,
  // minimum 8s -> still floors to 1 minute.
  assert.equal(getReadingTime(fenced), "1 min read");
});
