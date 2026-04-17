import { io } from "socket.io-client";
import api from "./api";

const SOCKET_URL =
  process.env.REACT_APP_API_URL ||
  (api && api.defaults && api.defaults.baseURL) ||
  "http://localhost:4000";

let socketInstance = null;
/** JWT — bắt buộc để server join phòng user:{id}; không tạo socket khi chưa có. */
let pendingAuthToken = null;

/**
 * Đặt JWT trước khi kết nối. Gọi `null` khi đăng xuất.
 */
export function setSocketAuthToken(token) {
  const next = token ? String(token) : null;
  if (next === pendingAuthToken) return;
  pendingAuthToken = next;
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

/**
 * Chỉ tạo Manager khi đã có JWT — tránh kết nối "vô danh" rồi không vào phòng user:*.
 */
export function getSocket() {
  if (!pendingAuthToken) {
    return null;
  }
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      auth: { token: pendingAuthToken },
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
  }
  return socketInstance;
}

/**
 * Đảm bảo có token (từ bootstrap hoặc GET /api/auth/session) rồi mới trả socket.
 * Dùng trước mọi socket.on — tránh race với useHome/useBoard (effect con chạy trước Bridge).
 */
export async function ensureSocketConnected() {
  if (!pendingAuthToken) {
    try {
      const res = await api.get("/api/auth/session");
      const t = res.data?.token;
      if (t) {
        setSocketAuthToken(t);
      }
    } catch {
      return null;
    }
  }
  return getSocket();
}
