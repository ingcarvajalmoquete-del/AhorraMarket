const saleService = require("../services/saleService");
const asyncHandler = require("../utils/asyncHandler");
const { sendOk, sendCreated } = require("../utils/sendResponse");

const getSales = asyncHandler((req, res) => {
  sendOk(res, saleService.listSales());
});

const getSaleById = asyncHandler((req, res) => {
  sendOk(res, saleService.getSaleById(Number(req.params.id)));
});

const createSale = asyncHandler((req, res) => {
  const sale = saleService.registerSale({
    userId: req.user.id,
    cartItems: req.body.items
  });
  sendCreated(res, sale, "Venta registrada correctamente.");
});

module.exports = { getSales, getSaleById, createSale };
