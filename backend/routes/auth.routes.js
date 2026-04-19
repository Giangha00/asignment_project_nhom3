/**
 * Routes xác thực — mount tại app.js: app.use("/api/auth", authRoutes)
 * → URL đầy đủ: /api/auth/login, /api/auth/session, ...
 *
 * Các route này KHÔNG gắn authMiddleware (trừ GET /session): user chưa có JWT vẫn gọi được login/register.
 */
const express = require("express");
const auth = require("../controllers/authController");

const router = express.Router();

// POST /api/auth/register — tạo tài khoản mới (body: email, password, fullName?)
router.post("/register", auth.register);

// POST /api/auth/login — kiểm tra mật khẩu, server set cookie accessToken + trả JSON { user, token }
router.post("/login", auth.login);

// POST /api/auth/logout — xóa cookie accessToken trên trình duyệt
router.post("/logout", auth.logout);

// GET /api/auth/session — CẦN JWT (cookie hoặc Bearer); trả user hiện tại + token (cho Socket.io)
router.get("/session", auth.session);

// POST /api/auth/forgot-password — bước đầu quên mật khẩu (kiểm tra email)
router.post("/forgot-password", auth.forgotPassword);

// POST /api/auth/reset-password — đặt mật khẩu mới khi biết email
router.post("/reset-password", auth.resetPassword);

module.exports = router;
