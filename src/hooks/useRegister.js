import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export function useRegister() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedFullName = username.trim();

    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (!normalizedEmail.endsWith("@gmail.com")) {
      setError("Email phải có đuôi @gmail.com");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/auth/register", {
        email: normalizedEmail,
        password,
        fullName: normalizedFullName,
      });
      navigate("/");
    } catch (err) {
      const apiMessage = err.response?.data?.error || err.response?.data?.message;
      setError(apiMessage || err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return {
    username, setUsername,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    error, loading,
    handleRegister,
  };
}
