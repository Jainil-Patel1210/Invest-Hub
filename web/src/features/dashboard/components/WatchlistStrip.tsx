import { Link } from "react-router-dom";
import { useWatchlistDetail, useWatchlists } from "../../../api/hooks/watchlists";
import { Delta } from "../../../components/Delta";
import { formatINR } from "../../../lib/format";
import { SkeletonList } from "../../../components/Skeleton";

/** Shows the user's first watchlist as a compact strip -- the full tabbed view with every watchlist lives on the dedicated /watchlist page. */
export function WatchlistStrip() {
  const { data: watchlists, isLoading: listLoading, isError: listError } = useWatchlists();
  const firstId = watchlists?.[0]?.id ?? null;
  const {
    data: detail,
    isLoading: detailLoading,
    isError: detailError,
  } = useWatchlistDetail(firstId);

  if (listLoading) return <SkeletonList rows={3} />;
  // Distinct from "no watchlists yet" below -- an error here isn't a reason
  // to tell the user to go create one, that would just be misleading.
  if (listError)
    return <p className="text-sm text-loss">Couldn&apos;t load your watchlists right now.</p>;

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

  if (detailLoading) return <SkeletonList rows={3} />;
  if (detailError || !detail)
    return <p className="text-sm text-loss">Couldn&apos;t load this watchlist right now.</p>;

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
