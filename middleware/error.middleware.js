/**
 * Manejador de errores global de Express.
 * Captura cualquier error que llegue con next(err) desde los controladores.
 */
const errorHandler = (err, req, res, _next) => {
  // Errores de CORS (generados en server.js)
  if (err.message && err.message.startsWith("CORS:")) {
    return res.status(403).json({ success: false, message: err.message });
  }

  // Error de duplicado en MySQL (ej. UNIQUE constraint)
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      success: false,
      message: "Ya existe un registro con ese valor único (email, fecha/hora, etc.).",
    });
  }

  // Log del error real en consola (solo en desarrollo)
  if (process.env.NODE_ENV !== "production") {
    console.error(`[ERROR] ${req.method} ${req.url}`, err);
  } else {
    console.error(`[ERROR] ${req.method} ${req.url} →`, err.message);
  }

  res.status(500).json({
    success: false,
    message: "Error interno del servidor.",
  });
};

module.exports = { errorHandler };
