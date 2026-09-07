// The decision the /api/now-playing route makes, kept out of the route itself
// so it can be tested without importing a module that reads import.meta.env —
// which does not exist under `node --test`.
export type Track = { title: string; artist: string; url?: string };

export const toTrack = (item: any): Track | undefined => {
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

// A 200 from currently-playing means something is loaded, playing or paused.
// A paused track is still the most recent thing played — more recent than
// recently-played, which only logs a track once it has been played through,
// so pausing mid-song used to make the line jump to an older, finished one.
// 204 means nothing is loaded at all, and only then does history apply.
export const chooseTrack = (
  current: { status: number; payload?: any },
  recent?: any,
) => {
  if (current.status === 200) {
    const track = toTrack(current.payload?.item);
    if (track) return { playing: !!current.payload?.is_playing, ...track };
  }

  const previous = toTrack(recent?.items?.[0]?.track);

  return previous ? { playing: false, ...previous } : {};
};
