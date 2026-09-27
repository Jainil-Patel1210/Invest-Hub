import { describe, expect, it } from "vitest";
import {
  annualizedVolatilityPct,
  beta,
  buildEquityCurve,
  dailyReturns,
  maxDrawdownPct,
  realizedPnl,
  sharpeRatio,
  stdev,
  sumFees,
  summarizeTradeOutcomes,
  tradeOutcomes,
  xirr,
  xirrFlows,
  type CloseLookup,
  type Trade,
} from "../src/lib/finance";

function trade(
  date: string,
  type: "BUY" | "SELL",
  quantity: number,
  price: number,
  symbol = "TCS.NS",
  fee = 20,
): Trade {
  const gross = quantity * price;
  return {
    date,
    symbol,
    type,
    quantity,
    price,
    fee,
    total: type === "BUY" ? gross + fee : gross - fee,
  };
}

describe("realizedPnl", () => {
  it("is zero with no sells", () => {
    expect(realizedPnl([trade("2025-01-01", "BUY", 10, 100)])).toBe(0);
  });

  it("realizes sell price minus weighted-average cost", () => {
    // 10 @ 100 then 10 @ 200 -> average cost 150. Selling 5 @ 250 realizes (250-150)*5.
    const pnl = realizedPnl([
      trade("2025-01-01", "BUY", 10, 100),
      trade("2025-01-02", "BUY", 10, 200),
      trade("2025-01-03", "SELL", 5, 250),
    ]);
    expect(pnl).toBe(500);
  });

  it("leaves the average cost unchanged after a sell", () => {
    const pnl = realizedPnl([
      trade("2025-01-01", "BUY", 10, 100),
      trade("2025-01-02", "SELL", 5, 120), // +100
      trade("2025-01-03", "SELL", 5, 90), // -50
    ]);
    expect(pnl).toBe(50);
  });

  it("tracks each symbol separately", () => {
    const pnl = realizedPnl([
      trade("2025-01-01", "BUY", 10, 100, "AAA.NS"),
      trade("2025-01-01", "BUY", 10, 500, "BBB.NS"),
      trade("2025-01-02", "SELL", 10, 110, "AAA.NS"), // +100
      trade("2025-01-02", "SELL", 10, 450, "BBB.NS"), // -500
    ]);
    expect(pnl).toBe(-400);
  });

  it("clamps a back-dated sell that precedes its buy instead of going negative", () => {
    const pnl = realizedPnl([
      trade("2025-01-05", "SELL", 5, 120), // dated before the buy that funds it
      trade("2025-01-10", "BUY", 5, 100),
    ]);
    expect(pnl).toBe(0);
  });
});

describe("sumFees", () => {
  it("adds every trade's fee", () => {
    expect(sumFees([trade("2025-01-01", "BUY", 1, 10), trade("2025-01-02", "SELL", 1, 10)])).toBe(
      40,
    );
  });
});

describe("xirr", () => {
  it("matches a known single-period return", () => {
    // 1000 in, 1100 out exactly one year later -> 10%.
    const rate = xirr([
      { date: "2024-01-01", amount: -1000 },
      { date: "2024-12-31", amount: 1100 },
    ]);
    // 365 days between these dates in a leap year -> ~1 year; allow small drift.
    expect(rate).not.toBeNull();
    expect(rate!).toBeCloseTo(0.1, 2);
  });

  it("gives a negative rate for a loss", () => {
    const rate = xirr([
      { date: "2024-01-01", amount: -1000 },
      { date: "2025-01-01", amount: 900 },
    ]);
    expect(rate!).toBeLessThan(0);
    expect(rate!).toBeCloseTo(-0.1, 2);
  });

  it("weights later contributions less than earlier ones", () => {
    // Same total money in and out; only timing differs.
    const early = xirr([
      { date: "2024-01-01", amount: -1000 },
      { date: "2024-01-02", amount: -1000 },
      { date: "2025-01-01", amount: 2200 },
    ]);
    const late = xirr([
      { date: "2024-01-01", amount: -1000 },
      { date: "2024-12-01", amount: -1000 },
      { date: "2025-01-01", amount: 2200 },
    ]);
    // Money that was invested for less time must have earned a higher annual rate.
    expect(late!).toBeGreaterThan(early!);
  });

  it("refuses to annualize a holding period under 30 days", () => {
    expect(
      xirr([
        { date: "2025-01-01", amount: -1000 },
        { date: "2025-01-10", amount: 1100 },
      ]),
    ).toBeNull();
  });

  it("returns null without both money in and money out", () => {
    expect(xirr([{ date: "2024-01-01", amount: -1000 }])).toBeNull();
    expect(
      xirr([
        { date: "2024-01-01", amount: -1000 },
        { date: "2025-01-01", amount: -500 },
      ]),
    ).toBeNull();
  });
});

