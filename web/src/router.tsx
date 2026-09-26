import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AccountPage } from "./features/account/AccountPage";
import { LoginPage } from "./features/auth/LoginPage";
import { RegisterPage } from "./features/auth/RegisterPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { PortfolioPage } from "./features/portfolio/PortfolioPage";
import { StocksPage } from "./features/stocks/StocksPage";
import { TransactionsPage } from "./features/transactions/TransactionsPage";
import { WatchlistPage } from "./features/watchlist/WatchlistPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ProtectedRoute and AppShell are both "layout routes" -- neither
          owns a path itself, they just wrap everything nested inside them
          via <Outlet />. Auth is checked once, here, rather than inside
          every individual page component. */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="watchlist" element={<WatchlistPage />} />
          <Route path="stocks" element={<StocksPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="account" element={<AccountPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
