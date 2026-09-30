const clientRepository = require("../repositories/clientRepository");
const { toPublicClient } = require("../models/Client");
const HttpError = require("../utils/httpError");
const { HTTP_STATUS } = require("../utils/httpStatus");

function listClients() {
  return clientRepository.findAll().map(toPublicClient);
}

function ensureClientExists(id) {
  const client = clientRepository.findById(id);

  if (!client) {
    throw new HttpError(HTTP_STATUS.NOT_FOUND, "Cliente no encontrado.");
  }

  return client;
}

function createClient(data) {
  return toPublicClient(clientRepository.create(data));
}

function updateClient(id, data) {
  ensureClientExists(id);
  return toPublicClient(clientRepository.update(id, data));
}

function deleteClient(id) {
  ensureClientExists(id);
  clientRepository.remove(id);
}

module.exports = { listClients, createClient, updateClient, deleteClient };
