import { Link } from "react-router-dom";
import type { EnrichedHolding } from "../../../api/hooks/portfolio";
import { Delta } from "../../../components/Delta";
import { formatINR } from "../../../lib/format";

export function TopHoldings({ holdings }: { holdings: EnrichedHolding[] }) {
  const top = [...holdings]
    .filter((h) => h.currentValue !== null)
    .sort((a, b) => b.currentValue! - a.currentValue!)
    .slice(0, 5);

  if (top.length === 0) {
    return <p className="text-sm text-text-secondary">No holdings yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {top.map((h) => (
        <li key={h.symbol}>
          <Link
            to={`/portfolio/${encodeURIComponent(h.symbol)}`}
            className="flex items-center justify-between text-sm hover:underline"
          >
            <span className="text-text-primary">{h.symbol}</span>
            <span className="flex items-center gap-2">
              <span className="tabular-nums text-text-secondary">
                {formatINR(h.currentValue!, 0)}
              </span>
              {h.pnlPct != null && <Delta value={h.pnlPct} kind="percent" />}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
