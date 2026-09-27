import { deltaDirection, formatINR, formatPercent } from "../lib/format";

const DIRECTION_STYLES = {
  up: { className: "text-gain", pillClassName: "bg-gain-muted", glyph: "▲", sign: "+" },
  down: { className: "text-loss", pillClassName: "bg-loss-muted", glyph: "▼", sign: "-" },
  flat: { className: "text-neutral", pillClassName: "bg-white/5", glyph: "", sign: "" },
} as const;

interface DeltaProps {
  value: number;
  /** "currency" for a ₹ amount (e.g. day change), "percent" for a %-change value. */
  kind: "currency" | "percent";
  /** Show the ▲/▼ glyph. Off by default in tight spaces (a table cell); on for standalone stat displays. */
  showGlyph?: boolean;
  /** Render as a tinted pill badge (used for %-change chips in lists and tables). */
  pill?: boolean;
  className?: string;
}

/**
 * The one place gain/loss color is ever applied. Color alone fails the
 * colorblind-accessibility check for this exact green/red pair (verified
 * with the dataviz skill's palette validator -- ΔE 7.4 for deuteranopia,
 * in the "legal only with secondary encoding" band) -- so every value that
 * goes through this component gets an explicit sign and, optionally, a
 * direction glyph alongside the color, never color by itself. Nothing
 * outside this file should render a bare gain/loss color on a number.
 */
export function Delta({
  value,
  kind,
  showGlyph = false,
  pill = false,
  className = "",
}: DeltaProps) {
  const direction = deltaDirection(value);
  const style = DIRECTION_STYLES[direction];
  const magnitude =
    kind === "currency" ? formatINR(Math.abs(value)) : formatPercent(Math.abs(value));

  return (
    <span
      className={`tabular-nums ${style.className} ${
        pill
          ? `inline-block rounded-full px-2 py-0.5 text-xs font-medium ${style.pillClassName}`
          : ""
      } ${className}`}
    >
      {showGlyph && style.glyph && <span aria-hidden="true">{style.glyph} </span>}
      {style.sign}
      {magnitude}
    </span>
  );
}
