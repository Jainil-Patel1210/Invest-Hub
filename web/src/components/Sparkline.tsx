interface SparklineProps {
  values: number[];
  /** Any CSS color; defaults to the current text color so a parent can style it (e.g. `text-gain`). */
  color?: string;
  className?: string;
}

/**
 * A tiny inline trend line -- no axes, no tooltip, purely a "which way is this
 * heading" cue next to a number. Drawn as a plain SVG path scaled to its own
 * min/max, so it always fills the box regardless of the values' magnitude.
 * Renders nothing for fewer than two points (a single value has no trend).
 */
export function Sparkline({
  values,
  color = "currentColor",
  className = "h-6 w-24",
}: SparklineProps) {
  if (values.length < 2) return null;

  const width = 96;
  const height = 24;
  const pad = 2; // keeps the stroke from clipping at the edges

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1; // a perfectly flat series draws a flat line, not NaN

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (width - pad * 2) + pad;
    const y = height - pad - ((v - min) / span) * (height - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`overflow-visible ${className}`}
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        points={points.join(" ")}
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
