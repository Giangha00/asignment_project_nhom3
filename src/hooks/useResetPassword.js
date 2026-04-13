import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../lib/api";

export function useResetPassword({ pendingEmail }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const emailFromState = location.state?.email;
  const resetEmail = (emailFromState || pendingEmail || "").trim();

  useEffect(() => {
    if (!resetEmail) {
      setError("Vui lòng nhập email ở bước quên mật khẩu trước.");
    }
  }, [resetEmail]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!resetEmail) {
      setError("Vui lòng nhập email ở bước quên mật khẩu trước.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới không khớp");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/auth/reset-password", { email: resetEmail, newPassword });
      setMessage("Đặt lại mật khẩu thành công! Đang chuyển hướng...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể kết nối đến server. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return {
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    error, message, loading,
    handleResetPassword,
  };
}
