import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../lib/api";

/**
 * Màn đăng nhập: gửi email + mật khẩu → POST /api/auth/login.
 * Server xác thực, set cookie JWT và trả `user`; App nhận qua onLoginSuccess rồi điều hướng /home.
 */
function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password;

    if (!normalizedEmail || !normalizedPassword) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/api/auth/login", {
        email: normalizedEmail,
        password: normalizedPassword,
      });
      const user = response.data?.user;
      if (!user) {
        throw new Error("Không nhận được thông tin người dùng từ máy chủ.");
      }

      if (typeof onLoginSuccess === "function") {
        onLoginSuccess({ user });
      }

      navigate("/home");
    } catch (err) {
      const apiError = err.response?.data?.error || err.response?.data?.message;
      setError(apiError || "Email hoặc mật khẩu không đúng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white p-10 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Đăng Nhập
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-6 border border-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block text-gray-700 font-semibold mb-2 text-sm"
            >
              Email:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Nhập email của bạn"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 font-semibold mb-2 text-sm"
            >
              Mật khẩu:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Nhập mật khẩu"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-4 td">
          <Link
            to="/forgot-password"
            className="text-indigo-600 font-semibold hover:text-purple-600 td  "
          >
            Quên mật khẩu?{" "}
          </Link>
          <Link
            to="/register"
            className="text-indigo-600 font-semibold hover:text-purple-600 td "
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
