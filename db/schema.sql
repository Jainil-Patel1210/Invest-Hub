-- InvestHub schema (v2 — portfolio management & analysis, real market data).
-- Run once against a fresh database. See server/src/db/migrate.ts for the runner.

-- Enables fuzzy/partial text search (used below for searching stocks by company name).
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    full_name       VARCHAR(100) NOT NULL,
    account_balance NUMERIC(14, 2) NOT NULL DEFAULT 1000000.00,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE stocks (
    symbol       VARCHAR(20) PRIMARY KEY,
    exchange     VARCHAR(10) NOT NULL CHECK (exchange IN ('NSE', 'BSE')),
    company_name VARCHAR(150) NOT NULL,
    sector       VARCHAR(100),
    industry     VARCHAR(100),
    currency     VARCHAR(10) NOT NULL DEFAULT 'INR',
    market_cap   NUMERIC(20, 2),
    pe_ratio     NUMERIC(8, 2),
    eps          NUMERIC(10, 2),
    week52_high  NUMERIC(14, 2),
    week52_low   NUMERIC(14, 2),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE quote_cache (
    symbol         VARCHAR(20) PRIMARY KEY REFERENCES stocks (symbol) ON DELETE CASCADE,
    price          NUMERIC(14, 2) NOT NULL,
    prev_close     NUMERIC(14, 2) NOT NULL,
    day_change     NUMERIC(14, 2) NOT NULL,
    day_change_pct NUMERIC(6, 2) NOT NULL,
    day_high       NUMERIC(14, 2),
    day_low        NUMERIC(14, 2),
    volume         BIGINT,
    fetched_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE price_history (
    symbol VARCHAR(20) REFERENCES stocks (symbol) ON DELETE CASCADE,
    date   DATE NOT NULL,
    open   NUMERIC(14, 2) NOT NULL,
    high   NUMERIC(14, 2) NOT NULL,
    low    NUMERIC(14, 2) NOT NULL,
    close  NUMERIC(14, 2) NOT NULL,
    volume BIGINT,
    PRIMARY KEY (symbol, date)
);

CREATE TABLE portfolio_holdings (
    user_id       INTEGER REFERENCES users (id) ON DELETE CASCADE,
    symbol        VARCHAR(20) REFERENCES stocks (symbol),
    quantity      INTEGER NOT NULL CHECK (quantity > 0),
    avg_buy_price NUMERIC(14, 2) NOT NULL,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, symbol)
);

CREATE TABLE watchlists (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name       VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, name)
);

CREATE TABLE watchlist_items (
    watchlist_id INTEGER REFERENCES watchlists (id) ON DELETE CASCADE,
    symbol       VARCHAR(20) REFERENCES stocks (symbol),
    added_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (watchlist_id, symbol)
);

-- One row per issued refresh token, so logout and token rotation have an
-- actual mechanism behind them instead of "trust the JWT until it expires".
-- token_hash, never the raw token: if this table were ever exposed (a DB
-- leak, a misconfigured backup), a hash can't be replayed as a real token
-- the way a stored plaintext one could.
CREATE TABLE refresh_tokens (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE transactions (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    symbol      VARCHAR(20) NOT NULL REFERENCES stocks (symbol),
    type        VARCHAR(4) NOT NULL CHECK (type IN ('BUY', 'SELL')),
    quantity    INTEGER NOT NULL CHECK (quantity > 0),
    price       NUMERIC(14, 2) NOT NULL,
    fee         NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total       NUMERIC(14, 2) NOT NULL,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_price_history_symbol_date ON price_history (symbol, date DESC);
CREATE INDEX idx_transactions_user_time ON transactions (user_id, executed_at DESC);
CREATE INDEX idx_watchlists_user ON watchlists (user_id);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens (user_id);
CREATE INDEX idx_stocks_company_name_trgm ON stocks USING GIN (company_name gin_trgm_ops);
