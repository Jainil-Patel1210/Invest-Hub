import {
  BarChart3,
  Eye,
  LayoutDashboard,
  Menu,
  PieChart,
  Receipt,
  Search,
  Settings,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useMarketOpen } from "../../lib/marketHours";
import { CommandPalette } from "../CommandPalette";
import { IndexTicker } from "./IndexTicker";
import { UserMenu } from "./UserMenu";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/portfolio", label: "Portfolio", icon: PieChart },
  { to: "/watchlist", label: "Watchlist", icon: Eye },
  { to: "/stocks", label: "Stocks", icon: TrendingUp },
  { to: "/transactions", label: "Transactions", icon: Receipt },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/account", label: "Account", icon: Settings },
];

export function AppShell() {
  // Below the `lg` breakpoint the sidebar becomes an off-canvas drawer,
  // closed by default -- above `lg` this state is simply never read (the
  // sidebar's `lg:translate-x-0 lg:static` always wins there regardless).
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const marketOpen = useMarketOpen();
  const { pathname } = useLocation();

  // Breadcrumb label: the nav item whose route the current path sits under
  // (so /stocks/TCS.NS still reads "Stocks").
  const currentPage = NAV_ITEMS.find((item) => pathname.startsWith(item.to))?.label ?? "Overview";

  // Ctrl+K (Cmd+K on macOS) toggles the stock search from anywhere in the app.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex h-screen bg-bg text-text-primary">
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-60 flex-col justify-between bg-sidebar px-3 py-6 transition-transform duration-200 lg:static lg:translate-x-0 ${
          isNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2.5 px-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-muted text-accent">
              <TrendingUp size={18} strokeWidth={2.25} />
            </span>
            <span className="text-base font-semibold tracking-tight">InvestHub</span>
          </div>

          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setIsNavOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                    isActive
                      ? "bg-surface-raised font-semibold text-accent-strong shadow-[inset_2px_0_0_var(--color-accent-strong)]"
                      : "text-text-secondary hover:bg-surface hover:text-text-primary"
                  }`
                }
              >
                <Icon size={18} aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div
          className="flex items-center gap-2 rounded-full bg-surface px-3 py-1.5"
          title="Regular session: Mon-Fri, 09:15-15:30 IST"
        >
          <span
            className={`h-2 w-2 rounded-full ${marketOpen ? "animate-pulse bg-gain" : "bg-text-tertiary"}`}
          />
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider ${
              marketOpen ? "text-gain" : "text-text-secondary"
            }`}
          >
            {marketOpen ? "NSE/BSE open" : "Market closed"}
          </span>
        </div>
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

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-10 flex items-center justify-between gap-3 border-b border-border bg-sidebar/80 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsNavOpen(true)}
              className="shrink-0 text-text-secondary hover:text-text-primary lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="hidden items-center gap-2 text-xs text-text-secondary sm:flex">
              <span>Workspace</span>
              <span className="text-text-tertiary">/</span>
              <span className="font-semibold text-text-primary">{currentPage}</span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="flex w-40 items-center gap-2 rounded-lg bg-surface px-3 py-1.5 text-sm text-text-tertiary transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-muted sm:w-72"
            >
              <Search size={15} aria-hidden="true" />
              <span className="flex-1 truncate text-left">Search stocks...</span>
              <kbd className="hidden rounded bg-surface-raised px-1.5 py-0.5 text-[10px] font-semibold text-text-secondary sm:inline">
                Ctrl K
              </kbd>
            </button>
            <IndexTicker />
            <UserMenu />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
