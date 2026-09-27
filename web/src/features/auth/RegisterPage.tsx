import { useState, type FormEvent } from "react";
import { TrendingUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "../../api/client";
import { useAuth } from "../../lib/useAuth";

interface FieldErrors {
  email?: string[];
  password?: string[];
  fullName?: string[];
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      await register({ email, password, fullName });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.code === "VALIDATION_ERROR") {
        // The backend's zod validation returns structured per-field
        // messages (details.fieldErrors) via z.flattenError -- surfacing
        // those directly is a much better experience than one generic
        // "validation failed" line under the whole form.
        const details = err.details as { fieldErrors?: FieldErrors } | undefined;
        setFieldErrors(details?.fieldErrors ?? {});
      } else {
        setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-4 text-text-primary">
      {/* Ambient glow, purely decorative -- aria-hidden and never the sole
          carrier of any information. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-accent/10 blur-3xl"
      />
      <div className="relative w-full max-w-sm panel p-8">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-muted text-accent">
            <TrendingUp size={20} strokeWidth={2.25} aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight">InvestHub</span>
        </div>

        <h1 className="mb-1 text-xl font-semibold">Create your account</h1>
        <p className="mb-6 text-sm text-text-secondary">
          Starts you with a virtual ₹10,00,000 to track a portfolio with.
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            Full name
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="rounded-md border border-border bg-bg px-3 py-2 text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent-muted"
            />
            {fieldErrors.fullName && (
              <span className="text-xs text-loss">{fieldErrors.fullName[0]}</span>
            )}
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-border bg-bg px-3 py-2 text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent-muted"
            />
            {fieldErrors.email && <span className="text-xs text-loss">{fieldErrors.email[0]}</span>}
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border border-border bg-bg px-3 py-2 text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent-muted"
            />
            {fieldErrors.password && (
              <span className="text-xs text-loss">{fieldErrors.password[0]}</span>
            )}
          </label>

          {error && (
            <p className="rounded-md bg-loss-muted px-3 py-2 text-sm text-loss" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 btn-primary px-3 py-2 text-sm"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <Link to="/login" className="text-accent hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
