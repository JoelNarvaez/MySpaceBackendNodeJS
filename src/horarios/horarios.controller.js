const pool = require("../../config/db");
const { getConfig }      = require("../configuracion/configuracion.model");
const { findById: findServicio } = require("../servicios/servicios.model");
const { calcularDisponibilidad } = require("../../helpers/disponibilidad.helper");
const { getCitasDelDia } = require("./horarios.model");

/**
 * GET /api/horarios?fecha=YYYY-MM-DD&idServicio=:id
 * Público — devuelve los slots del día con disponible: true/false.
 */
exports.getHorarios = async (req, res, next) => {
  try {
    const { fecha, idServicio } = req.query;

    // ── Validar parámetros ────────────────────────────────────────────────────
    if (!fecha || !idServicio) {
      return res.status(400).json({
        success: false,
        message: "Se requieren los query params 'fecha' (YYYY-MM-DD) e 'idServicio'.",
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return res.status(400).json({
        success: false,
        message: "El parámetro 'fecha' debe tener el formato YYYY-MM-DD.",
      });
    }

    const hoy = new Date().toISOString().split("T")[0];
    if (fecha < hoy) {
      return res.status(400).json({
        success: false,
        message: "No se puede consultar disponibilidad para fechas pasadas.",
      });
    }

    // ── Cargar servicio y configuración en paralelo ───────────────────────────
    const [servicio, config] = await Promise.all([
      findServicio(idServicio),
      getConfig(),
    ]);

    console.log("Config:", config)

    if (!servicio) {
      return res.status(404).json({ success: false, message: "Servicio no encontrado." });
    }

    // ── Validar que la fecha no supere el máximo de anticipación ─────────────
    const diasMax  = Number(config.dias_anticipacion_max || 30);
    const fechaMax = new Date();
    fechaMax.setDate(fechaMax.getDate() + diasMax);
    const fechaMaxStr = fechaMax.toISOString().split("T")[0];

    if (fecha > fechaMaxStr) {
      return res.status(400).json({
        success: false,
        message: `Solo se puede agendar con hasta ${diasMax} días de anticipación.`,
      });
    }

    // ── Obtener citas activas del día ─────────────────────────────────────────
    const citasDelDia = await getCitasDelDia(fecha);

    console.log("CITAS DEL DIA:", citasDelDia);

    // ── Calcular disponibilidad ───────────────────────────────────────────────
    const slots = await calcularDisponibilidad(fecha, servicio, config, citasDelDia);
    
    console.log("SLOTS:", slots);

    res.json({ success: true, data: slots });
  } catch (err) {
    next(err);
  }
};
