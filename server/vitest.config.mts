import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Loads server/.env before any test file runs -- app.ts and its
    // dependencies (the DB pool, JWT secret) read process.env at import
    // time, and Supertest imports app.ts directly rather than going through
    // index.ts (which is the only file that currently does `import "dotenv/config"`).
    setupFiles: ["./tests/setup.ts"],
  },
});
