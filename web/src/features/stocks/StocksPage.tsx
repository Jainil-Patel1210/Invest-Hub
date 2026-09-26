import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStockSearch } from "../../api/hooks/stocks";
import { useDebouncedValue } from "../../lib/useDebouncedValue";

export function StocksPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const navigate = useNavigate();
  const { data: results, isFetching } = useStockSearch(debouncedQuery);

  const trimmed = debouncedQuery.trim();

  return (
    <div className="max-w-xl">
      <h1 className="mb-4 text-lg font-semibold">Stocks</h1>

      <input
        type="text"
        placeholder="Search by company name or symbol..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent-muted"
      />

      <div className="mt-4 flex flex-col gap-1.5">
        {trimmed === "" && (
          <p className="text-sm text-text-secondary">Search for a stock by name or symbol.</p>
        )}
        {trimmed !== "" && isFetching && (
          <p className="text-sm text-text-secondary">Searching...</p>
        )}
        {trimmed !== "" && !isFetching && results?.length === 0 && (
          <p className="text-sm text-text-secondary">No stocks found for &quot;{trimmed}&quot;.</p>
        )}
        {results?.map((r) => (
          <button
            key={r.symbol}
            type="button"
            onClick={() => navigate(`/stocks/${encodeURIComponent(r.symbol)}`)}
            className="flex items-center justify-between rounded-md border border-border bg-surface px-4 py-3 text-left transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-muted"
          >
            <div>
              <div className="text-sm font-medium">{r.companyName}</div>
              <div className="text-xs text-text-secondary">{r.symbol}</div>
            </div>
            <span className="rounded bg-surface-raised px-2 py-0.5 text-xs text-text-secondary">
              {r.exchange}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
