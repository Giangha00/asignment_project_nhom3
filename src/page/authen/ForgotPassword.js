import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from "../../lib/api";

/**
 * Quên mật khẩu (bước 1): POST /api/auth/forgot-password kiểm tra email.
 * Truyền email sang bước đặt lại mật khẩu qua onEmailReady / navigate state.
 */
function ForgotPassword({ onEmailReady }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    if (!email) {
      setError('Vui lòng nhập email');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/api/auth/forgot-password", { email });
      const readyEmail = email.trim();
      if (typeof onEmailReady === "function") {
        onEmailReady(readyEmail);
      }
      setMessage(response.data.message);
      setTimeout(() => {
        navigate('/reset-password', { state: { email: readyEmail } });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white p-10 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Quên mật khẩu</h2>
        <p className="text-gray-600 text-sm mb-6 text-center">
          Nhập email đã đăng ký để tiếp tục đặt lại mật khẩu.
        </p>

        {message && (
          <div className="bg-green-100 text-green-700 px-4 py-3 rounded mb-6 border border-green-300 text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-6 border border-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-2 text-sm">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50"
          >
            {loading ? 'Đang gửi...' : 'Tiếp tục'}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Đã nhớ mật khẩu? <Link to="/" className="text-indigo-600 font-semibold hover:text-purple-600">Quay lại đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
