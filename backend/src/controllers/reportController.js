const reportService = require("../services/reportService");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { HTTP_STATUS } = require("../utils/httpStatus");
const { sendOk } = require("../utils/sendResponse");

const getDashboardSummary = asyncHandler((req, res) => {
  sendOk(res, reportService.getDashboardSummary());
});

const getSalesReport = asyncHandler((req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    throw new HttpError(HTTP_STATUS.BAD_REQUEST, "Debes indicar las fechas 'from' y 'to'.");
  }

  sendOk(res, reportService.getSalesReport(from, to));
});

const getExpensesByCategory = asyncHandler((req, res) => {
  sendOk(res, reportService.getExpensesByCategory());
});

module.exports = { getDashboardSummary, getSalesReport, getExpensesByCategory };
