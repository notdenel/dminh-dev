// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://dminh.dev",

  vite: {
    plugins: [tailwindcss()],
    server: {
      // /mnt/c has no inotify support, so file events never reach Vite.
      // Required as long as the repo lives on a Windows path.
      watch: {
        usePolling: true,
        interval: 300,
      },
    },
  },
});
