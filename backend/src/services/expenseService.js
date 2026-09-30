const expenseRepository = require("../repositories/expenseRepository");
const { toPublicExpense } = require("../models/Expense");
const HttpError = require("../utils/httpError");
const { HTTP_STATUS } = require("../utils/httpStatus");

function listExpenses() {
  return expenseRepository.findAll().map(toPublicExpense);
}

function createExpense(data) {
  return toPublicExpense(expenseRepository.create(data));
}

function deleteExpense(id) {
  const expense = expenseRepository.findById(id);

  if (!expense) {
    throw new HttpError(HTTP_STATUS.NOT_FOUND, "Gasto no encontrado.");
  }

  expenseRepository.remove(id);
}

module.exports = { listExpenses, createExpense, deleteExpense };
