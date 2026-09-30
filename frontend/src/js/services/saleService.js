import { apiClient } from "./apiClient.js";

export const saleService = {
  getAll: async () => (await apiClient.get("/sales")).data,
  create: async (items) => (await apiClient.post("/sales", { items })).data
};
