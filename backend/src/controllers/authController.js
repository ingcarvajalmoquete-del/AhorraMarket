const authService = require("../services/authService");
const asyncHandler = require("../utils/asyncHandler");
const { sendOk } = require("../utils/sendResponse");

const login = asyncHandler((req, res) => {
  const { username, password } = req.body;
  const result = authService.login(username, password);
  sendOk(res, result, "Inicio de sesion exitoso.");
});

const getProfile = asyncHandler((req, res) => {
  const profile = authService.getProfile(req.user.id);
  sendOk(res, profile);
});

module.exports = { login, getProfile };