describe("xirrFlows", () => {
  it("turns trades into signed cash flows and adds the current value as a final inflow", () => {
    const flows = xirrFlows(
      [trade("2025-01-01", "BUY", 10, 100), trade("2025-02-01", "SELL", 2, 110)],
      900,
      "2025-06-01",
    );
    expect(flows).toEqual([
      { date: "2025-01-01", amount: -1020 },
      { date: "2025-02-01", amount: 200 },
      { date: "2025-06-01", amount: 900 },
    ]);
  });
});

describe("buildEquityCurve", () => {
  const closes: CloseLookup = new Map([
    [
      "TCS.NS",
      new Map([
        ["2025-01-01", 100],
        ["2025-01-02", 110],
        // 2025-01-03 (say, a holiday): no close -> previous close carries forward
        ["2025-01-04", 120],
      ]),
    ],
  ]);
  const dates = ["2025-01-01", "2025-01-02", "2025-01-03", "2025-01-04"];

  it("skips days before the first trade", () => {
    const curve = buildEquityCurve([trade("2025-01-02", "BUY", 10, 110)], 10_000, closes, dates);
    expect(curve.map((p) => p.date)).toEqual(["2025-01-02", "2025-01-03", "2025-01-04"]);
  });

  it("values net worth as cash plus holdings at each day's close", () => {
    const curve = buildEquityCurve([trade("2025-01-01", "BUY", 10, 100)], 10_000, closes, dates);
    // cash = 10000 - (1000 + 20 fee) = 8980
    expect(curve[0]).toEqual({ date: "2025-01-01", netWorth: 8980 + 1000 });
    expect(curve[1]).toEqual({ date: "2025-01-02", netWorth: 8980 + 1100 });
    // no close on the 3rd: carries the 110 forward
    expect(curve[2]).toEqual({ date: "2025-01-03", netWorth: 8980 + 1100 });
    expect(curve[3]).toEqual({ date: "2025-01-04", netWorth: 8980 + 1200 });
  });

  it("values a position opened on a non-trading day at the previous close", () => {
    // Bought on Sunday the 5th; the only closes are Friday the 3rd and earlier.
    const weekend: CloseLookup = new Map([["TCS.NS", new Map([["2025-01-03", 100]])]]);
    const curve = buildEquityCurve([trade("2025-01-05", "BUY", 10, 100)], 10_000, weekend, [
      "2025-01-03",
      "2025-01-05",
    ]);
    expect(curve).toEqual([{ date: "2025-01-05", netWorth: 10_000 - 1020 + 1000 }]);
  });

  it("returns cash-only value once a position is fully sold", () => {
    const curve = buildEquityCurve(
      [trade("2025-01-01", "BUY", 10, 100), trade("2025-01-02", "SELL", 10, 110)],
      10_000,
      closes,
      dates,
    );
    // cash = 10000 - 1020 + 1080 = 10060, nothing held
    expect(curve[1]!.netWorth).toBe(10_060);
    expect(curve[3]!.netWorth).toBe(10_060);
  });
});

describe("dailyReturns", () => {
  it("computes day-over-day fractional change", () => {
    expect(dailyReturns([100, 110, 99])).toEqual([0.1, -0.1]);
  });

  it("returns nothing for fewer than two values", () => {
    expect(dailyReturns([100])).toEqual([]);
  });
});

describe("stdev", () => {
  it("is null with fewer than two values", () => {
    expect(stdev([1])).toBeNull();
  });

  it("matches a hand-computed sample standard deviation", () => {
    // mean 5, squared deviations [4,1,0,1,4] sum 10, /3 = 3.333, sqrt ~1.8257
    expect(stdev([3, 4, 5, 6, 7])).toBeCloseTo(1.5811, 3);
  });
});

