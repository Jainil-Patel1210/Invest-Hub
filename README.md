# InvestHub — Stock Market Management System

> A comprehensive **Database Management System (DBMS)** for managing stock market data — covering stocks, investors, brokers, analysts, IPOs, mutual funds, and institutional investments.

---

## Repository Structure

```
Invest-Hub/
├── INVESTHUB_DDL_Script.sql   # Schema creation (tables, constraints, keys)
├── INVESTHUB_Data.sql         # Sample data population scripts
├── INVESTHUB_Queries.pdf      # Collection of analytical SQL queries
├── ER_Diagram.png             # Entity-Relationship diagram
├── Relational_Diagram.png     # Relational (schema) diagram
├── FDs.pdf                    # Functional Dependencies documentation
└── INVESTHUB.pdf              # Full project report
```

---

## Database Overview

- **Database**: PostgreSQL
- **Schema Name**: `INVESTHUB`
- **Total Tables**: 25

---

## Schema / Entity Design

### User Management

| Table | Description |
|-------|-------------|
| `User_Info` | Core personal details — Email (PK), PAN No., name, country |
| `User` | Platform users with type: `Investor`, `Broker`, or `Analyst` |
| `Address` | Multi-valued addresses per user |
| `Phone_No` | Multi-valued phone numbers per user |

### Investor Types

| Table | Description |
|-------|-------------|
| `Investor` | Base investor — typed as `FII`, `DII`, or `Retail_Investor` |
| `Retail_Investor` | Individual investors with DOB and account balance |
| `FII` | Foreign Institutional Investors with sector focus and total investment |
| `DII` | Domestic Institutional Investors with category and sector focus |

### Brokers & Analysts

| Table | Description |
|-------|-------------|
| `Broker` | Licensed brokers with firm name, commission rate, and experience |
| `Analyst` | Registered analysts with license number and years of experience |
| `Follows` | Many-to-many: investors follow analysts |
| `Provides_Platform_To` | Brokers provide trading platform to investors |

### Company & Market Structure

| Table | Description |
|-------|-------------|
| `Sector` | Market sectors (e.g., IT, Banking) |
| `Industry` | Industries belonging to sectors |
| `Company` | Listed companies with financials: EPS, Net Revenue, Gross Profit |
| `News` | Sector-wise news articles with date and description |

### Stocks

| Table | Description |
|-------|-------------|
| `Stock_Info` | Stock symbol, name, and associated company |
| `Stock_Pricing` | Current price per stock per exchange (BSE/NSE) |
| `Trend` | Daily OHLC data, volume, PE ratio, market cap, 52-week high/low |
| `Dividend` | Dividend payments (Cash/Stock) with dates |
| `Block_Deals` | Large institutional block buy/sell deals |
| `Stock_Recommendation` | Analyst recommendations to followed investors |

### Portfolio & Watchlists

| Table | Description |
|-------|-------------|
| `Portfolio` | Stock holdings per investor-broker pair (qty held, avg buy price) |
| `Watchlist` | Named watchlists created by investors via a broker |
| `WL_Contains` | Stocks listed inside a watchlist |
| `Transaction` | Buy/Sell stock transactions with status and fees |

### Mutual Funds

| Table | Description |
|-------|-------------|
| `Mutual_Funds` | Fund details: type, NAV, AUM, expense ratio, risk level |
| `MF_Carries` | Stocks held within a mutual fund |
| `MF_Portfolio` | Mutual fund holdings per investor-broker pair |
| `MF_Transaction` | MF buy/sell/SIP transactions with status |

---

## ER Diagram

![ER Diagram](ER_Diagram.png)

---

## Relational Diagram

![Relational Diagram](Relational_Diagram.png)

---

## Setup Instructions

### Prerequisites

- [PostgreSQL](https://www.postgresql.org/download/) (v13 or later recommended)
- Any SQL client: [pgAdmin](https://www.pgadmin.org/), DBeaver, or `psql` CLI

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Invest-Hub.git
   cd Invest-Hub
   ```

2. **Create the schema and tables**
   ```sql
   -- Run in psql or pgAdmin
   \i INVESTHUB_DDL_Script.sql
   ```

3. **Populate with sample data**
   ```sql
   \i INVESTHUB_Data.sql
   ```

4. **Run queries**
   - Refer to `INVESTHUB_Queries.pdf` for a collection of analytical SQL queries.

---

## Sample Queries Supported

- Top performing stocks by market cap and PE ratio
- User portfolio summaries with current P&L
- IPO participation statistics and subscription rates
- Mutual fund holdings and returns
- FII/DII institutional investment trends by sector
- Analyst recommendation activity
- Dividend payout history per stock
- Block deal activity on NSE/BSE

---

## Key Design Decisions

- **Normalization**: All tables are normalized to reduce redundancy and maintain data integrity.
- **Composite Primary Keys**: Used extensively for junction tables (e.g., `Portfolio`, `Transaction`, `Watchlist`).
- **CHECK Constraints**: Enforced for enumerations like `Exchange` (`BSE`/`NSE`), `Transaction_Type` (`BUY`/`SELL`), `Status`, `Risk_Level`, etc.
- **Cascading Rules**: `ON DELETE CASCADE` and `ON UPDATE CASCADE` are applied where child records should follow parent record changes.
- **Multivalued Attributes**: `Address` and `Phone_No` are stored in separate tables to maintain 1NF.

---

## Documents

| File | Description |
|------|-------------|
| [INVESTHUB.pdf](INVESTHUB.pdf) | Full project report with design rationale |
| [INVESTHUB_Queries.pdf](INVESTHUB_Queries.pdf) | SQL queries with output screenshots |
| [FDs.pdf](FDs.pdf) | Functional Dependencies for all tables |

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## License

This project is for academic/educational purposes.
