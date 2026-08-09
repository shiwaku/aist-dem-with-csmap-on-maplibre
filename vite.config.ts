import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/csmap-on-maplibre/" : "/",
  server: {
    port: 5173,
    strictPort: true,
  },
}));
