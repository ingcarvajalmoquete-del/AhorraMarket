const productService = require("../services/productService");
const { toPublicProduct } = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");
const { sendOk, sendCreated } = require("../utils/sendResponse");

const getProducts = asyncHandler((req, res) => {
  sendOk(res, productService.listProducts());
});

const getInventorySummary = asyncHandler((req, res) => {
  sendOk(res, productService.getInventorySummary());
});

const createProduct = asyncHandler((req, res) => {
  const product = productService.createProduct(req.body);
  sendCreated(res, product, "Producto creado correctamente.");
});

const updateProduct = asyncHandler((req, res) => {
  const product = productService.updateProduct(Number(req.params.id), req.body);
  sendOk(res, product, "Producto actualizado correctamente.");
});

const deleteProduct = asyncHandler((req, res) => {
  productService.deleteProduct(Number(req.params.id));
  sendOk(res, null, "Producto eliminado correctamente.");
});

const getProductById = asyncHandler((req, res) => {
  const product = productService.getProductOrFail(Number(req.params.id));
  sendOk(res, toPublicProduct(product));
});

module.exports = { getProducts, getInventorySummary, createProduct, updateProduct, deleteProduct, getProductById };
