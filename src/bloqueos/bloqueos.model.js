const pool = require("../../config/db");

/**
 * Devuelve todos los bloqueos activos (para panel admin).
 */
async function findAll() {
  const [rows] = await pool.query(
    "SELECT * FROM bloqueos WHERE activo = 1 ORDER BY creado_en DESC"
  );
  return rows;
}

/**
 * Devuelve todos los bloqueos activos sin filtro de orden.
 * Usado internamente por el helper de disponibilidad.
 */
async function findActivos() {
  const [rows] = await pool.query(
    "SELECT * FROM bloqueos WHERE activo = 1"
  );
  return rows;
}

/**
 * Crea un nuevo bloqueo.
 * tipo: 'dia' | 'horario'
 * - tipo 'dia' + fecha     → bloquea ese día específico
 * - tipo 'dia' + dia_semana → bloquea ese día de la semana cada semana (0=Dom … 6=Sáb)
 * - tipo 'horario'          → bloquea un rango de horas en todos los días
 */
async function create({ tipo, fecha, dia_semana, hora_inicio, hora_fin, motivo }) {
  const [result] = await pool.query(
    `INSERT INTO bloqueos (tipo, fecha, dia_semana, hora_inicio, hora_fin, motivo, activo)
     VALUES (?, ?, ?, ?, ?, ?, 1)`,
    [
      tipo,
      fecha      ?? null,
      dia_semana ?? null,
      hora_inicio ?? null,
      hora_fin    ?? null,
      motivo      ?? null,
    ]
  );
  return result.insertId;
}

/**
 * Desactiva un bloqueo (soft delete).
 * Devuelve el número de filas afectadas (0 si no existía).
 */
async function remove(id) {
  const [result] = await pool.query(
    "UPDATE bloqueos SET activo = 0 WHERE id = ? AND activo = 1",
    [id]
  );
  return result.affectedRows;
}

module.exports = { findAll, findActivos, create, remove };
