import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/aist-dem-with-csmap-on-maplibre/" : "/",
  server: {
    port: 5173,
    strictPort: true,
  },
}));
