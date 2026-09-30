const saleRepository = require("../repositories/saleRepository");
const productRepository = require("../repositories/productRepository");
const env = require("../config/env");
const { toPublicSale } = require("../models/Sale");
const HttpError = require("../utils/httpError");
const { HTTP_STATUS } = require("../utils/httpStatus");

function buildSaleItem(cartItem) {
  const product = productRepository.findById(cartItem.productId);

  if (!product) {
    throw new HttpError(HTTP_STATUS.BAD_REQUEST, `El producto #${cartItem.productId} no existe.`);
  }

  if (product.stock < cartItem.quantity) {
    throw new HttpError(HTTP_STATUS.BAD_REQUEST, `Stock insuficiente para "${product.name}".`);
  }

  return {
    productId: product.id,
    productName: product.name,
    quantity: cartItem.quantity,
    unitPrice: product.price,
    lineTotal: Number((product.price * cartItem.quantity).toFixed(2))
  };
}

function calculateTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const tax = Number((subtotal * env.taxRate).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));
  return { subtotal: Number(subtotal.toFixed(2)), tax, total };
}

function registerSale({ userId, cartItems }) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new HttpError(HTTP_STATUS.BAD_REQUEST, "La venta debe incluir al menos un producto.");
  }

  const items = cartItems.map(buildSaleItem);
  const { subtotal, tax, total } = calculateTotals(items);

  const sale = saleRepository.createSaleWithItems({ userId, subtotal, tax, total, items });
  const saleItems = saleRepository.findItemsBySaleId(sale.id);

  return toPublicSale(sale, saleItems);
}

function listSales() {
  return saleRepository.findAll().map((sale) => {
    const items = saleRepository.findItemsBySaleId(sale.id);
    return toPublicSale(sale, items);
  });
}

function getSaleById(id) {
  const sale = saleRepository.findById(id);

  if (!sale) {
    throw new HttpError(HTTP_STATUS.NOT_FOUND, "Venta no encontrada.");
  }

  return toPublicSale(sale, saleRepository.findItemsBySaleId(id));
}

function getSalesBetween(fromDate, toDate) {
  return saleRepository.findSalesBetween(fromDate, toDate).map((sale) => {
    const items = saleRepository.findItemsBySaleId(sale.id);
    return toPublicSale(sale, items);
  });
}

module.exports = { registerSale, listSales, getSaleById, getSalesBetween };
