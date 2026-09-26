import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// pg emits 'error' on the pool itself when an *idle* client hits a problem
// (e.g. the DB restarts, a network blip) — not at the call site of whatever
// query was running. Without a listener, that error is unhandled and crashes
// the whole Node process.
pool.on("error", (err) => {
  console.error("Unexpected error on idle Postgres client", err);
});
