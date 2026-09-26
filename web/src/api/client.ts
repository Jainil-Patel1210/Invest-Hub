const API_BASE = "/api";

// Held in memory only -- deliberately never written to localStorage. A
// token in localStorage is readable by any script running on the page,
// which means any successful XSS on this app would hand an attacker a
// usable session; an in-memory variable disappears the instant the tab
// closes or the page reloads, which is exactly the tradeoff Phase 2's
// refresh-token design was built around (the httpOnly cookie survives a
// reload precisely so the access token doesn't have to).
let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  // Written out explicitly rather than as constructor parameter-property
  // shorthand (`constructor(public readonly status: number, ...)`) -- the
  // frontend's tsconfig has `erasableSyntaxOnly: true`, which forbids any
  // TS syntax that requires *generating* code rather than just stripping
  // types. Parameter properties need an emitted `this.x = x`, which isn't
  // erasure -- Vite's esbuild-based transform only strips types, it doesn't
  // do a full compile pass the way the backend's tsc build does, which is
  // why AppError on the backend can use this shorthand and this can't.
  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    this.name = "ApiError";
  }
}

/**
 * Concurrent requests that all hit a 401 at once (e.g. three widgets on the
 * dashboard all fetching on mount, right after the access token silently
 * expired) must not each fire their own /auth/refresh call -- the first
 * refresh would still be in flight when the second and third start, and the
 * server-side refresh-token *rotation* (Phase 2) means only the first of
 * several simultaneous refresh attempts would even succeed; the others
 * would get a confusing failure for an already-used token. This
 * module-level promise is the lock: every caller awaits the *same* in-flight
 * refresh instead of starting a new one.
 */
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  refreshPromise ??= (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) return false;
      const data = (await res.json()) as { accessToken: string };
      setAccessToken(data.accessToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

async function request<T>(path: string, options: RequestOptions = {}, isRetry = false): Promise<T> {
  const { body, headers, ...rest } = options;

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    // Needed for the refresh cookie to be sent at all -- without this,
    // fetch omits cookies on cross-origin requests by default (and costs
    // nothing to include for same-origin/dev-proxy requests, which just
    // ignore it).
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // A 401 on login means "wrong password" -- not "expired session, please
  // refresh". Retrying that after a refresh attempt would be pointless (no
  // valid session exists yet) and would just delay showing the real error.
  if (res.status === 401 && !isRetry && path !== "/auth/login") {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request<T>(path, options, true); // isRetry=true caps this at one retry, never a loop
    }
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const data: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const errorBody = data as {
      error?: { code?: string; message?: string; details?: unknown };
    } | null;
    throw new ApiError(
      res.status,
      errorBody?.error?.code ?? "UNKNOWN",
      errorBody?.error?.message ?? res.statusText,
      errorBody?.error?.details,
    );
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
