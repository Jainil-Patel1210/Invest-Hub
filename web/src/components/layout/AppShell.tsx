import { useState } from "react";
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
  // Below the `lg` breakpoint the sidebar becomes an off-canvas drawer,
  // closed by default -- above `lg` this state is simply never read (the
  // sidebar's `lg:translate-x-0 lg:static` always wins there regardless).
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <div className="flex h-screen bg-bg text-text-primary">
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-56 flex-col border-r border-border bg-surface transition-transform duration-200 lg:static lg:translate-x-0 ${
          isNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 py-5 text-lg font-semibold">InvestHub</div>
        <nav className="flex flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsNavOpen(false)}
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

      {/* Backdrop -- only rendered (and only clickable/visible) while the
          drawer is open below `lg`; `lg:hidden` keeps it from ever
          appearing on wide screens even if state were somehow left true. */}
      {isNavOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsNavOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3 overflow-hidden">
            <button
              type="button"
              onClick={() => setIsNavOpen(true)}
              className="shrink-0 text-lg text-text-secondary hover:text-text-primary lg:hidden"
              aria-label="Open menu"
            >
              ☰
            </button>
            <span className="hidden truncate text-sm text-text-secondary sm:inline">
              {user?.email}
            </span>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="shrink-0 rounded-md border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:border-accent hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-muted"
          >
            Log out
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
