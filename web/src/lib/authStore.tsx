import { createContext, useEffect, useState, type ReactNode } from "react";
import { api, setAccessToken } from "../api/client";

export interface Profile {
  id: number;
  email: string;
  fullName: string;
  accountBalance: number;
  createdAt: string;
}

interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthContextValue {
  user: Profile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  /** Re-fetches the profile -- e.g. after a trade changes the account balance. */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On boot there is no access token in memory yet -- it's never persisted
    // across a reload (see client.ts). This first call to /auth/me has no
    // Authorization header, so it 401s; the API client's interceptor turns
    // that into a transparent refresh-and-retry using the httpOnly refresh
    // cookie, which *does* survive a reload. There's no special "try to
    // restore a session" code here beyond just... asking for the profile
    // and letting the generic 401 handling do its job. If there's truly no
    // valid session, the retried call 401s again, isRetry stops a second
    // attempt, and this just resolves to "not logged in".
    api
      .get<Profile>("/auth/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  async function refreshProfile() {
    setUser(await api.get<Profile>("/auth/me"));
  }

  async function login(email: string, password: string) {
    const result = await api.post<{ accessToken: string }>("/auth/login", { email, password });
    setAccessToken(result.accessToken);
    // Login/register only return { id, email, fullName } -- immediately
    // following up with /auth/me means `user` always has the same full
    // Profile shape regardless of whether it arrived via a fresh login or
    // the silent boot-time refresh above, rather than two different shapes
    // depending on entry path.
    await refreshProfile();
  }

  async function register(input: RegisterInput) {
    const result = await api.post<{ accessToken: string }>("/auth/register", input);
    setAccessToken(result.accessToken);
    await refreshProfile();
  }

  async function logout() {
    // Swallow a failed logout call: even if the network drops or the server
    // errors, the user should still end up logged out *locally*. Worst case
    // the server-side refresh token lingers until it naturally expires --
    // not ideal, but strictly better than a logout button that appears to
    // do nothing on a flaky connection.
    await api.post("/auth/logout").catch(() => {});
    setAccessToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, refreshUser: refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// useAuth itself lives in ./useAuth.ts, not here -- Fast Refresh (Vite's
// dev-mode hot reload for React) only works on a file whose exports are
// *all* components. Mixing this component with a plain hook function meant
// every edit to this file forced a full page reload instead of a hot patch.
export { AuthContext };
