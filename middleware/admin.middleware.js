/**
 * Verifica que el usuario autenticado tenga rol 'admin'.
 * Debe usarse DESPUÉS de verifyToken.
 */
const adminGuard = (req, res, next) => {
  if (!req.user || req.user.rol !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Acceso denegado. Se requieren permisos de administrador.",
    });
  }
  next();
};

module.exports = { adminGuard };
