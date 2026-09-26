import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../lib/useAuth";

/**
 * A layout route with no path of its own -- everything nested under it in
 * router.tsx renders through the <Outlet /> below, only once this component
 * decides the user is actually allowed to see it. This is the idiomatic
 * React Router way to guard many routes at once without wrapping every
 * individual page component by hand.
 */
export function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg text-text-secondary">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
