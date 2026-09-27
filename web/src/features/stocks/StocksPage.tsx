import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCatalog, useStockSearch } from "../../api/hooks/stocks";
import { Delta } from "../../components/Delta";
import { SkeletonList } from "../../components/Skeleton";
import { formatINR } from "../../lib/format";
import { useDebouncedValue } from "../../lib/useDebouncedValue";
import { useQuickTrade } from "../../lib/useQuickTrade";

export function StocksPage() {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);
  const navigate = useNavigate();
  const { openTrade } = useQuickTrade();

  const trimmed = debouncedQuery.trim();
  const isSearching = query.trim() !== "";

  const catalog = useCatalog();
  const search = useStockSearch(debouncedQuery);

  const sectors = useMemo(
    () =>
      [
        ...new Set((catalog.data ?? []).map((s) => s.sector).filter((s): s is string => !!s)),
      ].sort(),
    [catalog.data],
  );
  const visibleCatalog = (catalog.data ?? []).filter((s) => !sector || s.sector === sector);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">Stocks</h1>
        {!isSearching && sectors.length > 0 && (
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            aria-label="Filter by sector"
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent-muted"
          >
            <option value="">All sectors</option>
            {sectors.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
      </div>

      <input
        type="text"
        placeholder="Search by company name or symbol, e.g. tc, reliance..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
        className="w-full max-w-xl rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent-muted"
      />

      {isSearching ? (
        <div className="flex max-w-xl flex-col gap-1.5">
          {(search.isFetching || query.trim() !== trimmed) && !search.data && (
            <SkeletonList rows={3} rowClassName="h-14" />
          )}
          {trimmed !== "" && !search.isFetching && search.data?.length === 0 && (
            <p className="text-sm text-text-secondary">
              No stocks found for &quot;{trimmed}&quot;.
            </p>
          )}
          {search.isError && <p className="text-sm text-loss">Search failed. Please try again.</p>}
          {search.data?.map((r) => (
            <button
              key={r.symbol}
              type="button"
              onClick={() => navigate(`/stocks/${encodeURIComponent(r.symbol)}`)}
              className="panel flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-muted"
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
      ) : catalog.isLoading ? (
        <SkeletonList rows={8} rowClassName="h-12" />
      ) : catalog.isError ? (
        <p className="text-sm text-loss">Couldn&apos;t load stocks right now.</p>
      ) : visibleCatalog.length === 0 ? (
        <p className="text-sm text-text-secondary">No stocks in this sector.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-text-secondary">
                <th className="px-4 py-2.5 text-left font-medium">Stock</th>
                <th className="hidden px-4 py-2.5 text-left font-medium md:table-cell">Sector</th>
                <th className="px-4 py-2.5 text-right font-medium">Price</th>
                <th className="px-4 py-2.5 text-right font-medium">Change</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {visibleCatalog.map((s) => (
                <tr
                  key={s.symbol}
                  onClick={() => navigate(`/stocks/${encodeURIComponent(s.symbol)}`)}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-raised"
                >
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-text-primary">{s.symbol}</div>
                    <div className="text-xs text-text-secondary">{s.companyName}</div>
                  </td>
                  <td className="hidden px-4 py-2.5 text-text-secondary md:table-cell">
                    {s.sector ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {s.quote ? formatINR(s.quote.price) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {s.quote ? (
                      <Delta value={s.quote.dayChangePct} kind="percent" showGlyph />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        // The row itself navigates; the button must not also trigger that.
                        e.stopPropagation();
                        openTrade(s.symbol, "BUY");
                      }}
                      className="rounded-md bg-gain-muted px-2.5 py-1 text-xs font-medium text-gain transition-colors hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-muted"
                    >
                      Buy
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
