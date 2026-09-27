# InvestHub API reference

Base URL: `http://localhost:4000/api` in development.

## Conventions

**Auth**: every route except `/auth/register`, `/auth/login`, and `/auth/refresh` requires `Authorization: Bearer <accessToken>`. The access token comes from a successful login/register/refresh call and is short-lived (15 minutes) — the frontend re-authenticates transparently via `/auth/refresh` using an httpOnly cookie, not something you'd normally call by hand.

**Errors**: every non-2xx response has the shape

```json
{ "error": { "code": "SOME_CODE", "message": "Human-readable message", "details": {} } }
```

`details` is only present for `VALIDATION_ERROR` and holds zod's per-field messages: `{ "fieldErrors": { "email": ["Invalid email address"] } }`.

| Code                    | Status | Meaning                                                                                        |
| ----------------------- | ------ | ---------------------------------------------------------------------------------------------- |
| `VALIDATION_ERROR`      | 400    | Request body/query failed schema validation                                                    |
| `UNAUTHORIZED`          | 401    | No (or malformed) `Authorization` header                                                       |
| `INVALID_CREDENTIALS`   | 401    | Login failed — deliberately identical whether the email doesn't exist or the password is wrong |
| `INVALID_TOKEN`         | 401    | Access token expired/invalid, or a refresh token that's expired/already used                   |
| `NOT_FOUND`             | 404    | The specific resource (a holding, a watchlist) doesn't exist, or exists but isn't yours        |
| `SYMBOL_NOT_FOUND`      | 404    | No such stock according to the market data provider                                            |
| `EMAIL_TAKEN`           | 409    | Registration with an email already in use                                                      |
| `WATCHLIST_NAME_TAKEN`  | 409    | You already have a watchlist with that name                                                    |
| `INSUFFICIENT_FUNDS`    | 422    | A buy would exceed your account balance                                                        |
| `INSUFFICIENT_HOLDINGS` | 422    | A sell exceeds (or you don't hold) that quantity                                               |
| `INTERNAL_ERROR`        | 500    | Unexpected server error                                                                        |

---

## Auth

### `POST /auth/register`

```json
{ "email": "you@example.com", "password": "at-least-8-chars", "fullName": "Your Name" }
```

→ `201` `{ "user": { "id": 1, "email": "...", "fullName": "..." }, "accessToken": "..." }`, plus a `refreshToken` httpOnly cookie. New accounts start with a virtual ₹10,00,000 balance.

### `POST /auth/login`

```json
{ "email": "you@example.com", "password": "..." }
```

→ `200` same shape as register.

### `POST /auth/refresh`

No body — reads the refresh cookie. → `200` `{ "accessToken": "..." }`, and rotates the cookie to a new refresh token (the old one stops working immediately).

### `POST /auth/logout`

No body. Invalidates the current refresh token and clears the cookie. → `204`.

### `GET /auth/me`

→ `200` `{ "id": 1, "email": "...", "fullName": "...", "accountBalance": 1000000, "createdAt": "..." }`

---

## Stocks

Public — no auth required.

### `GET /stocks?limit=60`

The tracked catalog (the seeded Nifty 50, growing as symbols are opened), biggest companies first, each with a live quote from one bulk price call.
→ `200` `{ "stocks": [{ "symbol", "exchange", "companyName", "sector", "quote": Quote | null }] }` — `quote` is `null` if market data is unavailable; the catalog itself still returns.

### `GET /stocks/search?q=<query>`

Local-first: prefix match on symbol and substring match on company name against the catalog (so `tc` finds `TCS.NS`), with Yahoo Finance filling in only when there are fewer than 5 local hits. `%` and `_` in the query are literal characters, not wildcards.
→ `200` `{ "results": [{ "symbol": "TCS.NS", "companyName": "...", "exchange": "NSE" }] }`

### `GET /stocks/:symbol`

Fundamentals, fetched live and cached (24h TTL) — the first lookup of a never-seen symbol also inserts it into the tracked catalog.
→ `200` `{ "symbol", "exchange", "companyName", "sector", "industry", "currency", "marketCap", "peRatio", "eps", "week52High", "week52Low" }`

### `GET /stocks/:symbol/quote`

Live price (60s cache TTL).
→ `200` `{ "symbol", "price", "prevClose", "dayChange", "dayChangePct", "dayHigh", "dayLow", "volume" }`

### `GET /stocks/:symbol/history?range=1M|3M|6M|1Y|5Y|ALL`

Default range `3M`. Backed by an incremental cache — only the date range not already stored gets fetched from the provider.
→ `200` `{ "range", "from", "to", "candles": [{ "date", "open", "high", "low", "close", "volume" }] }`

---

## Market

### `GET /market/indices`

Public. Live NIFTY 50 and SENSEX levels for the header ticker.
→ `200` `{ "indices": [{ "symbol": "^NSEI", "name": "NIFTY 50", "quote": Quote | null }, ...] }`

### `GET /market/movers?limit=5` — requires auth

Gainers/losers among stocks **you** hold or watch — not a market-wide index (the stock catalog is a growing cache of what's been looked up, not a fixed universe).
→ `200` `{ "gainers": [Quote], "losers": [Quote] }`

---

## Portfolio — all require auth

### `GET /portfolio`

→ `200` `{ "holdings": [{ "symbol", "companyName", "sector", "quantity", "avgBuyPrice", "investedValue", "currentPrice", "currentValue", "pnl", "pnlPct", "dayChange" }] }`

Price-derived fields are `null` (not a guessed value) if a live quote couldn't be fetched for that one holding.

### `GET /portfolio/summary`

→ `200`
```json
{
  "investedValue": 0, "currentValue": 0,
  "totalPnl": 0, "totalPnlPct": 0,
  "realizedPnl": 0, "feesPaid": 0,
  "xirrPct": null,
  "bestPerformer": { "symbol": "TCS.NS", "pnlPct": 0 },
  "worstPerformer": { "symbol": "INFY.NS", "pnlPct": 0 },
  "dayPnl": 0,
  "sectorAllocation": [{ "sector", "value", "percentage" }]
}
```

- `totalPnl` is **unrealized** (current holdings vs cost). `realizedPnl` is profit booked by past sells using weighted-average cost, **before** charges; `feesPaid` reports all charges separately.
- `xirrPct` is the annualized money-weighted return over every trade plus today's holdings value, or `null` when the trade history spans under 30 days (an annualized figure would be meaningless).
- `bestPerformer` / `worstPerformer` are `null` when no holding has a live price.

### `GET /portfolio/performance?range=1M|3M|6M|1Y|ALL`

Net worth (cash + holdings at each day's close) over time, with NIFTY 50 rebased to the same starting value. Rebuilt from trade history and daily closes — no snapshots are stored, so back-dated trades are reflected. The series always ends at today's date, carrying the last close forward on weekends and holidays.
→ `200` `{ "range", "series": [{ "date", "netWorth", "benchmark": number | null }], "changePct": number | null, "benchmarkChangePct": number | null }` — empty `series` for a user with no trades.

### `GET /portfolio/analytics?range=1M|3M|6M|1Y|ALL`

Risk and trade-quality statistics, built from the same daily net-worth curve `/portfolio/performance` computes.
→ `200`
```json
{
  "range": "3M",
  "returnPct": -0.38, "benchmarkReturnPct": -3.79,
  "volatilityPct": 0.73, "maxDrawdownPct": -0.41,
  "beta": 0.02, "sharpeRatio": -2.47,
  "tradeStats": { "totalClosedTrades": 1, "winRatePct": 100, "profitFactor": null, "avgWin": 300, "avgLoss": null }
}
```

- `returnPct` / `benchmarkReturnPct`: plain (not annualized) return over the selected range — see `xirrPct` on `/portfolio/summary` for an annualized figure.
- `volatilityPct`: annualized standard deviation of daily returns. `maxDrawdownPct`: largest peak-to-trough decline within the range (always ≤ 0). `beta`: sensitivity to NIFTY 50 (1 = moves with it). `sharpeRatio`: annualized, assuming a 0% risk-free rate — this is a stated simplification, not a live rate.
- `tradeStats` covers every closed (sold) trade **ever made**, not just the selected range, so a quiet range doesn't misleadingly report empty stats. `profitFactor`/`avgLoss` are `null` rather than `Infinity` when there are no losing trades yet.
- Any field that isn't computable yet (too little history, no closed trades) is `null`, never a guessed value.

### `GET /portfolio/:symbol`

→ `200` `{ "holding": <same shape as one item above>, "transactions": [Transaction] }` · `404 NOT_FOUND` if you don't hold it.

---

## Watchlists — all require auth

### `GET /watchlists`

→ `200` `{ "watchlists": [{ "id", "name", "createdAt", "itemCount" }] }`

### `POST /watchlists`

```json
{ "name": "Tech Stocks" }
```

→ `201` the created watchlist · `409 WATCHLIST_NAME_TAKEN` on a duplicate name (per-user, not global).

### `GET /watchlists/:id`

→ `200` `{ "id", "name", "items": [{ "symbol", "companyName", "sector", "addedAt", "quote": Quote | null }] }`

### `PATCH /watchlists/:id`

```json
{ "name": "New Name" }
```

→ `200` the updated watchlist.

### `DELETE /watchlists/:id`

→ `204`. A second delete of the same id now returns `404` — the resource is genuinely gone (contrast with removing a stock below, which is idempotent).

### `POST /watchlists/:id/stocks`

```json
{ "symbol": "INFY.NS" }
```

Validates the symbol against the market data provider (growing the stock catalog if it's new) before adding. Adding an already-present stock is a no-op, not an error. → `201`.

### `DELETE /watchlists/:id/stocks/:symbol`

Always `204`, whether or not the stock was actually a member — removing a non-member is a no-op by design.

---

## Trade — all require auth

### `POST /trade/buy` / `POST /trade/sell`

```json
{ "symbol": "TCS.NS", "quantity": 10, "price": 3500.5, "executedAt": "2025-01-15T10:00:00Z" }
```

`price` and `executedAt` are both optional — omit `price` to trade at the current live quote; provide it (with `executedAt`) to log a trade that actually happened in the past at its real price. A flat fee (`TRADE_FEE`, default ₹20) is added on buy / subtracted on sell.

→ `201` `{ "transaction": { "id", "symbol", "type", "quantity", "price", "fee", "total", "executedAt" } }`
→ `422 INSUFFICIENT_FUNDS` (buy) / `422 INSUFFICIENT_HOLDINGS` (sell) — both leave the database completely unchanged; the whole trade runs in one atomic transaction.

Buying more of a stock you already hold updates your average cost basis to the quantity-weighted average of the old and new lots. Selling your entire remaining position closes it (the holding row is deleted, not left at zero).

---

## Transactions — requires auth

### `GET /transactions?symbol=&type=BUY|SELL&from=&to=&page=1`

All filters optional. `from`/`to` are ISO dates. Page size is fixed at 20.
→ `200` `{ "transactions": [Transaction], "page", "pageSize", "total" }`

### `GET /transactions/summary`

Same filters as the list (page is ignored). Totals over **all** matching trades, not just one page.
→ `200` `{ "count", "buyCount", "sellCount", "turnover", "feesPaid" }`

### `GET /transactions/export`

Same filters. A `text/csv` attachment (`Date,Symbol,Type,Quantity,Price,Fee,Total`), newest first, capped at 5,000 rows. Text fields beginning with `= + - @` are prefixed with `'` so spreadsheets don't execute them as formulas.

`Transaction` shape: `{ "id", "symbol", "type", "quantity", "price", "fee", "total", "executedAt" }`

---

## Health

### `GET /health`

No auth. Checks the database connection, not just that the process is alive.
→ `200 { "status": "ok", "database": "connected" }` or `503 { "status": "error", "database": "unreachable" }`.
