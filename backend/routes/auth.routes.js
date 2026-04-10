/**
 * Routes xác thực người dùng (public, không cần JWT).
 *
 * - POST /register     : Đăng ký tài khoản mới → tạo user + trả JWT (client có thể lưu / dùng cookie từ login).
 * - POST /login        : Đăng nhập → set cookie httpOnly + trả user + token.
 * - POST /logout       : Xóa cookie phiên → client coi như đã đăng xuất.
 * - GET  /session      : Kiểm tra phiên hiện tại (cần JWT) → trả user từ DB.
 * - POST /forgot-password : Bước 1 quên mật khẩu (kiểm tra email tồn tại).
 * - POST /reset-password  : Đặt lại mật khẩu khi biết email + mật khẩu mới.
 */
const express = require("express");
const auth = require("../controllers/authController");

const router = express.Router();
router.post("/register", auth.register);
router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.get("/session", auth.session);
router.post("/forgot-password", auth.forgotPassword);
router.post("/reset-password", auth.resetPassword);

module.exports = router;
