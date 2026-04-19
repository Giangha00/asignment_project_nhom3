// Thư viện HTTP phổ biến cho trình duyệt và Node
import axios from "axios";

// Tạo một instance axios riêng cho app — mọi gọi api.get/post đều dùng chung cấu hình baseURL + credentials
const api = axios.create({
  // URL gốc của backend API; REACT_APP_* đọc từ .env khi build; mặc định dev trỏ thẳng cổng Express
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:4000",
  // Bật gửi cookie cross-origin: trình duyệt đính kèm cookie accessToken (httpOnly) vào mọi request tới baseURL
  withCredentials: true,
});

// Export default để import api từ "../lib/api" ở hook, page, v.v.
export default api;
