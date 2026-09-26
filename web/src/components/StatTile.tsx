import type { ReactNode } from "react";

interface StatTileProps {
  label: string;
  value: ReactNode;
  delta?: ReactNode;
}

/** Label in small uppercase muted text, above a large tabular-nums value, with an optional delta chip -- the pattern spelled out in the frontend-design skill for every stat display in the app. */
export function StatTile({ label, value, delta }: StatTileProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="text-xs uppercase tracking-wide text-text-secondary">{label}</div>
      <div className="mt-1 font-mono text-2xl tabular-nums text-text-primary">{value}</div>
      {delta && <div className="mt-1 text-sm">{delta}</div>}
    </div>
  );
}
