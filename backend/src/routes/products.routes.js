const { Router } = require("express");
const { body } = require("express-validator");
const productController = require("../controllers/productController");
const validateRequest = require("../middlewares/validateRequest");
const { requireAuth, blockCashier } = require("../middlewares/authGuard");

const router = Router();

const productRules = [
  body("name").trim().notEmpty().withMessage("El nombre del producto es obligatorio."),
  body("category").trim().notEmpty().withMessage("La categoria es obligatoria."),
  body("price").isFloat({ min: 0 }).withMessage("El precio debe ser un numero mayor o igual a 0."),
  body("stock").isInt({ min: 0 }).withMessage("El stock debe ser un numero entero mayor o igual a 0.")
];

router.use(requireAuth);

router.get("/", productController.getProducts);
router.get("/inventory-summary", blockCashier, productController.getInventorySummary);
router.get("/:id", productController.getProductById);
router.post("/", blockCashier, productRules, validateRequest, productController.createProduct);
router.put("/:id", blockCashier, productRules, validateRequest, productController.updateProduct);
router.delete("/:id", blockCashier, productController.deleteProduct);

module.exports = router;
