import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export function useLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/api/auth/login", {
        email: normalizedEmail,
        password,
      });
      const user = response.data?.user;
      if (!user) throw new Error("Không nhận được thông tin người dùng từ máy chủ.");
      if (typeof onLoginSuccess === "function") onLoginSuccess({ user });
      navigate("/home");
    } catch (err) {
      const apiError = err.response?.data?.error || err.response?.data?.message;
      setError(apiError || "Email hoặc mật khẩu không đúng.");
    } finally {
      setLoading(false);
    }
  };

  return { email, setEmail, password, setPassword, error, loading, handleLogin };
}
