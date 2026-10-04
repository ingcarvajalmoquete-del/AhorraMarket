const { Router } = require("express");
const { body } = require("express-validator");
const clientController = require("../controllers/clientController");
const validateRequest = require("../middlewares/validateRequest");
const { requireAuth, blockCashier } = require("../middlewares/authGuard");

const router = Router();

const clientRules = [
  body("name").trim().notEmpty().withMessage("El nombre del cliente es obligatorio."),
  body("email").optional({ checkFalsy: true }).isEmail().withMessage("El correo no es valido.")
];

router.use(requireAuth, blockCashier);

router.get("/", clientController.getClients);
router.post("/", clientRules, validateRequest, clientController.createClient);
router.put("/:id", clientRules, validateRequest, clientController.updateClient);
router.delete("/:id", clientController.deleteClient);

module.exports = router;
