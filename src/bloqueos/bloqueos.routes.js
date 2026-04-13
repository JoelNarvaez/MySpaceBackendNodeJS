const router     = require("express").Router();
const { verifyToken } = require("../../middleware/auth.middleware");
const { adminGuard }  = require("../../middleware/admin.middleware");
const { getBloqueos, createBloqueo, deleteBloqueo } = require("./bloqueos.controller");

// Todas las rutas de bloqueos requieren token + rol admin
router.use(verifyToken, adminGuard);

router.get("/",    getBloqueos);
router.post("/",   createBloqueo);
router.delete("/:id", deleteBloqueo);

module.exports = router;
