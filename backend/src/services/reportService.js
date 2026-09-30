const saleRepository = require("../repositories/saleRepository");
const productRepository = require("../repositories/productRepository");
const expenseRepository = require("../repositories/expenseRepository");
const userRepository = require("../repositories/userRepository");
const { toPublicSale } = require("../models/Sale");
const { toPublicProduct } = require("../models/Product");
const { LOW_STOCK_THRESHOLD } = require("../utils/httpStatus");

function startOfMonthIso() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function sumAmounts(collection, key) {
  return collection.reduce((sum, item) => sum + item[key], 0);
}

function getDashboardSummary() {
  const products = productRepository.findAll();
  const sales = saleRepository.findSalesBetween(startOfMonthIso(), todayIso());
  const expenses = expenseRepository.findAll();
  const users = userRepository.findAll();

  const monthExpenses = expenses.filter((expense) => expense.created_at.slice(0, 7) === todayIso().slice(0, 7));

  const monthSalesTotal = sumAmounts(sales, "total");
  const monthExpensesTotal = sumAmounts(monthExpenses, "amount");

  const recentSales = saleRepository.findAll().slice(0, 5).map((sale) => {
    const items = saleRepository.findItemsBySaleId(sale.id);
    return toPublicSale(sale, items);
  });

  const lowStockProducts = products
    .filter((product) => product.stock <= LOW_STOCK_THRESHOLD)
    .map(toPublicProduct);

  return {
    monthSalesTotal,
    monthExpensesTotal,
    balance: monthSalesTotal - monthExpensesTotal,
    totalProducts: products.length,
    totalUsers: users.length,
    recentSales,
    lowStockProducts
  };
}

function groupSalesByDay(sales) {
  const totalsByDay = {};

  sales.forEach((sale) => {
    const day = sale.createdAt.slice(0, 10);
    totalsByDay[day] = (totalsByDay[day] || 0) + sale.total;
  });

  return Object.entries(totalsByDay).map(([date, total]) => ({ date, total }));
}

function getSalesReport(fromDate, toDate) {
  const rawSales = saleRepository.findSalesBetween(fromDate, toDate);
  const sales = rawSales.map((sale) => toPublicSale(sale, saleRepository.findItemsBySaleId(sale.id)));

  const totalSales = sumAmounts(sales, "total");
  const transactions = sales.length;
  const averageTicket = transactions > 0 ? Number((totalSales / transactions).toFixed(2)) : 0;

  return {
    sales,
    totalSales,
    transactions,
    averageTicket,
    dailyTotals: groupSalesByDay(sales)
  };
}

function getExpensesByCategory() {
  const expenses = expenseRepository.findAll();
  const totalsByCategory = {};

  expenses.forEach((expense) => {
    totalsByCategory[expense.category] = (totalsByCategory[expense.category] || 0) + expense.amount;
  });

  return Object.entries(totalsByCategory).map(([category, total]) => ({ category, total }));
}

module.exports = { getDashboardSummary, getSalesReport, getExpensesByCategory };
