import { Link } from "react-router-dom";
import { useMovers } from "../../../api/hooks/market";
import { Delta } from "../../../components/Delta";
import { formatINR } from "../../../lib/format";
import { SkeletonList } from "../../../components/Skeleton";

export function MoversList() {
  const { data, isLoading, isError } = useMovers(5);

  if (isLoading) return <SkeletonList rows={3} />;
  if (isError) return <p className="text-sm text-loss">Couldn&apos;t load movers right now.</p>;

  // Movers are scoped to stocks *you* track (holdings + watchlists) --
  // there's no universe-wide "top NSE gainers" here, since `stocks` is a
  // growing cache of whatever's been looked up, not a fixed market index.
  if (!data || (data.gainers.length === 0 && data.losers.length === 0)) {
    return (
      <p className="text-sm text-text-secondary">
        Nothing to show yet -- movers are based on stocks you hold or watch.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h3 className="mb-2 text-xs uppercase tracking-wide text-text-secondary">Gainers</h3>
        <ul className="flex flex-col gap-2">
          {data.gainers.map((q) => (
            <li key={q.symbol}>
              <Link
                to={`/stocks/${encodeURIComponent(q.symbol)}`}
                className="flex items-center justify-between text-sm hover:underline"
              >
                <span className="text-text-primary">{q.symbol}</span>
                <span className="flex items-center gap-2">
                  <span className="tabular-nums text-text-secondary">{formatINR(q.price)}</span>
                  <Delta value={q.dayChangePct} kind="percent" pill />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="mb-2 text-xs uppercase tracking-wide text-text-secondary">Losers</h3>
        <ul className="flex flex-col gap-2">
          {data.losers.map((q) => (
            <li key={q.symbol}>
              <Link
                to={`/stocks/${encodeURIComponent(q.symbol)}`}
                className="flex items-center justify-between text-sm hover:underline"
              >
                <span className="text-text-primary">{q.symbol}</span>
                <span className="flex items-center gap-2">
                  <span className="tabular-nums text-text-secondary">{formatINR(q.price)}</span>
                  <Delta value={q.dayChangePct} kind="percent" pill />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
