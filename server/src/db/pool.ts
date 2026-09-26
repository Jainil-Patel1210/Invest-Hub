import { Pool, types } from "pg";

// pg's default DATE parser builds a JS Date from the value's year/month/day
// using the *local* timezone -- not UTC. A DATE column has no time-of-day or
// timezone component in the first place, so that parsing step invents one,
// and it silently shifts the calendar day whenever this process's local
// timezone differs from UTC by enough to cross midnight. Returning the raw
// "YYYY-MM-DD" string instead sidesteps the whole problem: it's actually the
// more correct representation, and callers parse it however they need.
types.setTypeParser(types.builtins.DATE, (value) => value);

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
