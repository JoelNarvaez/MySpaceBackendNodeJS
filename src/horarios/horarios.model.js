const pool = require("../../config/db");

async function getHorarioPorDia(dia_semana) {
  const [rows] = await pool.query(
    "SELECT * FROM horarios_semana WHERE dia_semana = ? LIMIT 1",
    [dia_semana]
  );
  return rows[0];
}

async function getCitasDelDia(fecha) {
  const [rows] = await pool.query(
    `SELECT c.hora, s.duracion_min
     FROM citas c
     JOIN servicios s ON c.id_servicio = s.id
     WHERE c.fecha = ? AND c.estado != 'cancelada'`,
    [fecha]
  );
  return rows;
}

module.exports = { getHorarioPorDia, getCitasDelDia };