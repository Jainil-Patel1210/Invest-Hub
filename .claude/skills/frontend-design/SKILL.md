---
name: frontend-design
description: Use this skill whenever building, styling, or reviewing React components, pages, layouts, or CSS for the InvestHub frontend — color choices, typography, spacing, component patterns (stat tiles, tables, badges, cards, empty/loading states), or any general UI/UX decision. Load it before writing the first line of a new page or component.
---

# InvestHub frontend design direction

**Mood**: a modern trading-terminal — dark-first, high-contrast, information-dense but never cluttered. Closer to a Bloomberg terminal or a crypto exchange than a consumer app. This is a serious tool for tracking real money; the design should read as precise and trustworthy, not playful.

For charts and data visualization specifically (line charts, allocation donuts, sparklines), defer to the `dataviz` skill for mark/legend/tooltip conventions — but the gain/loss colors defined below are the _same_ ones a chart should use. Never let a chart's green differ from a stat tile's green.

---

## Color tokens

Define these as CSS custom properties on `:root` (or Tailwind theme extensions referencing them) — every color decision in the app should trace back to one of these, never a one-off hex value in a component.

```css
:root {
  /* Surfaces */
  --bg: #0f1115; /* page background */
  --surface: #171a21; /* cards, panels */
  --surface-raised: #1e222b; /* hover state, popovers, modals */
  --border: rgba(255, 255, 255, 0.08); /* hairline borders — never a heavy box-shadow */

  /* Text */
  --text-primary: #e8eaed; /* near-white, not pure #fff — pure white on dark is harsh */
  --text-secondary: #9aa1ac; /* labels, meta, muted body text */
  --text-tertiary: #5b616e; /* disabled, placeholder */

  /* Accent */
  --accent: #3b82f6; /* primary actions, links, focus rings */
  --accent-muted: rgba(59, 130, 246, 0.15); /* tinted backgrounds for accent badges */
  --highlight: #f59e0b; /* secondary emphasis only — sparingly, never competes with accent */

  /* Signal — gains/losses ONLY. Never reuse these for anything that isn't
     literally a positive or negative number moving. */
  --gain: #22c55e;
  --gain-muted: rgba(34, 197, 94, 0.15);
  --loss: #ef4444;
  --loss-muted: rgba(239, 68, 68, 0.15);
  --neutral: #8b93a1; /* zero change */
}
```

Rule: color alone never carries meaning. Every gain/loss value is paired with an explicit sign (`+`/`-`) and, where there's room, a direction glyph (▲/▼) — this is a real accessibility requirement (colorblind users), not decoration.

---

## Typography

- **UI text**: system sans stack — `-apple-system, "Segoe UI", Inter, Roboto, sans-serif`. If loading a webfont, Inter is the right choice for this mood.
- **Numbers**: apply `font-variant-numeric: tabular-nums` to every numeric column or price value, regardless of font — this is the single highest-impact typography detail for a finance UI. Digits stay fixed-width so a live-updating price never visually jitters the layout around it. For a stronger terminal feel, an explicit monospace (`"JetBrains Mono", ui-monospace, monospace`) on large price displays (stat tiles, the stock detail header) is worth the contrast against sans-serif labels around it.
- **Currency formatting**: always ₹ with Indian digit grouping (`₹1,00,000`, not `₹100,000`), always 2 decimal places, always an explicit sign on deltas. This belongs in one shared formatter (`lib/format.ts`), never inlined per-component.

**Scale** (compact — this is a dense app, not a marketing page):

| Token      | Size    | Use                            |
| ---------- | ------- | ------------------------------ |
| `xs`       | 12px    | badges, table meta, timestamps |
| `sm`       | 13–14px | table cells, body text         |
| `base`     | 15–16px | default paragraph              |
| `lg`       | 18–20px | section headings               |
| `xl`/`2xl` | 24–32px | stat tile values, page titles  |

---

## Spacing & density

