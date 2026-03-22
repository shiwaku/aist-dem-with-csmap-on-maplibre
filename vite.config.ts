import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/aist-dem-with-cs-map-on-maplibre/" : "/",
  server: {
    port: 5173,
    strictPort: true,
  },
}));
