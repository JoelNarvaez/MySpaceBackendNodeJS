const { findAll, findByEmail, findById, findByFechaHora, create, cancel } = require("./citas.model");
const { findById: findServicio } = require("../servicios/servicios.model");

/**
 * GET /api/citas
 * Admin — devuelve todas las citas con nombre_servicio.
 */
exports.getCitas = async (req, res, next) => {
  try {
    const citas = await findAll();
    res.json({ success: true, data: citas });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/citas/usuario/:email
 * Usuario autenticado — devuelve sus propias citas.
 * El usuario solo puede ver las citas de su propio email (a menos que sea admin).
 */
exports.getCitasByEmail = async (req, res, next) => {
  try {
    const { email } = req.params;

    if (req.user.email !== email && req.user.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para ver estas citas.",
      });
    }

    const citas = await findByEmail(email);
    res.json({ success: true, data: citas });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/citas
 * Usuario autenticado — agenda una nueva cita.
 * Body: { nombre_cliente, email, telefono?, id_servicio, fecha, hora }
 */
exports.createCita = async (req, res, next) => {
  try {
    const { nombre_cliente, email, telefono, id_servicio, fecha, hora } = req.body;

    if (!nombre_cliente || !email || !id_servicio || !fecha || !hora) {
      return res.status(400).json({
        success: false,
        message: "Campos requeridos: nombre_cliente, email, id_servicio, fecha, hora.",
      });
    }

    // Verificar que el servicio existe y está activo
    const servicio = await findServicio(id_servicio);
    if (!servicio) {
      return res.status(404).json({ success: false, message: "Servicio no encontrado." });
    }

    // Verificar que el slot no esté ya ocupado
    const ocupado = await findByFechaHora(fecha, hora);
    if (ocupado) {
      return res.status(409).json({
        success: false,
        message: "El horario seleccionado ya no está disponible.",
      });
    }

    const id = await create({
      id_usuario:     req.user.id,
      id_servicio,
      nombre_cliente,
      email,
      telefono,
      fecha,
      hora,
      precio_cobrado: servicio.precio,
    });

    res.status(201).json({ success: true, mensaje: "Cita agendada exitosamente.", id });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/citas/:id
 * Usuario autenticado — cancela su propia cita.
 * El admin puede cancelar cualquier cita.
 * Body (opcional): { motivo }
 */
exports.cancelCita = async (req, res, next) => {
  try {
    const cita = await findById(req.params.id);

    if (!cita) {
      return res.status(404).json({ success: false, message: "Cita no encontrada." });
    }

    // Solo el dueño de la cita o un admin puede cancelarla
    if (cita.email !== req.user.email && req.user.rol !== "admin") {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para cancelar esta cita.",
      });
    }

    if (cita.estado === "cancelada") {
      return res.status(409).json({ success: false, message: "La cita ya fue cancelada." });
    }

    await cancel(req.params.id, req.body?.motivo || null);
    res.json({ success: true, message: "Cita cancelada exitosamente." });
  } catch (err) {
    next(err);
  }
};
