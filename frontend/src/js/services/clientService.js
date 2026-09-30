import { apiClient } from "./apiClient.js";

export const clientService = {
  getAll: async () => (await apiClient.get("/clients")).data,
  create: async (client) => (await apiClient.post("/clients", client)).data,
  update: async (id, client) => (await apiClient.put(`/clients/${id}`, client)).data,
  remove: async (id) => apiClient.delete(`/clients/${id}`)
};
