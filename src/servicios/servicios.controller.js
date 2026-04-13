const { findAll, findById } = require("./servicios.model");

/**
 * GET /api/servicios
 * Público — lista todos los servicios activos.
 */
exports.getServicios = async (req, res, next) => {
  try {
    const servicios = await findAll();
    res.json({ success: true, data: servicios });
    console.log("Servicios listados correctamente.", servicios);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/servicios/:id
 * Público — devuelve el detalle de un servicio.
 */
exports.getServicio = async (req, res, next) => {
  try {
    const servicio = await findById(req.params.id);

    if (!servicio) {
      return res.status(404).json({ success: false, message: "Servicio no encontrado." });
    }

    res.json({ success: true, data: servicio });
  } catch (err) {
    next(err);
  }
};
