import { api, authStorage } from "./client";

export async function loginRequest(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

export async function registerRequest(full_name, email, password) {
  const { data } = await api.post("/auth/register", { full_name, email, password });
  return data;
}

export async function fetchMe() {
  const { data } = await api.get("/auth/me");
  return data.user;
}

export function persistSession(token) {
  authStorage.setToken(token);
}

export function clearSession() {
  authStorage.clear();
}
