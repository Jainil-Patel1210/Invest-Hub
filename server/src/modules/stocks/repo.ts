import { pool } from "../../db/pool";

export interface CatalogRow {
  symbol: string;
  exchange: "NSE" | "BSE";
  companyName: string;
  sector: string | null;
}

/** The stocks table as a browsable catalog: biggest companies first. */
export async function listCatalog(limit: number): Promise<CatalogRow[]> {
  const { rows } = await pool.query<{
    symbol: string;
    exchange: "NSE" | "BSE";
    company_name: string;
    sector: string | null;
  }>(
    `SELECT symbol, exchange, company_name, sector
     FROM stocks
     ORDER BY market_cap DESC NULLS LAST, symbol
     LIMIT $1`,
    [limit],
  );

  return rows.map((r) => ({
    symbol: r.symbol,
    exchange: r.exchange,
    companyName: r.company_name,
    sector: r.sector,
  }));
}
