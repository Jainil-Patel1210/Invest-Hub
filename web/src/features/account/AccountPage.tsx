import { Link } from "react-router-dom";
import { formatINR } from "../../lib/format";
import { useAuth } from "../../lib/useAuth";

export function AccountPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold">Account</h1>
      <div className="max-w-sm rounded-lg border border-border bg-surface p-5">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
          <dt className="text-text-secondary">Name</dt>
          <dd>{user.fullName}</dd>
          <dt className="text-text-secondary">Email</dt>
          <dd>{user.email}</dd>
          <dt className="text-text-secondary">Cash balance</dt>
          <dd className="tabular-nums">{formatINR(user.accountBalance, 0)}</dd>
          <dt className="text-text-secondary">Member since</dt>
          <dd>
            {new Date(user.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </dd>
        </dl>
      </div>

      <p className="mt-4 text-sm text-text-secondary">
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
