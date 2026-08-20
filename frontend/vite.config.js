import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Dev-only: forwards /api/* to the local Flask server so the
    // frontend can always call same-origin "/api" paths, in dev and
    // in production (where Flask serves the build directly) alike.
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
  },
});
