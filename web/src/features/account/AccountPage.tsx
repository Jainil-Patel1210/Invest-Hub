import { Link } from "react-router-dom";
import { formatINR } from "../../lib/format";
import { useAuth } from "../../lib/useAuth";

const TRADE_FEE = 20; // matches the backend's TRADE_FEE default, same constant TradePanel shows

export function AccountPage() {
  const { user } = useAuth();

  if (!user) return null;

  const initial = (user.fullName || user.email).charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="text-xs font-medium uppercase tracking-wider text-text-secondary">
          Profile
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="panel p-5">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-muted text-lg font-semibold text-accent-strong">
              {initial}
            </span>
            <div>
              <div className="font-medium text-text-primary">{user.fullName}</div>
              <div className="text-sm text-text-secondary">{user.email}</div>
            </div>
            <span className="ml-auto rounded-full bg-gain-muted px-2.5 py-1 text-xs font-medium text-gain">
              Paper trading
            </span>
          </div>

          <dl className="mt-4 flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-text-secondary">Cash balance</dt>
              <dd className="tabular-nums font-medium">{formatINR(user.accountBalance, 0)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-text-secondary">Member since</dt>
              <dd>
                {new Date(user.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </dd>
            </div>
          </dl>
        </div>

        <div className="panel p-5">
          <h2 className="text-base font-semibold">How trading works here</h2>
          <p className="mt-1 text-sm text-text-secondary">
            InvestHub is a paper-trading tracker: every trade is simulated against real market
            prices, and no real money ever moves.
          </p>
          <dl className="mt-4 flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-text-secondary">Flat fee per trade</dt>
              <dd className="tabular-nums font-medium">{formatINR(TRADE_FEE, 2)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-text-secondary">Market data source</dt>
              <dd>Yahoo Finance</dd>
            </div>
          </dl>
        </div>
      </div>

      <p className="text-sm text-text-secondary">
        Looking for your holdings or trade history?{" "}
        <Link to="/portfolio" className="text-accent hover:underline">
          Portfolio
        </Link>{" "}
        ·{" "}
        <Link to="/transactions" className="text-accent hover:underline">
          Transactions
        </Link>
      </p>
    </div>
  );
}
