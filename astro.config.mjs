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
  //
  // webAnalytics injects a head-inline loader for /_vercel/insights/script.js.
  // Both stay same-origin, and Astro hashes the injected script, so the CSP
  // below covers it without loosening script-src.
  adapter: vercel({ webAnalytics: { enabled: true } }),

  // Astro hashes the scripts it bundles, so script-src needs no 'unsafe-inline'.
  // style-src keeps it: the anti-flash `<style is:inline>` in BaseLayout has to
  // paint before the external sheet lands, and Astro does not hash `is:inline`.
  // frame-ancestors cannot be enforced from a <meta> tag, so it stays a real
  // response header in vercel.json.
  security: {
    csp: {
      styleDirective: { resources: ["'self'", "'unsafe-inline'"] },
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "form-action 'self'",
      ],
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
