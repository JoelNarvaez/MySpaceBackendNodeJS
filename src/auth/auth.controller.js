const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const { findByEmail, emailExists, createUser } = require("./auth.model");

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateToken(user) {
  return jwt.sign(
    { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );
}

function publicUser(user) {
  return { id: user.id, nombre: user.nombre, email: user.email, telefono: user.telefono || null, rol: user.rol };
}

// ── Controladores ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Response: { success, token, user: { id, nombre, email, rol } }
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email y contraseña son requeridos.",
      });
    }

    const user = await findByEmail(email);

    // Respuesta genérica para no revelar si el email existe
    if (!user) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas." });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas." });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      token,
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/registro
 * Body: { nombre, email, telefono?, password }
 * Response: { success, token, user: { id, nombre, email, rol } }
 */
exports.registro = async (req, res, next) => {
  try {
    const { nombre, email, telefono, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Nombre, email y contraseña son requeridos.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 6 caracteres.",
      });
    }

    const existe = await emailExists(email);
    if (existe) {
      return res.status(409).json({
        success: false,
        message: "El email ya está registrado.",
      });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const id = await createUser({ nombre, email, telefono, password_hash });

    const user = { id, nombre, email, telefono: telefono || null, rol: "usuario" };
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      token,
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
};
