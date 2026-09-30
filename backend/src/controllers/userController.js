const userService = require("../services/userService");
const asyncHandler = require("../utils/asyncHandler");
const { sendOk, sendCreated } = require("../utils/sendResponse");

const getUsers = asyncHandler((req, res) => {
  sendOk(res, userService.listUsers());
});

const createUser = asyncHandler((req, res) => {
  const user = userService.createUser(req.body);
  sendCreated(res, user, "Usuario creado correctamente.");
});

const toggleUser = asyncHandler((req, res) => {
  const user = userService.toggleUserStatus(Number(req.params.id));
  sendOk(res, user, "Estado del usuario actualizado.");
});

const deleteUser = asyncHandler((req, res) => {
  userService.deleteUser(Number(req.params.id));
  sendOk(res, null, "Usuario eliminado correctamente.");
});

module.exports = { getUsers, createUser, toggleUser, deleteUser };
