import { Link } from "react-router-dom";
import { useWatchlistDetail, useWatchlists } from "../../../api/hooks/watchlists";
import { Delta } from "../../../components/Delta";
import { formatINR } from "../../../lib/format";

/** Shows the user's first watchlist as a compact strip -- the full tabbed view with every watchlist lives on the dedicated /watchlist page. */
export function WatchlistStrip() {
  const { data: watchlists, isLoading: listLoading } = useWatchlists();
  const firstId = watchlists?.[0]?.id ?? null;
  const { data: detail, isLoading: detailLoading } = useWatchlistDetail(firstId);

  if (listLoading) return <p className="text-sm text-text-secondary">Loading...</p>;

  if (!watchlists || watchlists.length === 0) {
    return (
      <p className="text-sm text-text-secondary">
        No watchlists yet.{" "}
        <Link to="/watchlist" className="text-accent hover:underline">
          Create one
        </Link>
        .
      </p>
    );
  }

  if (detailLoading || !detail) return <p className="text-sm text-text-secondary">Loading...</p>;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-text-secondary">{detail.name}</span>
        <Link to="/watchlist" className="text-xs text-accent hover:underline">
          View all
        </Link>
      </div>
      {detail.items.length === 0 ? (
        <p className="text-sm text-text-secondary">No stocks in this watchlist yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {detail.items.slice(0, 5).map((item) => (
            <li key={item.symbol}>
              <Link
                to={`/stocks/${encodeURIComponent(item.symbol)}`}
                className="flex items-center justify-between text-sm hover:underline"
              >
                <span className="text-text-primary">{item.symbol}</span>
                {item.quote ? (
                  <span className="flex items-center gap-2">
                    <span className="tabular-nums text-text-secondary">
                      {formatINR(item.quote.price)}
                    </span>
                    <Delta value={item.quote.dayChangePct} kind="percent" />
                  </span>
                ) : (
                  <span className="text-text-secondary">—</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
