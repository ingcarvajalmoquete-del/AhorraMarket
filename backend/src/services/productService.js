const productRepository = require("../repositories/productRepository");
const { toPublicProduct } = require("../models/Product");
const { LOW_STOCK_THRESHOLD } = require("../utils/httpStatus");
const HttpError = require("../utils/httpError");
const { HTTP_STATUS } = require("../utils/httpStatus");

function listProducts() {
  return productRepository.findAll().map(toPublicProduct);
}

function getProductOrFail(id) {
  const product = productRepository.findById(id);

  if (!product) {
    throw new HttpError(HTTP_STATUS.NOT_FOUND, "Producto no encontrado.");
  }

  return product;
}

function createProduct(data) {
  const product = productRepository.create(data);
  return toPublicProduct(product);
}

function updateProduct(id, data) {
  getProductOrFail(id);
  const product = productRepository.update(id, data);
  return toPublicProduct(product);
}

function deleteProduct(id) {
  getProductOrFail(id);
  productRepository.remove(id);
}

function getInventorySummary() {
  const products = productRepository.findAll();

  const totalUnits = products.reduce((sum, item) => sum + item.stock, 0);
  const totalValue = products.reduce((sum, item) => sum + item.stock * item.price, 0);
  const lowStockCount = products.filter((item) => item.stock <= LOW_STOCK_THRESHOLD).length;

  return {
    totalUnits,
    totalValue,
    lowStockCount,
    lowStockThreshold: LOW_STOCK_THRESHOLD,
    products: products.map(toPublicProduct)
  };
}

module.exports = { listProducts, getProductOrFail, createProduct, updateProduct, deleteProduct, getInventorySummary };
