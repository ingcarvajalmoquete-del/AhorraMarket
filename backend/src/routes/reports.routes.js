const { Router } = require("express");
const reportController = require("../controllers/reportController");
const { requireAuth } = require("../middlewares/authGuard");

const router = Router();

router.use(requireAuth);

router.get("/dashboard-summary", reportController.getDashboardSummary);
router.get("/sales", reportController.getSalesReport);
router.get("/expenses-by-category", reportController.getExpensesByCategory);

module.exports = router;
