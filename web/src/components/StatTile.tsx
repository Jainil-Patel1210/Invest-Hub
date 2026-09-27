import type { ReactNode } from "react";
import { Skeleton } from "./Skeleton";

interface StatTileProps {
  label: string;
  value: ReactNode;
  delta?: ReactNode;
  /** Show a shimmer where the value goes instead of a number that isn't ready yet. */
  loading?: boolean;
  /** Extra content pinned to the bottom of the tile (e.g. a sparkline). */
  footer?: ReactNode;
}

/** Label in small uppercase muted text, above a large tabular-nums value, with an optional delta chip -- the pattern spelled out in the frontend-design skill for every stat display in the app. */
export function StatTile({ label, value, delta, footer, loading = false }: StatTileProps) {
  return (
    <div className="panel p-4">
      <div className="text-xs font-medium tracking-wide text-text-secondary">{label}</div>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-32" />
      ) : (
        <>
          <div className="mt-1 text-[1.75rem] font-semibold leading-9 tracking-tight tabular-nums text-text-primary">
            {value}
          </div>
          {delta && <div className="mt-1 text-sm">{delta}</div>}
          {footer && <div className="mt-3">{footer}</div>}
        </>
      )}
    </div>
  );
}
