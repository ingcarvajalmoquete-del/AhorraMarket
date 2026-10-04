const { Router } = require("express");
const { body } = require("express-validator");
const userController = require("../controllers/userController");
const validateRequest = require("../middlewares/validateRequest");
const { requireAuth, requireAdmin } = require("../middlewares/authGuard");

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/", userController.getUsers);

router.post(
  "/",
  [
    body("username").trim().notEmpty().withMessage("El usuario es obligatorio."),
    body("name").trim().notEmpty().withMessage("El nombre es obligatorio."),
    body("password").isLength({ min: 6 }).withMessage("La contrasena debe tener al menos 6 caracteres."),
    body("role").isIn(["admin", "employee", "cashier"]).withMessage("El rol debe ser admin, employee o cashier.")
  ],
  validateRequest,
  userController.createUser
);

router.patch("/:id/toggle", userController.toggleUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
