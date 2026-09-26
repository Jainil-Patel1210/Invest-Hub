# InvestHub

A personal portfolio management and analysis app for Indian equities (NSE/BSE) — real stock data, real price charts, real company fundamentals, and virtual paper trading against a starting balance. No real money ever moves; it's a tracker, not a brokerage.

Originally a PostgreSQL-only database-design coursework project (25 tables modeling brokers, analysts, mutual funds, IPOs, and institutional investors — kept for reference under [`docs/legacy/`](docs/legacy/)). Rebuilt from scratch as a full-stack app with a deliberately narrower, sharper scope: portfolio tracking, watchlists, and real market data, with the institutional-investor layer dropped entirely.

## What it does

- **Real market data** — live quotes, historical price charts, and fundamentals (sector, P/E, EPS, market cap, 52-week range) for any NSE/BSE stock, sourced from Yahoo Finance
- **Portfolio tracking** — log buy/sell trades (at the live price or a custom/backdated price), see weighted-average cost basis, live P&L, and sector allocation
- **Watchlists** — multiple named lists, live quotes, add/remove stocks
- **Transaction history** — every trade, filterable by symbol/type/date, paginated
- **Atomic, concurrency-safe trading** — two simultaneous trades racing on the same balance can't both succeed and can't leave the balance negative (see [`server/src/modules/trade`](server/src/modules/trade))

## Stack

|             |                                                                                                                                                      |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend     | Node.js, Express 5, TypeScript, raw SQL via `pg` (no ORM — this began as a DBMS project, and the schema/queries are meant to be visible, not hidden) |
| Database    | PostgreSQL 17                                                                                                                                        |
| Auth        | JWT access tokens (in-memory, short-lived) + rotating opaque refresh tokens (httpOnly cookie, DB-backed, revocable)                                  |
| Market data | Yahoo Finance (via `yahoo-finance2`), cached in Postgres behind a provider-agnostic interface                                                        |
| Frontend    | React 19, Vite, TypeScript, Tailwind CSS v4, TanStack Query, React Router, Recharts                                                                  |
| Testing     | Vitest + Supertest (60 backend integration tests against a real database and real market data)                                                       |

## Project structure

```
InvestHub/
├── db/
│   └── schema.sql              -- the full current schema (8 tables)
├── server/                     -- Express API
│   └── src/
│       ├── db/                 -- pool, transaction helper, migration + seed scripts
│       ├── lib/                -- errors, JWT, the pricing-provider abstraction + cache
│       ├── middleware/         -- auth, validation, centralized error handling
│       └── modules/            -- auth, stocks, market, portfolio, watchlist, trade, transactions
├── web/                        -- React frontend
│   └── src/
│       ├── api/                -- fetch client + TanStack Query hooks
│       ├── components/         -- shared UI (Delta, StatTile, SectorAllocationChart, layout)
│       └── features/           -- one folder per page area
├── docs/
│   ├── API.md                  -- full API reference
│   └── legacy/                 -- the original DBMS coursework schema & docs
└── PLAN.md                     -- local-only, not committed (see .gitignore)
```

## Running it locally

**Prerequisites**: Node 24+, pnpm (`corepack enable && corepack prepare pnpm@latest --activate`, or `npm install -g pnpm`), Docker Desktop.

```bash
git clone https://github.com/Jainil-Patel1210/Invest-Hub.git
cd Invest-Hub
pnpm install

cp .env.example server/.env    # then fill in real values -- see below
pnpm db:up                     # starts Postgres in Docker
pnpm db:migrate                # applies db/schema.sql
pnpm db:seed                   # seeds ~50 real Nifty-50 stocks with live fundamentals
pnpm db:seed:demo              # optional: creates demo@investhub.local / demo1234 with sample holdings + a watchlist

pnpm dev:server                # API on :4000
pnpm dev:web                   # frontend on :5173, in a second terminal
```

Then open `http://localhost:5173` and either log in with the demo account or register your own — either way you start with a virtual ₹10,00,000 balance.

**A real gotcha worth knowing about**: if you already have a native PostgreSQL install on your machine, it may already own port 5432. `docker-compose.yml` in this repo maps the container to host port **5433** specifically to avoid that collision — make sure `DATABASE_URL` in your `.env` matches (`.env.example` already has it right).

### Environment variables

See [`.env.example`](.env.example) for the full list. The only ones you can't leave at their defaults:

- `JWT_ACCESS_SECRET` — any random string for local dev
- `DATABASE_URL` — must match whatever `docker-compose.yml` is actually running

### Tests

```bash
pnpm --filter @investhub/server test
```

These run against the real dev database and make real calls to Yahoo Finance — no mocks. A concurrency test fires two genuinely simultaneous buy orders at the same balance and asserts exactly one succeeds.

## API reference

See [`docs/API.md`](docs/API.md) for every endpoint, request/response shapes, and error codes.

## Design notes worth knowing

- **Money at rest is `NUMERIC`, never `FLOAT`** — the original coursework schema stored balances as floats, which drift under repeated arithmetic. Fixed in the rewrite.
- **The stock catalog is a growing cache, not a fixed list** — there's no "browse every NSE stock" endpoint; `stocks` starts seeded with the Nifty 50 and grows automatically the first time any user looks up a symbol Yahoo Finance recognizes.
- **Trade execution uses atomic conditional `UPDATE`s**, not `SELECT ... FOR UPDATE` followed by a separate write — a plain `UPDATE` already takes the row lock it needs; the guard and the write happen in one statement, with no gap between "check" and "act" for a concurrent request to race into.
- **Refresh tokens rotate** on every use and are stored hashed (never in plaintext) — logout and stolen-token detection have an actual mechanism behind them, not just an expiry timer.
