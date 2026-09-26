import { useAuth } from "../../lib/useAuth";

export function AccountPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold">Account</h1>
      {user && (
        <dl className="grid max-w-sm grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-text-secondary">Name</dt>
          <dd>{user.fullName}</dd>
          <dt className="text-text-secondary">Email</dt>
          <dd>{user.email}</dd>
          <dt className="text-text-secondary">Balance</dt>
          <dd className="tabular-nums">₹{user.accountBalance.toLocaleString("en-IN")}</dd>
        </dl>
      )}
    </div>
  );
}
