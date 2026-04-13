const pool = require("../../config/db");

/**
 * Devuelve todos los servicios activos ordenados por nombre.
 */
async function findAll() {
  const [rows] = await pool.query(
    `SELECT id, nombre, descripcion, duracion_min, precio, imagen_url
     FROM servicios
     WHERE activo = 1
     ORDER BY nombre`
  );
  return rows;
}

/**
 * Devuelve un servicio activo por id, incluyendo duracion_min
 * (necesario para calcular disponibilidad de horarios).
 */
async function findById(id) {
  const [rows] = await pool.query(
    `SELECT id, nombre, descripcion, duracion_min, precio, imagen_url
     FROM servicios
     WHERE id = ? AND activo = 1`,
    [id]
  );
  return rows[0] || null;
}

module.exports = { findAll, findById };
