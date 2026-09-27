/** A shimmering placeholder block. Size it with className (e.g. "h-8 w-32"). */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

/**
 * A stack of row-shaped placeholders for lists and tables. Announced to
 * screen readers as a single "Loading" status instead of N empty blocks.
 */
export function SkeletonList({
  rows = 4,
  rowClassName = "h-11",
}: {
  rows?: number;
  rowClassName?: string;
}) {
  return (
    <div role="status" aria-label="Loading" className="flex flex-col gap-2">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className={`w-full ${rowClassName}`} />
      ))}
    </div>
  );
}
