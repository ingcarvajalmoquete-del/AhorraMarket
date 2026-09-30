import { apiClient } from "./apiClient.js";
import { API_BASE_URL, STORAGE_KEYS } from "../utils/constants.js";

export async function loginRequest(username, password) {
  const { data } = await apiClient.post("/auth/login", { username, password });
  localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
  return data.user;
}

export function getSession() {
  const raw = localStorage.getItem(STORAGE_KEYS.USER);
  return raw ? JSON.parse(raw) : null;
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
}

export async function checkApiHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { cache: "no-store" });
    return response.ok;
  } catch (error) {
    return false;
  }
}
