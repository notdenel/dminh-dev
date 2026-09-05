// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";

export default defineConfig({
  site: "https://dminh.dev",
  trailingSlash: "never",

  // Every page stays prerendered. The adapter exists for exactly one route,
  // /api/now-playing, which opts out with `export const prerender = false`
  // because it needs the Spotify secret at request time.
  adapter: vercel(),

  vite: {
    plugins: [tailwindcss()],
  },
});
