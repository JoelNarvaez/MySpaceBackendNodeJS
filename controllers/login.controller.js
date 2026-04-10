const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { 
    obtenerUserPorCorreo,
} = require("../../models/usersModel");

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Buscar usuario
    const user = await obtenerUserPorCorreo(email);

    if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Comparar 
    const passwordCorrecta = await bcrypt.compare(password, user.contraseña);

    if (!passwordCorrecta) {

        return res.status(401).json({
            message: `Credenciales invalidas.`
        });
    }

    // contraseña corecta
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