4px base unit (Tailwind's default scale is fine as-is). This app should feel _compact_ — tables and lists use tight vertical rhythm (Tailwind `py-2`/`py-2.5` per row, not `py-4`), while section-level gaps get more room (`gap-6`/`gap-8`) so the density reads as intentional, not cramped. Don't apply the same spacing value everywhere; the contrast between tight-inside-a-table and roomy-between-sections is what makes density feel designed rather than accidental.

---

## Component patterns

**Stat tile** (net worth, day P&L, total P&L): label in `xs`, uppercase, `--text-secondary`, above a large tabular-nums value in `--text-primary`. A small delta chip below or beside it: `--gain`/`--loss` text on the matching `-muted` background (never a full-saturation fill — it's harsh against a dark surface and reads as louder than the number it's supporting), with the sign and glyph.

**BUY/SELL badges**: same tinted-background-plus-saturated-text pattern — `--gain-muted` bg / `--gain` text for BUY, `--loss-muted` / `--loss` for SELL. A solid green or red pill is the wrong register here; it competes with the actual P&L colors elsewhere on the same row.

**Tables** (holdings, watchlist, transaction history): sticky header, subtle row hover (`--surface` → `--surface-raised`), numeric columns right-aligned with tabular-nums, text columns left-aligned. No zebra striping — a hairline border between rows (`--border`) reads cleaner at this density.

**Cards/panels**: 1px `--border`, `--surface` background, no heavy shadow. A very subtle lighter top edge (a 1px inset highlight) reads as a "panel" without needing a shadow at all — shadows on a dark background mostly just look muddy.

**Buttons**: solid `--accent` fill for the primary action per view (Buy, Sell, Save), ghost/outline (transparent bg, `--border`, `--text-primary`) for everything secondary. No gradients on buttons — a gradient-filled CTA is one of the most recognizable "generic AI-generated app" tells, and it fights the terminal mood outright.

**Focus states**: a visible ring in `--accent` with a soft outer glow (`box-shadow: 0 0 0 3px var(--accent-muted)`) on every interactive element — buttons, inputs, table rows that are keyboard-navigable. Non-negotiable for keyboard accessibility, and it happens to match the mood well.

**Live price updates**: when a price cell updates (polling, a websocket tick later), briefly flash the cell's background to `--gain-muted`/`--loss-muted` and fade over ~600ms. This one detail does more to make a portfolio tracker feel alive than almost anything else — a price that visibly _moves_ rather than silently changing on re-render.

**Empty states**: never a bare blank area. A muted icon, one line of `--text-secondary` copy, and — where there's an obvious next action — a button ("No holdings yet" → _Browse stocks_). A blank table with just a header row reads as broken, not empty.

**Loading states**: skeleton placeholders shaped like the eventual content (a stat tile's skeleton is a rectangle where the number goes, not a spinner in the middle of the card). Reduces layout shift and feels considerably more native than a generic spinner.

---

## Motion

Subtle only: 150–200ms ease transitions on hover, focus, and color changes. No spring/bounce easing anywhere — it reads as playful, which fights the "serious tool" mood. The one exception is the live-price-flash pattern above, which is deliberately a little more noticeable because drawing the eye _is_ the point of that one.

---

## Explicitly avoid

- Purple-to-blue gradients as a background or button fill — the single most recognizable "AI-generated app" signature at this point.
- Pure white (`#fff`) text on the dark background — use `--text-primary` (`#e8eaed`).
- Full-saturation solid badges/pills for anything (BUY/SELL, status tags) — always tinted-bg + saturated-text.
- Heavy drop shadows for elevation on dark surfaces — use borders and subtle top-highlights instead.
- Emoji as functional icons in tables or nav (fine sparingly in empty-state illustrations, not as a substitute for a real icon set).
- Rounding everything to a pill shape — reserve full rounding for actual pills (badges); cards and buttons read more precise with a smaller radius (6–8px).
- Inconsistent spacing values scattered per-component instead of the defined scale.
