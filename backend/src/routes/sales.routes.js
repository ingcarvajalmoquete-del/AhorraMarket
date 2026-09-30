const { Router } = require("express");
const { body } = require("express-validator");
const saleController = require("../controllers/saleController");
const validateRequest = require("../middlewares/validateRequest");
const { requireAuth } = require("../middlewares/authGuard");

const router = Router();

router.use(requireAuth);

router.get("/", saleController.getSales);
router.get("/:id", saleController.getSaleById);

router.post(
  "/",
  [
    body("items").isArray({ min: 1 }).withMessage("La venta debe incluir al menos un producto."),
    body("items.*.productId").isInt({ min: 1 }).withMessage("El producto de cada linea es obligatorio."),
    body("items.*.quantity").isInt({ min: 1 }).withMessage("La cantidad debe ser mayor a 0.")
  ],
  validateRequest,
  saleController.createSale
);

module.exports = router;
