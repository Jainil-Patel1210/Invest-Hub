import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../lib/useAuth";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/watchlist", label: "Watchlist" },
  { to: "/stocks", label: "Stocks" },
  { to: "/transactions", label: "Transactions" },
  { to: "/account", label: "Account" },
];

export function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-bg text-text-primary">
      <aside className="flex w-56 flex-col border-r border-border bg-surface">
        <div className="px-5 py-5 text-lg font-semibold">InvestHub</div>
        <nav className="flex flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-surface-raised text-accent"
                    : "text-text-secondary hover:bg-surface-raised hover:text-text-primary"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-border px-6 py-3">
          <span className="text-sm text-text-secondary">{user?.email}</span>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-md border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:border-accent hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-muted"
          >
            Log out
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
