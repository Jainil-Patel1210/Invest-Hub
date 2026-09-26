import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  // Tailwind v4 ships as a Vite plugin rather than a PostCSS config + JS
  // theme file -- it scans source files itself and generates utilities
  // directly, with theme customization done in CSS via @theme (see
  // index.css) instead of tailwind.config.js.
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
});