describe("annualizedVolatilityPct", () => {
  it("scales daily stdev by sqrt(252) and converts to percent", () => {
    const returns = [0.01, -0.01, 0.02, -0.02, 0.01];
    const vol = annualizedVolatilityPct(returns);
    expect(vol).toBeCloseTo(stdev(returns)! * Math.sqrt(252) * 100, 6);
  });

  it("is null with too little data", () => {
    expect(annualizedVolatilityPct([0.01])).toBeNull();
  });
});

describe("maxDrawdownPct", () => {
  it("is zero for a monotonically rising series", () => {
    expect(maxDrawdownPct([100, 110, 120])).toBe(0);
  });

  it("finds the largest peak-to-trough decline, not just the last drop", () => {
    // Peak 120 -> trough 90 is a steeper drop than the later 110 -> 100.
    const dd = maxDrawdownPct([100, 120, 90, 110, 100]);
    expect(dd).toBeCloseTo(((90 - 120) / 120) * 100, 6);
  });

  it("is null with fewer than two values", () => {
    expect(maxDrawdownPct([100])).toBeNull();
  });
});

describe("beta", () => {
  it("is 1 when the portfolio moves exactly like the benchmark", () => {
    const returns = [0.01, -0.02, 0.03, 0.0, -0.01];
    expect(beta(returns, returns)!).toBeCloseTo(1, 6);
  });

  it("is 2 when the portfolio moves twice as much as the benchmark", () => {
    const benchmarkReturns = [0.01, -0.02, 0.03, 0.0, -0.01];
    const portfolioReturns = benchmarkReturns.map((r) => r * 2);
    expect(beta(portfolioReturns, benchmarkReturns)!).toBeCloseTo(2, 6);
  });

  it("is null when the benchmark never moves", () => {
    expect(beta([0.01, 0.02, -0.01], [0, 0, 0])).toBeNull();
  });
});

describe("sharpeRatio", () => {
  it("is positive for a steadily positive return series", () => {
    expect(sharpeRatio([0.001, 0.002, 0.0015, 0.0018])!).toBeGreaterThan(0);
  });

  it("is null when volatility is zero", () => {
    expect(sharpeRatio([0.001, 0.001, 0.001])).toBeNull();
  });
});

describe("tradeOutcomes / summarizeTradeOutcomes", () => {
  it("produces one outcome per sell, using weighted-average cost", () => {
    const outcomes = tradeOutcomes([
      trade("2025-01-01", "BUY", 10, 100),
      trade("2025-01-02", "SELL", 5, 120),
      trade("2025-01-03", "SELL", 5, 90),
    ]);
    expect(outcomes).toEqual([
      { date: "2025-01-02", symbol: "TCS.NS", pnl: 100 },
      { date: "2025-01-03", symbol: "TCS.NS", pnl: -50 },
    ]);
  });

  it("summarizes win rate, profit factor, and average win/loss", () => {
    const stats = summarizeTradeOutcomes([
      { date: "d", symbol: "A", pnl: 100 },
      { date: "d", symbol: "A", pnl: 200 },
      { date: "d", symbol: "A", pnl: -50 },
    ]);
    expect(stats.totalClosedTrades).toBe(3);
    expect(stats.winRatePct).toBeCloseTo((2 / 3) * 100, 6);
    expect(stats.profitFactor).toBeCloseTo(300 / 50, 6);
    expect(stats.avgWin).toBe(150);
    expect(stats.avgLoss).toBe(50);
  });

  it("reports a null profit factor rather than Infinity when there are no losses", () => {
    const stats = summarizeTradeOutcomes([{ date: "d", symbol: "A", pnl: 100 }]);
    expect(stats.profitFactor).toBeNull();
  });

  it("returns all-null stats for no closed trades", () => {
    expect(summarizeTradeOutcomes([])).toEqual({
      totalClosedTrades: 0,
      winRatePct: null,
      profitFactor: null,
      avgWin: null,
      avgLoss: null,
    });
  });
});
