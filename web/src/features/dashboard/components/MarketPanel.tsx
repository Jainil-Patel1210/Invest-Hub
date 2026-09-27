import { useState } from "react";
import { MoversList } from "./MoversList";
import { WatchlistStrip } from "./WatchlistStrip";

const TABS = [
  { id: "movers", label: "Top movers" },
  { id: "watchlist", label: "Watchlist" },
] as const;

/** One panel, two views of "what's moving among stocks I care about". */
export function MarketPanel() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("movers");

  return (
    <div className="panel p-5">
      <div className="mb-4 flex rounded-lg bg-sidebar p-1" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-muted ${
              tab === t.id
                ? "bg-surface-raised text-text-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "movers" ? <MoversList /> : <WatchlistStrip />}
    </div>
  );
}
