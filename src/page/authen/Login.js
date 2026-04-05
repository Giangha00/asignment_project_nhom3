import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Lấy danh sách users đã đăng ký từ localStorage
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

      // Tìm user có email khớp
      const user = registeredUsers.find(u => u.email === email);

      if (!user) {
        setError('Email không tồn tại. Vui lòng đăng ký trước.');
        setLoading(false);
        return;
      }

      // Kiểm tra password
      if (user.password !== password) {
        setError('Mật khẩu không đúng.');
        setLoading(false);
        return;
      }

      // Đăng nhập thành công - lưu thông tin user hiện tại
      localStorage.setItem('token', 'demo-token-' + Date.now());
      localStorage.setItem('user', JSON.stringify({
        id: user.id,
        username: user.username,
        email: user.email
      }));

      // Chuyển hướng tới dashboard
      navigate('/dashboard');
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white p-10 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Đăng Nhập</h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-6 border border-red-300">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="mb-5">
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

          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-2 text-sm">
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
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-4 td">
           <Link to="/forgot-password" className="text-indigo-600 font-semibold hover:text-purple-600 td  ">Quên mật khẩu?  </Link>
            <Link to="/register" className="text-indigo-600 font-semibold hover:text-purple-600 td ">Đăng ký ngay</Link>
        </p>
      
         
      </div>
    </div>
  );
}

export default Login;
