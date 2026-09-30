const clientService = require("../services/clientService");
const asyncHandler = require("../utils/asyncHandler");
const { sendOk, sendCreated } = require("../utils/sendResponse");

const getClients = asyncHandler((req, res) => {
  sendOk(res, clientService.listClients());
});

const createClient = asyncHandler((req, res) => {
  const client = clientService.createClient(req.body);
  sendCreated(res, client, "Cliente creado correctamente.");
});

const updateClient = asyncHandler((req, res) => {
  const client = clientService.updateClient(Number(req.params.id), req.body);
  sendOk(res, client, "Cliente actualizado correctamente.");
});

const deleteClient = asyncHandler((req, res) => {
  clientService.deleteClient(Number(req.params.id));
  sendOk(res, null, "Cliente eliminado correctamente.");
});

module.exports = { getClients, createClient, updateClient, deleteClient };
