import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { pool } from "./db/pool";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./modules/auth/routes";
import marketRoutes from "./modules/market/routes";
import portfolioRoutes from "./modules/portfolio/routes";
import stocksRoutes from "./modules/stocks/routes";
import watchlistRoutes from "./modules/watchlist/routes";

const app = express();

app.use(
  cors({
    // A cookie-based refresh token only crosses origins if the server
    // explicitly allows it. Browsers refuse this combination outright with
    // a wildcard "*" origin -- credentials require one specific, named origin.
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (err) {
    console.error("Health check: database unreachable", err);
    res.status(503).json({ status: "error", database: "unreachable" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/stocks", stocksRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/watchlists", watchlistRoutes);

// Must be registered after every route -- see errorHandler.ts for why.
app.use(errorHandler);

export default app;
