const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const userRepository = require("../repositories/userRepository");
const { toPublicUser } = require("../models/User");
const HttpError = require("../utils/httpError");
const { HTTP_STATUS } = require("../utils/httpStatus");

function buildToken(user) {
  const payload = { id: user.id, username: user.username, role: user.role };
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

function login(username, password) {
  const user = userRepository.findByUsername(username);

  if (!user || !user.active) {
    throw new HttpError(HTTP_STATUS.UNAUTHORIZED, "Usuario o contrasena incorrectos.");
  }

  const passwordMatches = bcrypt.compareSync(password, user.password_hash);

  if (!passwordMatches) {
    throw new HttpError(HTTP_STATUS.UNAUTHORIZED, "Usuario o contrasena incorrectos.");
  }

  const token = buildToken(user);
  return { token, user: toPublicUser(user) };
}

function getProfile(userId) {
  const user = userRepository.findById(userId);
  return toPublicUser(user);
}

module.exports = { login, getProfile };
