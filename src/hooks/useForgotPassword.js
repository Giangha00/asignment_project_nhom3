import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export function useForgotPassword({ onEmailReady }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email) {
      setError("Vui lòng nhập email");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/api/auth/forgot-password", { email });
      const readyEmail = email.trim();
      if (typeof onEmailReady === "function") onEmailReady(readyEmail);
      setMessage(response.data.message);
      setTimeout(() => {
        navigate("/reset-password", { state: { email: readyEmail } });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return { email, setEmail, message, error, loading, handleSubmit };
}
