const router = require("express").Router();
const { getServicios, getServicio } = require("./servicios.controller");

router.get("/",    getServicios);
router.get("/:id", getServicio);

module.exports = router;
