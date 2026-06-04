const router = require("express").Router();
const { login, registro,
    // recuperar contraseña
    forgotPassword, verifyResetToken, resetPassword
} = require("./auth.controller");

router.post("/login",    login);
router.post("/registro", registro);

// recuperar contraseña
router.post(
  "/forgot-password",
  forgotPassword
);

router.get(
  "/verify-reset-token/:token",
  verifyResetToken
);

router.post(
  "/reset-password/:token",
  resetPassword
);

module.exports = router;
