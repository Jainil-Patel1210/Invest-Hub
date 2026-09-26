import type { PoolClient } from "pg";
import { pool } from "./pool";

/**
 * Runs `fn` inside a real Postgres transaction: BEGIN, then every query `fn`
 * issues through the client it's given, then COMMIT -- or ROLLBACK if
 * anything throws.
 *
 * Why `pool.connect()` and not `pool.query()`: `pool.query()` grabs an
 * arbitrary connection from the pool *per call* -- two calls in a row could
 * each land on a different underlying Postgres session. A transaction is
 * server-side session state (BEGIN...COMMIT only means anything within one
 * session), so every statement in it must run on the exact same connection.
 * `pool.connect()` checks out one specific client, exclusively, until we're
 * done with it.
 *
 * Two failure modes this exists to prevent:
 * - Forgetting `client.release()` in `finally`: the connection is never
 *   returned to the pool. Do this enough times and the pool exhausts its
 *   max connections, and every future query in the whole app hangs forever
 *   waiting for one to free up.
 * - Forgetting the explicit ROLLBACK on error: Postgres doesn't roll back
 *   automatically just because the JS side threw -- it doesn't know the
 *   client gave up unless told. Without this, the connection goes back to
 *   the pool still sitting inside an aborted transaction, and the *next*
 *   unrelated request that happens to get this same connection would fail
 *   with "current transaction is aborted" for a completely different reason.
 */
export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
