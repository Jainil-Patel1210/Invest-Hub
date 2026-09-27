---
name: frontend-design
description: Use this skill whenever building, styling, or reviewing React components, pages, layouts, or CSS for the InvestHub frontend — color choices, typography, spacing, component patterns (stat tiles, tables, badges, cards, empty/loading states), or any general UI/UX decision. Load it before writing the first line of a new page or component.
---

# InvestHub frontend design direction — "Institutional Glass Fintech"

**Mood**: a modern trading terminal — deep-navy dark mode, electric-indigo accent, frosted-glass overlays, information-dense but never cluttered. Precise and trustworthy, not playful. The reference mockups live in `stitch_investhub_financial_investment_dashboard/` (screens + `institutional_glass_fintech/DESIGN.md`); when in doubt, match them.

**Scope rule**: InvestHub is a _paper-trading_ tracker on real Yahoo Finance data. Don't build UI that implies data or features we don't have — demat/KYC/SEBI claims, Level-2 depth, analyst consensus, FII/DII flows, mutual funds/FDs/gold, tax ledgers, bank linking. Every number on screen must come from real data or a real computation.

For charts and data visualization, defer to the `dataviz` skill for mark/legend/tooltip conventions. Gain/loss colors in charts are the _same_ tokens as everywhere else.

---

## Color tokens

Defined once in `web/src/index.css` under `@theme` (Tailwind v4 turns `--color-x` into `bg-x`, `text-x`, `border-x`). Every color traces back to a token — never a one-off hex in a component (the one exception is the fixed sector palette in `SectorAllocationChart`).

| Token                                       | Value                     | Use                                       |
| ------------------------------------------- | ------------------------- | ----------------------------------------- |
| `bg`                                        | `#0f131d`                 | page background                           |
| `sidebar`                                   | `#0a0e18`                 | sidebar, header base                      |
| `surface` / `surface-raised`                | `#1c1f2a` / `#262a35`     | cards / hover, popovers                   |
| `border` / `border-strong`                  | white @ 8% / 16%          | hairlines                                 |
| `text-primary / secondary / tertiary`       | `#dfe2f1 / #a9adc0 / #7d8298` | body / labels / placeholders          |
| `accent`                                    | `#8f92ff`                 | links, active states, focus rings         |
| `accent-strong` + `on-accent-strong`        | `#c0c1ff` + `#1000a9`     | primary button fill + its text            |
| `secondary`                                 | `#4cd7f6`                 | analytics/metrics highlights              |
| `gain` / `gain-muted`                       | `#4edea3` / 14% tint      | positive numbers ONLY                     |
| `loss` / `loss-muted`                       | `#fb7185` / 14% tint      | negative numbers ONLY                     |
| `neutral`                                   | `#9aa0b5`                 | zero change                               |

Rule: color alone never carries meaning. Every gain/loss value has an explicit sign and, where there's room, a ▲/▼ glyph — all through the `<Delta>` component, the only place gain/loss color is applied to a number.

---

## Typography

- **Font**: Inter (loaded in `index.html`), fallback system sans.
- **Numbers**: the `.tabular-nums` class applies `tnum` + Inter's `cv02/cv03/cv04` digit alternates. Every price, quantity, and percentage uses it. Prices are Inter semibold — not monospace.
- **Currency**: ₹ with Indian grouping, 2 decimals, explicit sign on deltas — always through `lib/format.ts`.
- **Scale**: page title `text-2xl font-semibold tracking-tight`; stat values `~28px semibold`; body `text-sm`; table headers 11px uppercase (`thead th` is styled globally); micro-labels `text-[10px]` uppercase — use sparingly, they are the contrast floor.

## Spacing & density

4px base. Dense inside tables (`py-2.5` rows), roomy between sections (`gap-6`). Cards `p-4`/`p-5`.

## Elevation & shape

- `panel` utility: cards — `#1c1f2a`, 1px hairline, 12px radius, 1px inset top highlight, faint shadow.
- `glass` utility: anything floating (menus, palette, modals) — translucent + `backdrop-blur`. The top bar uses `bg-sidebar/80 backdrop-blur-xl`.
- Controls/inputs: 8px radius. Pills/badges (`<Delta pill>`, BUY/SELL tags): fully rounded.
- No heavy drop shadows; depth comes from tonal layers, hairlines, and the inset highlight.

## Components

- **Primary button**: `btn-primary` utility (lavender fill, dark text, soft indigo glow). One per view. Secondary = ghost with `border-border`.
- **Buy/Sell**: tinted (`bg-gain-muted text-gain` / `bg-loss-muted text-loss`) for small actions and tabs; the final submit button in a trade form is solid `bg-gain` / `bg-loss` with dark `text-bg`.
- **Tables**: global `thead th` / `tbody tr:hover` styles in `index.css` (uppercase tertiary headers; hovered row gets a 2px indigo left edge). Numeric columns right-aligned, tabular. Wrap in `overflow-x-auto panel`.
- **Stat tile**: `StatTile` — label above a large value, optional `<Delta>` chip, `loading` prop shows a skeleton.
- **Loading**: shimmer `Skeleton` / `SkeletonList`, shaped like the content. Never a bare "Loading…" and never a wrong number while data is pending.
- **Empty states**: one muted line plus the obvious next action.
- **Overlays**: `CommandPalette` (Ctrl/Cmd+K), `QuickTradeModal` (`useQuickTrade().openTrade(symbol, side)`), `UserMenu` — all `glass`.
- **Toasts**: `sonner`, styled in `main.tsx`; success toasts for completed actions, inline text for form-level errors.
- **Icons**: `lucide-react` (tree-shaken SVG). No emoji as functional icons.
- **Focus**: visible `ring-2 ring-accent-muted` on every interactive element.

## Motion

150–200ms ease on hover/focus/color. No spring/bounce. Respect `prefers-reduced-motion` for shimmer/animation.

## Explicitly avoid

- Pure white text (`text-primary` is `#dfe2f1`).
- Gradient-filled buttons; the primary button is a flat fill with glow.
- Full-saturation solid pills for status tags.
- One-off hex colors, and any UI implying real-brokerage features (see scope rule).
