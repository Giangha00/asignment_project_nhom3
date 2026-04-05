import axios from "axios";

const TOKEN_KEY = "trello_token";

/** Dev: empty → same-origin /api (proxied to backend). Production static host: set REACT_APP_API_URL=http://localhost:3000 */
function apiBaseURL() {
  const env = process.env.REACT_APP_API_URL?.trim();
  if (!env) return "/api";
  const base = env.replace(/\/$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
}

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const api = axios.create({
  baseURL: apiBaseURL(),
  headers: { "Content-Type": "application/json" },
  // Đảm bảo luôn nối đúng với baseURL (một số phiên bản axios có allowAbsoluteUrls mặc định true)
  allowAbsoluteUrls: false,
});

api.interceptors.request.use((config) => {
  const t = authStorage.getToken();
  if (t) {
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});
