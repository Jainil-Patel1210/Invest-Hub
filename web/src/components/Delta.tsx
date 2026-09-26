import { deltaDirection, formatINR, formatPercent } from "../lib/format";

const DIRECTION_STYLES = {
  up: { className: "text-gain", glyph: "▲", sign: "+" },
  down: { className: "text-loss", glyph: "▼", sign: "-" },
  flat: { className: "text-neutral", glyph: "", sign: "" },
} as const;

interface DeltaProps {
  value: number;
  /** "currency" for a ₹ amount (e.g. day change), "percent" for a %-change value. */
  kind: "currency" | "percent";
  /** Show the ▲/▼ glyph. Off by default in tight spaces (a table cell); on for standalone stat displays. */
  showGlyph?: boolean;
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
export function Delta({ value, kind, showGlyph = false, className = "" }: DeltaProps) {
  const direction = deltaDirection(value);
  const style = DIRECTION_STYLES[direction];
  const magnitude =
    kind === "currency" ? formatINR(Math.abs(value)) : formatPercent(Math.abs(value));

  return (
    <span className={`tabular-nums ${style.className} ${className}`}>
      {showGlyph && style.glyph && <span aria-hidden="true">{style.glyph} </span>}
      {style.sign}
      {magnitude}
    </span>
  );
}
