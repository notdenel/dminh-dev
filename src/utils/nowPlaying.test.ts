import { test } from "node:test";
import assert from "node:assert/strict";
import { chooseTrack } from "./nowPlaying.ts";

const track = (name: string) => ({
  name,
  artists: [{ name: "Knock2" }],
  external_urls: { spotify: `https://open.spotify.com/track/${name}` },
});

test("a playing track is reported as playing", () => {
  assert.deepEqual(
    chooseTrack({ status: 200, payload: { is_playing: true, item: track("dashstar") } },
                { items: [{ track: track("older") }] }),
    { playing: true, title: "dashstar", artist: "Knock2",
      url: "https://open.spotify.com/track/dashstar" },
  );
});

test("a paused track is the last played, not whatever recently-played says", () => {
  // Regression: pausing mid-song made the line jump to an older, finished
  // track, because recently-played only logs a track once it completes.
  assert.deepEqual(
    chooseTrack(
      { status: 200, payload: { is_playing: false, item: track("dashstar") } },
      { items: [{ track: track("older") }] },
    ),
    // the paused track, held — and not claiming to be playing
    { playing: false, title: "dashstar", artist: "Knock2",
      url: "https://open.spotify.com/track/dashstar" },
  );
});

test("recently-played applies only when nothing is loaded at all", () => {
  assert.deepEqual(
    chooseTrack({ status: 204 }, { items: [{ track: track("older") }] }),
    { playing: false, title: "older", artist: "Knock2",
      url: "https://open.spotify.com/track/older" },
  );
});

test("an empty history yields an empty body", () => {
  assert.deepEqual(chooseTrack({ status: 204 }, { items: [] }), {});
  assert.deepEqual(chooseTrack({ status: 204 }, undefined), {});
});

test("a malformed item is not mistaken for a track", () => {
  assert.deepEqual(chooseTrack({ status: 200, payload: { is_playing: true, item: {} } }, undefined), {});
});
