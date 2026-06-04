const pool = require("../../config/db");

/**
 * Busca un usuario por email solo si está activo.
 * Devuelve el objeto completo (incluye password_hash para comparar).
 */
async function findByEmail(email) {
  const [rows] = await pool.query(
    "SELECT * FROM usuarios WHERE email = ? AND activo = 1",
    [email]
  );
  return rows[0] || null;
}

/**
 * Devuelve datos públicos de un usuario por id (sin password_hash).
 */
async function findById(id) {
  const [rows] = await pool.query(
    "SELECT id, nombre, email, telefono, rol, foto_url, creado_en FROM usuarios WHERE id = ? AND activo = 1",
    [id]
  );
  return rows[0] || null;
}

/**
 * Verifica si ya existe un usuario con ese email (activo o no).
 */
async function emailExists(email) {
  const [rows] = await pool.query(
    "SELECT id FROM usuarios WHERE email = ?",
    [email]
  );
  return rows.length > 0;
}

/**
 * Inserta un nuevo usuario. El rol por defecto es 'usuario'.
 * Devuelve el id insertado.
 */
async function createUser({ nombre, email, telefono, password_hash, rol = "usuario" }) {
  const [result] = await pool.query(
    `INSERT INTO usuarios (nombre, email, telefono, password_hash, rol, activo)
     VALUES (?, ?, ?, ?, ?, 1)`,
    [nombre, email, telefono || null, password_hash, rol]
  );
  return result.insertId;
}

// recuperación de contraseña

async function saveResetToken(email, token, expires) {
  await pool.query(
    `UPDATE usuarios
     SET reset_password_token = ?,
         reset_password_expires = ?
     WHERE email = ?`,
    [token, expires, email]
  );
}

async function findByResetToken(token) {
  const [rows] = await pool.query(
    `SELECT *
     FROM usuarios
     WHERE reset_password_token = ?
       AND reset_password_expires > NOW()
       AND activo = 1`,
    [token]
  );

  return rows[0] || null;
}

async function updatePassword(userId, password_hash) {
  await pool.query(
    `UPDATE usuarios
     SET password_hash = ?,
         reset_password_token = NULL,
         reset_password_expires = NULL
     WHERE id = ?`,
    [password_hash, userId]
  );
}

module.exports = { findByEmail, findById, emailExists, createUser,
  // recuperación de contraseña
  saveResetToken, findByResetToken, updatePassword
};
