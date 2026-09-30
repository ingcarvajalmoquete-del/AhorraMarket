import { apiClient } from "./apiClient.js";

export const userService = {
  getAll: async () => (await apiClient.get("/users")).data,
  create: async (user) => (await apiClient.post("/users", user)).data,
  toggle: async (id) => (await apiClient.patch(`/users/${id}/toggle`)).data,
  remove: async (id) => apiClient.delete(`/users/${id}`)
};
