const jwt = require("jsonwebtoken");

/**
 * Verifica que el request traiga un JWT válido en el header Authorization.
 * Agrega req.user = { id, nombre, email, rol } para uso en los controladores.
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Token no proporcionado. Formato esperado: Authorization: Bearer <token>",
      });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        success: false,
        message: "Formato de token inválido. Use: Bearer <token>",
      });
    }

    const token = parts[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expirado. Inicie sesión nuevamente.",
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token inválido.",
      });
    }
    next(error);
  }
};

module.exports = { verifyToken };
