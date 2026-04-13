const router = require("express").Router();
const { getHorarios } = require("./horarios.controller");

// Público — no requiere autenticación
router.get("/", getHorarios);

module.exports = router;
