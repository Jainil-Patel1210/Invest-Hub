import { useParams } from "react-router-dom";
import { ApiError } from "../../api/client";
import { useStock, useStockQuote } from "../../api/hooks/stocks";
import { Delta } from "../../components/Delta";
import { formatINR } from "../../lib/format";
import { FundamentalsPanel } from "./components/FundamentalsPanel";
import { PriceChart } from "./components/PriceChart";
import { TradePanel } from "./components/TradePanel";
import { WatchlistButton } from "./components/WatchlistButton";
import { SkeletonList } from "../../components/Skeleton";

export function StockDetailPage() {
  const { symbol } = useParams<{ symbol: string }>();
  const stockQuery = useStock(symbol ?? "");
  const quoteQuery = useStockQuote(symbol ?? "");

  if (!symbol) return null;

  if (stockQuery.isLoading) {
    return <SkeletonList rows={5} />;
  }

  if (stockQuery.isError) {
    const notFound =
      stockQuery.error instanceof ApiError && stockQuery.error.code === "SYMBOL_NOT_FOUND";
    return (
      <p className="text-sm text-text-secondary">
        {notFound ? `No stock found for "${symbol}".` : "Something went wrong loading this stock."}
      </p>
    );
  }

  const stock = stockQuery.data!;
  const quote = quoteQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{stock.companyName}</h1>
            <span className="rounded bg-surface-raised px-2 py-0.5 text-xs text-text-secondary">
              {stock.exchange}
            </span>
          </div>
          <p className="text-sm text-text-secondary">{stock.symbol}</p>

          <div className="mt-3 flex items-baseline gap-3">
            {quote ? (
              <>
                <span className="text-3xl font-semibold tracking-tight tabular-nums text-text-primary">
                  {formatINR(quote.price)}
                </span>
                <Delta value={quote.dayChange} kind="currency" showGlyph />
                <Delta value={quote.dayChangePct} kind="percent" />
              </>
            ) : (
              <span className="text-sm text-text-secondary">Loading price...</span>
            )}
          </div>
        </div>

        <WatchlistButton symbol={symbol} />
      </div>

      <div className="panel p-5">
        <PriceChart symbol={symbol} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FundamentalsPanel stock={stock} />
        <TradePanel symbol={symbol} />
      </div>
    </div>
  );
}
