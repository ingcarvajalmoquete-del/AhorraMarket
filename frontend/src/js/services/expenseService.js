import { apiClient } from "./apiClient.js";

export const expenseService = {
  getAll: async () => (await apiClient.get("/expenses")).data,
  create: async (expense) => (await apiClient.post("/expenses", expense)).data,
  remove: async (id) => apiClient.delete(`/expenses/${id}`)
};
