const { Router } = require("express");
const { body } = require("express-validator");
const employeeController = require("../controllers/employeeController");
const validateRequest = require("../middlewares/validateRequest");
const { requireAuth } = require("../middlewares/authGuard");

const router = Router();

const employeeRules = [
  body("name").trim().notEmpty().withMessage("El nombre del empleado es obligatorio."),
  body("position").optional({ checkFalsy: true }).trim()
];

router.use(requireAuth);

router.get("/", employeeController.getEmployees);
router.post("/", employeeRules, validateRequest, employeeController.createEmployee);
router.put("/:id", employeeRules, validateRequest, employeeController.updateEmployee);
router.delete("/:id", employeeController.deleteEmployee);

module.exports = router;
