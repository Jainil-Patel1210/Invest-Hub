import express from "express";
import cors from "cors";
import { pool } from "./db/pool";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (err) {
    console.error("Health check: database unreachable", err);
    res.status(503).json({ status: "error", database: "unreachable" });
  }
});

export default app;
