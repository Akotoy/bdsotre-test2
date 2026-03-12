import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables before any other imports that rely on them
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === "production";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // --- Security Headers ---
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disabled to allow Vite inline scripts in dev; enable in prod with proper config
    })
  );

  // --- CORS ---
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
    : ["http://localhost:3000", "http://localhost:5173"];

  app.use(
    cors({
      origin: isProduction ? allowedOrigins : "*",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      credentials: true,
    })
  );

  app.use(express.json());

  // --- API Routes ---
  const paymentRoutes = (await import("./src/server/routes/paymentRoutes.ts")).default;
  const deliveryRoutes = (await import("./src/server/routes/deliveryRoutes.ts")).default;
  const preorderRoutes = (await import("./src/server/routes/preorderRoutes.ts")).default;
  const sellerRoutes = (await import("./src/server/routes/sellerRoutes.ts")).default;
  app.use("/api", paymentRoutes);
  app.use("/api", deliveryRoutes);
  app.use("/api", preorderRoutes);
  app.use("/api", sellerRoutes);

  // --- Health check ---
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  if (!isProduction) {
    // Development: use Vite middleware (HMR)
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.error("Vite server failed to start:", e);
    }
  } else {
    // Production: serve built static files
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));

    // SPA fallback — CRITICAL: prevents 404 on page refresh for React Router routes
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT} [${isProduction ? "PRODUCTION" : "DEVELOPMENT"}]`);
  });
}

startServer();
