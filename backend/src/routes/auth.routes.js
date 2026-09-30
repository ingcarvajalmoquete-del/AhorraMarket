const { Router } = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const validateRequest = require("../middlewares/validateRequest");
const { requireAuth } = require("../middlewares/authGuard");

const router = Router();

router.post(
  "/login",
  [
    body("username").trim().notEmpty().withMessage("El usuario es obligatorio."),
    body("password").notEmpty().withMessage("La contrasena es obligatoria.")
  ],
  validateRequest,
  authController.login
);

router.get("/me", requireAuth, authController.getProfile);

module.exports = router;
