require("dotenv").config({ override: true });

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Rutas ────────────────────────────────────────────────────────────────────
const authRoutes       = require("./src/auth/auth.routes");
const serviciosRoutes  = require("./src/servicios/servicios.routes");
const citasRoutes      = require("./src/citas/citas.routes");
const horariosRoutes   = require("./src/horarios/horarios.routes");
const bloqueosRoutes   = require("./src/bloqueos/bloqueos.routes");
const { errorHandler } = require("./middleware/error.middleware");

// ── CORS ─────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "http://localhost:4200",   // Angular dev server
  "http://127.0.0.1:4200",
  "http://localhost:5500",   // Live Server (VS Code)
  "http://127.0.0.1:5501",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error("CORS: origen no permitido → " + origin));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
);

// ── Body parser ───────────────────────────────────────────────────────────────
app.use(express.json());

// ── Logger ────────────────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ── Rutas de la API ───────────────────────────────────────────────────────────
app.use("/api/auth",      authRoutes);
app.use("/api/servicios", serviciosRoutes);
app.use("/api/citas",     citasRoutes);
app.use("/api/horarios",  horariosRoutes);
app.use("/api/bloqueos",  bloqueosRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) =>
  res.json({ ok: true, timestamp: new Date().toISOString() })
);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) =>
  res.status(404).json({ success: false, message: "Ruta no encontrada." })
);

// ── Error handler global ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── Iniciar servidor ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
