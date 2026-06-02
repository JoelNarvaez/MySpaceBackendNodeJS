const router     = require('express').Router();
const { verifyToken } = require('../../middleware/auth.middleware');
const { adminGuard }  = require('../../middleware/admin.middleware');
const { getBloqueos, getBloqueoPublico, createBloqueo, deleteBloqueo } = require('./bloqueos.controller');

// Ruta pública — devuelve sólo fechas/días bloqueados (sin datos sensibles)
router.get('/publico', getBloqueoPublico);

// Todas las rutas de bloqueos requieren token + rol admin
router.use(verifyToken, adminGuard);

router.get("/",    getBloqueos);
router.post("/",   createBloqueo);
router.delete("/:id", deleteBloqueo);

module.exports = router;
