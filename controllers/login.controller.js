const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
    obtenerUserPorCorreo,
} = require("../modelo/usersModel");

exports.login = async (req, res) => {
    const { email, password } = req.body;
    console.log(`[LOGIN] Intento de login para: ${email}`);

    if (!email || !password) {
        console.warn("[LOGIN] Faltan campos obligatorios");
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Buscar usuario
    const user = await obtenerUserPorCorreo(email);

    if (!user) {
        console.warn(`[LOGIN] Usuario no encontrado: ${email}`);
        return res.status(404).json({ message: "Usuario no encontrado" });
    }

    console.log(`[LOGIN] Usuario encontrado: id=${user.id}`);

    // Comparar
    const passwordCorrecta = await bcrypt.compare(password, user.contraseña);

    if (!passwordCorrecta) {
        console.warn(`[LOGIN] Contraseña incorrecta para: ${email}`);
        return res.status(401).json({
            message: "Credenciales invalidas."
        });
    }

    // Generar token JWT
    const token = jwt.sign(
        { id: user.id, email: user.email, rol: user.rol },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    console.log(`[LOGIN] Login exitoso para: ${email}`);

    return res.status(200).json({
        success: true,
        message: "Inicio de sesión exitoso",
        token: token,
        user: {
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol
        }
    });
};
