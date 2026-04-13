const pool = require("../../config/db");

/**
 * Devuelve toda la tabla configuracion como un objeto clave-valor.
 * Ejemplo: { hora_apertura: "09:00", hora_cierre: "18:00", ... }
 */
async function getConfig() {
  const [rows] = await pool.query("SELECT clave, valor FROM configuracion");
  return rows.reduce((acc, { clave, valor }) => {
    acc[clave] = valor;
    return acc;
  }, {});
}

/**
 * Devuelve el valor de una clave específica, o null si no existe.
 */
async function getConfigValue(clave) {
  const [rows] = await pool.query(
    "SELECT valor FROM configuracion WHERE clave = ?",
    [clave]
  );
  return rows[0]?.valor ?? null;
}

module.exports = { getConfig, getConfigValue };
