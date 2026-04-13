const { findAll, create, remove } = require("./bloqueos.model");

/**
 * GET /api/bloqueos
 * Admin — lista todos los bloqueos activos.
 */
exports.getBloqueos = async (req, res, next) => {
  try {
    const bloqueos = await findAll();
    res.json({ success: true, data: bloqueos });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/bloqueos
 * Admin — crea un nuevo bloqueo.
 * Body: { tipo, fecha?, dia_semana?, hora_inicio?, hora_fin?, motivo? }
 */
exports.createBloqueo = async (req, res, next) => {
  try {
    const { tipo, fecha, dia_semana, hora_inicio, hora_fin, motivo } = req.body;

    // Validaciones
    if (!tipo || !["dia", "horario"].includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: "El campo 'tipo' debe ser 'dia' o 'horario'.",
      });
    }

    if (tipo === "dia" && !fecha && dia_semana === undefined) {
      return res.status(400).json({
        success: false,
        message: "Para tipo 'dia' se requiere 'fecha' (YYYY-MM-DD) o 'dia_semana' (0-6).",
      });
    }

    if (tipo === "horario" && (!hora_inicio || !hora_fin)) {
      return res.status(400).json({
        success: false,
        message: "Para tipo 'horario' se requieren 'hora_inicio' y 'hora_fin' (HH:MM).",
      });
    }

    const id = await create({ tipo, fecha, dia_semana, hora_inicio, hora_fin, motivo });
    res.status(201).json({ success: true, message: "Bloqueo creado.", id });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/bloqueos/:id
 * Admin — desactiva un bloqueo (soft delete).
 */
exports.deleteBloqueo = async (req, res, next) => {
  try {
    const affected = await remove(req.params.id);

    if (!affected) {
      return res.status(404).json({ success: false, message: "Bloqueo no encontrado." });
    }

    res.json({ success: true, message: "Bloqueo eliminado." });
  } catch (err) {
    next(err);
  }
};
