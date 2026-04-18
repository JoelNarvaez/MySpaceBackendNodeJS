const pool = require("../../config/db");

/**
 * Devuelve todas las citas con el nombre del servicio (JOIN).
 * Usado por el panel admin.
 */
async function findAll() {
  const [rows] = await pool.query(
    `SELECT c.*, s.nombre AS nombre_servicio
     FROM citas c
     JOIN servicios s ON c.id_servicio = s.id
     ORDER BY c.fecha DESC, c.hora DESC`
  );
  return rows;
}

/**
 * Devuelve las citas de un usuario por email.
 * Incluye nombre del servicio.
 */
async function findByEmail(email) {
  const [rows] = await pool.query(
    `SELECT c.*, s.nombre AS nombre_servicio
     FROM citas c
     JOIN servicios s ON c.id_servicio = s.id
     WHERE c.email = ?
     ORDER BY c.fecha DESC, c.hora DESC`,
    [email]
  );
  return rows;
}

/**
 * Devuelve una cita por id (para verificar propiedad antes de cancelar).
 */
async function findById(id) {
  const [rows] = await pool.query("SELECT * FROM citas WHERE id = ?", [id]);
  return rows[0] || null;
}

/**
 * Verifica si ya existe una cita activa en esa fecha y hora.
 * Usado antes de insertar para prevenir doble reserva.
 */
async function findByFechaHora(fecha, hora) {
  const [rows] = await pool.query(
    "SELECT id FROM citas WHERE fecha = ? AND hora = ? AND estado IN ('pendiente', 'confirmada')",
    [fecha, hora]
  );
  return rows[0] || null;
}

/**
 * Inserta una nueva cita con estado 'pendiente'.
 * precio_cobrado congela el precio del servicio al momento de agendar.
 */
async function create({ id_usuario, id_servicio, nombre_cliente, email, telefono, fecha, hora, precio_cobrado }) {
  const [result] = await pool.query(
    `INSERT INTO citas
       (id_usuario, id_servicio, nombre_cliente, email, telefono, fecha, hora, estado, precio_cobrado)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente', ?)`,
    [id_usuario ?? null, id_servicio, nombre_cliente, email, telefono ?? null, fecha, hora, precio_cobrado]
  );
  return result.insertId;
}

/**
 * Cancela una cita (soft update de estado).
 * Devuelve filas afectadas (0 si no existía).
 */
async function cancel(id, motivo = null) {
  const [result] = await pool.query(
    `UPDATE citas
     SET estado = 'cancelada', motivo_cancelacion = ?, actualizado_en = NOW()
     WHERE id = ?`,
    [motivo, id]
  );
  return result.affectedRows;
}

module.exports = { findAll, findByEmail, findById, findByFechaHora, create, cancel };
