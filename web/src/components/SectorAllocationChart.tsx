import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { SectorAllocation } from "../api/hooks/portfolio";
import { formatINR, formatPercent } from "../lib/format";

/**
 * The dataviz skill's validated categorical palette, in its fixed order --
 * this exact ordering is what clears the colorblind-separation gates (see
 * the skill's palette.md), so sectors are assigned to slots by *identity*
 * here, never re-sorted by value. "Color follows the entity, never its
 * rank" is a non-negotiable in that skill: if colors were assigned by
 * current portfolio weight, Technology could be blue today and orange next
 * month purely because Energy grew past it -- confusing across two visits
 * to the same page. A sector not in this list (rare, but Yahoo's sector
 * taxonomy has a few beyond these eight) folds into a neutral "Other"
 * rather than inventing a ninth hue outside the validated set.
 */
const SECTOR_COLORS: Record<string, string> = {
  Technology: "#3987e5",
  "Financial Services": "#d95926",
  Energy: "#199e70",
  Healthcare: "#c98500",
  "Consumer Cyclical": "#d55181",
  Industrials: "#008300",
  "Consumer Defensive": "#9085e9",
  "Communication Services": "#e66767",
};
const OTHER_COLOR = "#7d8298"; // --color-text-tertiary -- deliberately desaturated, this bucket isn't a real identity

// Rendering order is fixed too (this array's order), independent of each
// sector's current value -- the same reasoning as the color assignment
// above: a pie chart's wedges are only ever adjacent to their two ring
// neighbors, and that adjacency has to stay stable for the validated
// ordering to mean anything.
const SECTOR_ORDER = Object.keys(SECTOR_COLORS);

function colorFor(sector: string): string {
  return SECTOR_COLORS[sector] ?? OTHER_COLOR;
}

export function SectorAllocationChart({ allocation }: { allocation: SectorAllocation[] }) {
  if (allocation.length === 0) {
    return (
      <p className="text-sm text-text-secondary">No holdings to show an allocation for yet.</p>
    );
  }

  const sorted = [...allocation].sort(
    (a, b) =>
      SECTOR_ORDER.indexOf(a.sector) - SECTOR_ORDER.indexOf(b.sector) ||
      a.sector.localeCompare(b.sector),
  );

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="h-40 w-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sorted}
              dataKey="value"
              nameKey="sector"
              innerRadius="60%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="var(--color-surface)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {sorted.map((s) => (
                <Cell key={s.sector} fill={colorFor(s.sector)} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Direct labels, not just color -- required for <= 8 series per the
          dataviz skill, and this list doubles as the "table view"
          alternative to the chart the skill's accessibility pass calls for. */}
      <ul className="flex flex-1 flex-col gap-1.5 text-sm">
        {sorted.map((s) => (
          <li key={s.sector} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: colorFor(s.sector) }}
              aria-hidden="true"
            />
            <span className="flex-1 text-text-primary">{s.sector}</span>
            <span className="tabular-nums text-text-secondary">{formatINR(s.value, 0)}</span>
            <span className="w-14 text-right tabular-nums text-text-secondary">
              {formatPercent(s.percentage, 1)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
