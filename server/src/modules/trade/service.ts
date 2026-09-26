import { withTransaction } from "../../db/withTransaction";
import { Errors } from "../../lib/errors";
import { pricingProvider } from "../../lib/pricing";
import { mapTransaction, type TransactionView } from "../transactions/types";
import * as repo from "./repo";
import type { TradeInput } from "./schema";

const TRADE_FEE = Number(process.env.TRADE_FEE ?? 20);

async function resolvePrice(symbol: string, provided: number | undefined): Promise<number> {
  if (provided !== undefined) return provided;
  const quote = await pricingProvider.getQuote(symbol);
  return quote.price;
}

export async function buy(userId: number, input: TradeInput): Promise<TransactionView> {
  // Symbol validation and price resolution both potentially make a real
  // external call (or at best a cache read) -- deliberately done *before*
  // opening the DB transaction below, so no Postgres row lock is ever held
  // across a slow network round trip. Holding a lock longer than strictly
  // necessary blocks every other operation touching the same rows for no
  // reason -- a classic way to turn one slow request into many slow requests.
  await pricingProvider.getFundamentals(input.symbol);
  const price = await resolvePrice(input.symbol, input.price);
  const fee = TRADE_FEE;
  const total = input.quantity * price + fee;
  const executedAt = input.executedAt ?? new Date();

  const transaction = await withTransaction(async (client) => {
    const debited = await repo.debitBalanceIfSufficient(client, userId, total);
    if (!debited) {
      throw Errors.insufficientFunds();
    }

    const inserted = await repo.insertTransaction(client, {
      userId,
      symbol: input.symbol,
      type: "BUY",
      quantity: input.quantity,
      price,
      fee,
      total,
      executedAt,
    });
    await repo.upsertHoldingOnBuy(client, userId, input.symbol, input.quantity, price);

    return inserted;
  });

  return mapTransaction(transaction);
}

export async function sell(userId: number, input: TradeInput): Promise<TransactionView> {
  await pricingProvider.getFundamentals(input.symbol);
  const price = await resolvePrice(input.symbol, input.price);
  const fee = TRADE_FEE;
  const total = input.quantity * price - fee;
  const executedAt = input.executedAt ?? new Date();

  const transaction = await withTransaction(async (client) => {
    const sold = await repo.sellFromHolding(client, userId, input.symbol, input.quantity);
    if (!sold) {
      throw Errors.insufficientHoldings();
    }

    const inserted = await repo.insertTransaction(client, {
      userId,
      symbol: input.symbol,
      type: "SELL",
      quantity: input.quantity,
      price,
      fee,
      total,
      executedAt,
    });
    await repo.creditBalance(client, userId, total);

    return inserted;
  });

  return mapTransaction(transaction);
}
