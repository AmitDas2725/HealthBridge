import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";

const app = express();
const configuredOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((url) => url.trim());
app.use(cors({
  origin(origin, callback) {
    if (!origin || configuredOrigins.includes(origin) || /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error("This origin is not allowed by the API."));
  }
}));
app.use(express.json({ limit: "1mb" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.code === "ECONNREFUSED" || error.code === "ER_ACCESS_DENIED_ERROR" || error.code === "ER_BAD_DB_ERROR") {
    return res.status(503).json({ message: "Database is unavailable. Start MySQL and check the project .env settings." });
  }
  return res.status(500).json({ message: "The server could not complete this request." });
});

export default app;
