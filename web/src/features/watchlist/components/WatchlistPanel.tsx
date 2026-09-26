import { useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../../api/client";
import { useStockSearch } from "../../../api/hooks/stocks";
import {
  useAddStockToWatchlist,
  useDeleteWatchlist,
  useRemoveStockFromWatchlist,
  useRenameWatchlist,
  useWatchlistDetail,
  type WatchlistSummary,
} from "../../../api/hooks/watchlists";
import { Delta } from "../../../components/Delta";
import { formatINR } from "../../../lib/format";
import { useDebouncedValue } from "../../../lib/useDebouncedValue";

function AddStockSearch({ watchlistId }: { watchlistId: number }) {
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 300);
  const { data: results } = useStockSearch(debounced);
  const addStock = useAddStockToWatchlist();
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(symbol: string) {
    setError(null);
    try {
      await addStock.mutateAsync({ watchlistId, symbol });
      setQuery("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Add a stock..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-64 rounded-md border border-border bg-bg px-3 py-1.5 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent-muted"
      />
      {debounced.trim() !== "" && results && results.length > 0 && (
        <div className="absolute right-0 z-10 mt-1 w-64 rounded-md border border-border bg-surface-raised shadow-lg">
          {results.slice(0, 6).map((r) => (
            <button
              key={r.symbol}
              type="button"
              onClick={() => void handleAdd(r.symbol)}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-bg"
            >
              <span>
                {r.companyName} <span className="text-text-secondary">({r.symbol})</span>
              </span>
            </button>
          ))}
        </div>
      )}
      {error && <p className="absolute right-0 mt-1 text-xs text-loss">{error}</p>}
    </div>
  );
}

export function WatchlistPanel({ watchlist }: { watchlist: WatchlistSummary }) {
  const { data, isLoading } = useWatchlistDetail(watchlist.id);
  const rename = useRenameWatchlist();
  const removeStock = useRemoveStockFromWatchlist();
  const deleteWatchlist = useDeleteWatchlist();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(watchlist.name);
  const [nameError, setNameError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function handleRename() {
    setNameError(null);
    if (nameDraft.trim() === "" || nameDraft === watchlist.name) {
      setIsEditingName(false);
      return;
    }
    try {
      await rename.mutateAsync({ id: watchlist.id, name: nameDraft.trim() });
      setIsEditingName(false);
    } catch (err) {
      setNameError(err instanceof ApiError ? err.message : "Something went wrong.");
    }
  }

  if (isLoading || !data) {
    return <p className="text-sm text-text-secondary">Loading...</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        {isEditingName ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void handleRename()}
              className="rounded-md border border-border bg-bg px-2 py-1 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent-muted"
            />
            <button
              type="button"
              onClick={() => void handleRename()}
              className="text-xs text-accent hover:underline"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditingName(false);
                setNameDraft(watchlist.name);
              }}
              className="text-xs text-text-secondary hover:underline"
            >
              Cancel
            </button>
            {nameError && <span className="text-xs text-loss">{nameError}</span>}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditingName(true)}
            className="text-sm font-medium text-text-primary hover:underline"
          >
            {watchlist.name}
          </button>
        )}

        <div className="flex items-center gap-2">
          <AddStockSearch watchlistId={watchlist.id} />
          {confirmingDelete ? (
            <span className="flex items-center gap-1.5 text-xs">
              <span className="text-text-secondary">Delete this watchlist?</span>
              <button
                type="button"
                onClick={() => void deleteWatchlist.mutateAsync(watchlist.id)}
                className="text-loss hover:underline"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="text-text-secondary hover:underline"
              >
                No
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="rounded-md border border-border px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:border-loss hover:text-loss"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {data.items.length === 0 ? (
        <p className="text-sm text-text-secondary">
          No stocks in this watchlist yet -- add one above.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-text-secondary">
                <th className="px-4 py-2.5 text-left font-medium">Stock</th>
                <th className="px-4 py-2.5 text-right font-medium">Price</th>
                <th className="px-4 py-2.5 text-right font-medium">Change</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr
                  key={item.symbol}
                  className="border-b border-border last:border-0 hover:bg-surface-raised"
                >
                  <td className="px-4 py-2.5">
                    <Link
                      to={`/stocks/${encodeURIComponent(item.symbol)}`}
                      className="hover:underline"
                    >
                      <div className="font-medium text-text-primary">{item.symbol}</div>
                      <div className="text-xs text-text-secondary">{item.companyName}</div>
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {item.quote ? formatINR(item.quote.price) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {item.quote ? <Delta value={item.quote.dayChangePct} kind="percent" /> : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        void removeStock.mutateAsync({
                          watchlistId: watchlist.id,
                          symbol: item.symbol,
                        })
                      }
                      className="text-text-tertiary hover:text-loss"
                      aria-label={`Remove ${item.symbol}`}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
