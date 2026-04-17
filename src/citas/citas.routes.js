const router          = require("express").Router();
const { verifyToken } = require("../../middleware/auth.middleware");
const { adminGuard }  = require("../../middleware/admin.middleware");
const { getCitas, getCitasByEmail, createCita, cancelCita } = require("./citas.controller");

// Admin: todas las citas
router.get("/", verifyToken, adminGuard, getCitas);

// IMPORTANTE: esta ruta debe declararse ANTES de "/:id"
// para que Express no confunda "usuario" con un id numérico.
router.get("/usuario/:email", verifyToken, getCitasByEmail);

// Usuario: crear cita
router.post("/", verifyToken, createCita);

// Usuario: cancelar su cita
router.patch("/:id/cancelar", verifyToken, cancelCita);

module.exports = router;
