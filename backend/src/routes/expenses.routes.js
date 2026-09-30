const { Router } = require("express");
const { body } = require("express-validator");
const expenseController = require("../controllers/expenseController");
const validateRequest = require("../middlewares/validateRequest");
const { requireAuth } = require("../middlewares/authGuard");

const router = Router();

router.use(requireAuth);

router.get("/", expenseController.getExpenses);

router.post(
  "/",
  [
    body("description").trim().notEmpty().withMessage("La descripcion es obligatoria."),
    body("category").trim().notEmpty().withMessage("La categoria es obligatoria."),
    body("amount").isFloat({ min: 0.01 }).withMessage("El monto debe ser mayor a 0.")
  ],
  validateRequest,
  expenseController.createExpense
);

router.delete("/:id", expenseController.deleteExpense);

module.exports = router;
