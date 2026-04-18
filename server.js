require("dotenv").config({ override: true });

const express = require("express");
const cors = require("cors");

const db = require("./config/db");
const authRoutes = require("./src/auth/auth.routes");
const serviciosRoutes = require("./src/servicios/servicios.routes");
const citasRoutes = require("./src/citas/citas.routes");
const horariosRoutes = require("./src/horarios/horarios.routes");
const bloqueosRoutes = require("./src/bloqueos/bloqueos.routes");
const { errorHandler } = require("./middleware/error.middleware");

const app = express();
const PORT = process.env.PORT || 3000;

const ALLOWED_ORIGINS = [
  "http://localhost:4200",
  "http://127.0.0.1:4200",
  "http://localhost:5500",
  "http://127.0.0.1:5501",
  "https://my-space-frontend-angulart.vercel.app",
  "http://my-space-frontend-angulart.vercel.app",
];

const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/my-space-frontend-angulart-[a-z0-9-]+-joels-projects-3a752f3d\.vercel\.app$/,
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const isAllowed =
      ALLOWED_ORIGINS.includes(origin) ||
      ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));

    if (isAllowed) {
      return callback(null, true);
    }

    return callback(new Error("CORS: origen no permitido -> " + origin));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.get("/test-db", async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS test");
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/servicios", serviciosRoutes);
app.use("/api/citas", citasRoutes);
app.use("/api/horarios", horariosRoutes);
app.use("/api/bloqueos", bloqueosRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Ruta no encontrada." });
});

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);

  try {
    const [rows] = await db.query("SELECT 1");
    console.log("Conectado a MySQL:", rows);
  } catch (error) {
    console.error("Error DB:", error.message);
  }
});
