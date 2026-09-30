const bcrypt = require("bcryptjs");
const userRepository = require("../repositories/userRepository");
const { toPublicUser } = require("../models/User");
const HttpError = require("../utils/httpError");
const { HTTP_STATUS } = require("../utils/httpStatus");

const SALT_ROUNDS = 10;

function listUsers() {
  return userRepository.findAll().map(toPublicUser);
}

function createUser({ username, name, password, role }) {
  const existing = userRepository.findByUsername(username);

  if (existing) {
    throw new HttpError(HTTP_STATUS.BAD_REQUEST, "El nombre de usuario ya existe.");
  }

  const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);
  const user = userRepository.create({ username, name, passwordHash, role });
  return toPublicUser(user);
}

function toggleUserStatus(id) {
  const user = userRepository.findById(id);

  if (!user) {
    throw new HttpError(HTTP_STATUS.NOT_FOUND, "Usuario no encontrado.");
  }

  const updated = userRepository.setActive(id, !user.active);
  return toPublicUser(updated);
}

function deleteUser(id) {
  const user = userRepository.findById(id);

  if (!user) {
    throw new HttpError(HTTP_STATUS.NOT_FOUND, "Usuario no encontrado.");
  }

  userRepository.remove(id);
}

module.exports = { listUsers, createUser, toggleUserStatus, deleteUser };
