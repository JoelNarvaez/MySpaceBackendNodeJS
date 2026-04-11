// Importar pool desde config/db (ruta corregida)
const pool = require('../config/db');

// Obtener usuario por id (para login)
async function obtenerUserPorId(idUser) {
    const [rows] = await pool.query(
        'SELECT * FROM usuarios WHERE id = ?',
        [idUser]
    );
    return rows[0];
}

// Obtener usuario por email (para login)
async function obtenerUserPorCorreo(email) {
    const [rows] = await pool.query(
        'SELECT * FROM usuarios WHERE email = ?',
        [email]
    );
    return rows[0];
}

async function crearUser(nombre, email, hashedPassword, rol = 'user') {
    const [result] = await pool.query(
        'INSERT INTO usuarios (nombre, email, contraseña, rol) VALUES (?, ?, ?, ?)',
        [nombre, email, hashedPassword, rol]
    );
    return result.insertId;
}

module.exports = {
    obtenerUserPorId,
    obtenerUserPorCorreo,
    crearUser,
};
