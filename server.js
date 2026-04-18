require("dotenv").config({ override: true });

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// ── DB ─────────────────────────────────────────────────────────
const db = require("./config/db");

// ── Rutas ──────────────────────────────────────────────────────
const authRoutes       = require("./src/auth/auth.routes");
const serviciosRoutes  = require("./src/servicios/servicios.routes");
const citasRoutes      = require("./src/citas/citas.routes");
const horariosRoutes   = require("./src/horarios/horarios.routes");
const bloqueosRoutes   = require("./src/bloqueos/bloqueos.routes");
const { errorHandler } = require("./middleware/error.middleware");

// ── CORS (con tu frontend de Vercel) ────────────────────────────
const ALLOWED_ORIGINS = [
  "http://localhost:4200",
  "http://127.0.0.1:4200",
  "http://localhost:5500",
  "http://127.0.0.1:5501",
  "https://my-space-frontend-angulart-lsa7wzneo-joels-projects-3a752f3d.vercel.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS: origen no permitido → " + origin));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
);

// ── Body parser ─────────────────────────────────────────────────
app.use(express.json());

// ── Logger ──────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ── Health check ────────────────────────────────────────────────
app.get("/health", (_req, res) =>
  res.json({ ok: true, timestamp: new Date().toISOString() })
);

// ── Test DB ─────────────────────────────────────────────────────
app.get("/test-db", async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS test");
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Rutas API ───────────────────────────────────────────────────
app.use("/api/auth",      authRoutes);
app.use("/api/servicios", serviciosRoutes);
app.use("/api/citas",     citasRoutes);
app.use("/api/horarios",  horariosRoutes);
app.use("/api/bloqueos",  bloqueosRoutes);

// ── 404 ─────────────────────────────────────────────────────────
app.use((_req, res) =>
  res.status(404).json({ success: false, message: "Ruta no encontrada." })
);

// ── Error handler ───────────────────────────────────────────────
app.use(errorHandler);

// ── Start server ────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);

  try {
    const [rows] = await db.query("SELECT 1");
    console.log("Conectado a MySQL:", rows);
  } catch (error) {
    console.error("Error DB:", error.message);
  }
});
