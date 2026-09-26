import { useState } from "react";
import { useAddStockToWatchlist, useWatchlists } from "../../../api/hooks/watchlists";
import { ApiError } from "../../../api/client";

export function WatchlistButton({ symbol }: { symbol: string }) {
  const { data: watchlists, isLoading } = useWatchlists();
  const addStock = useAddStockToWatchlist();
  const [selectedId, setSelectedId] = useState<number | "">("");
  const [message, setMessage] = useState<string | null>(null);

  async function handleAdd() {
    if (selectedId === "") return;
    setMessage(null);
    try {
      await addStock.mutateAsync({ watchlistId: selectedId, symbol });
      setMessage("Added.");
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Something went wrong.");
    }
  }

  if (isLoading) return null;

  // Full watchlist creation lives on the Watchlist page (Phase 8) -- this
  // component only adds to a watchlist that already exists, and says so
  // plainly rather than half-building a duplicate "create" flow here.
  if (!watchlists || watchlists.length === 0) {
    return (
      <p className="text-xs text-text-secondary">Create a watchlist first to add stocks to it.</p>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : "")}
        className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent-muted"
      >
        <option value="">Add to watchlist...</option>
        {watchlists.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => void handleAdd()}
        disabled={selectedId === "" || addStock.isPending}
        className="rounded-md border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:border-accent hover:text-text-primary disabled:opacity-50"
      >
        Add
      </button>
      {message && <span className="text-xs text-text-secondary">{message}</span>}
    </div>
  );
}
