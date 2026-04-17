import axios from "axios";

/**
 * Client HTTP gọi backend. `withCredentials: true` để trình duyệt gửi/nhận cookie phiên (JWT httpOnly)
 * khi origin frontend khác port với API — cần CORS `credentials: true` phía server.
 */
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:4000",
  withCredentials: true,
});

export default api;
