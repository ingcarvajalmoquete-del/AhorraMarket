const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const env = require("./src/config/env");
const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/users.routes");
const productRoutes = require("./src/routes/products.routes");
const clientRoutes = require("./src/routes/clients.routes");
const employeeRoutes = require("./src/routes/employees.routes");
const saleRoutes = require("./src/routes/sales.routes");
const expenseRoutes = require("./src/routes/expenses.routes");
const reportRoutes = require("./src/routes/reports.routes");
const notFound = require("./src/middlewares/notFound");
const errorHandler = require("./src/middlewares/errorHandler");

const app = express();

const LOCAL_ORIGIN_PATTERN = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/;

function corsOriginValidator(origin, callback) {
  const isAllowed = !origin || LOCAL_ORIGIN_PATTERN.test(origin) || env.corsOrigins.includes(origin);
  callback(null, isAllowed);
}

app.use(cors({ origin: corsOriginValidator }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ success: true, data: { status: "online" }, message: "" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/reports", reportRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
