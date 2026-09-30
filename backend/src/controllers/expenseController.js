const expenseService = require("../services/expenseService");
const asyncHandler = require("../utils/asyncHandler");
const { sendOk, sendCreated } = require("../utils/sendResponse");

const getExpenses = asyncHandler((req, res) => {
  sendOk(res, expenseService.listExpenses());
});

const createExpense = asyncHandler((req, res) => {
  const expense = expenseService.createExpense(req.body);
  sendCreated(res, expense, "Gasto registrado correctamente.");
});

const deleteExpense = asyncHandler((req, res) => {
  expenseService.deleteExpense(Number(req.params.id));
  sendOk(res, null, "Gasto eliminado correctamente.");
});

module.exports = { getExpenses, createExpense, deleteExpense };
