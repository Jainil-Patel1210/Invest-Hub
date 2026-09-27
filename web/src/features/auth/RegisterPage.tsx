import { useState, type FormEvent } from "react";
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
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 text-text-primary">
      <div className="w-full max-w-sm panel p-8">
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
            className="mt-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
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
