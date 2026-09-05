import type { APIRoute } from "astro";

// The only server-rendered route on the site. It exists so the Spotify
// client secret and refresh token stay on the server: the browser only ever
// sees a title, an artist and a public spotify.com link.
export const prerender = false;

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const CURRENT_URL = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENT_URL =
  "https://api.spotify.com/v1/me/player/recently-played?limit=1";

// Long enough that a reload does not hammer Spotify, short enough that the
// track is still roughly true. stale-while-revalidate means a visitor never
// waits on the refresh.
const CACHE = "public, max-age=30, s-maxage=30, stale-while-revalidate=120";

const json = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json", "cache-control": CACHE },
  });

// Every failure lands here. Missing credentials, a rejected refresh token, a
// Spotify outage, a malformed payload — all of them return the same empty
// body, which the component renders as nothing at all. A visitor never sees
// this fail, and the reason never leaves the server.
const nothing = () => json({});

type Track = { title: string; artist: string; url?: string };

const toTrack = (item: any): Track | undefined => {
  const title = item?.name;

  if (typeof title !== "string" || !title) return undefined;

  return {
    title,
    artist: (item.artists ?? [])
      .map((a: any) => a?.name)
      .filter(Boolean)
      .join(", "),
    url: item.external_urls?.spotify,
  };
};

// Vercel puts real environment variables on process.env at runtime, which is
// what we want in production: rotating the secret there does not need a
// rebuild. A local .env does not reach process.env under `astro dev`, so it
// is read through import.meta.env instead — but only behind import.meta.env
// .DEV, which is replaced by the literal `false` in a production build so the
// whole block is dead code and no secret is ever inlined into the bundle.
const dev = import.meta.env.DEV
  ? {
      id: import.meta.env.SPOTIFY_CLIENT_ID as string | undefined,
      secret: import.meta.env.SPOTIFY_CLIENT_SECRET as string | undefined,
      refreshToken: import.meta.env.SPOTIFY_REFRESH_TOKEN as string | undefined,
    }
  : undefined;

const accessToken = async () => {
  const id = process.env.SPOTIFY_CLIENT_ID ?? dev?.id;
  const secret = process.env.SPOTIFY_CLIENT_SECRET ?? dev?.secret;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN ?? dev?.refreshToken;

  if (!id || !secret || !refreshToken) return undefined;

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) return undefined;

  const payload = await response.json();

  return typeof payload?.access_token === "string"
    ? payload.access_token
    : undefined;
};

export const GET: APIRoute = async () => {
  try {
    const token = await accessToken();

    if (!token) return nothing();

    const headers = { authorization: `Bearer ${token}` };

    // 204 here is the normal "nothing is playing" answer, not an error.
    const current = await fetch(CURRENT_URL, { headers });

    if (current.status === 200) {
      const payload = await current.json();

      if (payload?.is_playing) {
        const track = toTrack(payload.item);
        if (track) return json({ playing: true, ...track });
      }
    }

    const recent = await fetch(RECENT_URL, { headers });

    if (recent.ok) {
      const payload = await recent.json();
      const track = toTrack(payload?.items?.[0]?.track);
      if (track) return json({ playing: false, ...track });
    }

    return nothing();
  } catch {
    return nothing();
  }
};
