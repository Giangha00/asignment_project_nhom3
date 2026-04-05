import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Kiểm tra mật khẩu
    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    // Kiểm tra email phải có đuôi @gmail.com
    if (!email.endsWith('@gmail.com')) {
      setError('email không tồn tại');
      return;
    }

    setLoading(true);

    try {
      // Lấy danh sách users đã đăng ký
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

      // Kiểm tra email đã tồn tại
      const existingUser = registeredUsers.find(u => u.email === email);
      if (existingUser) {
        setError('Email đã được sử dụng');
        setLoading(false);
        return;
      }

      // Kiểm tra username đã tồn tại
      const existingUsername = registeredUsers.find(u => u.username === username);
      if (existingUsername) {
        setError('Tên người dùng đã được sử dụng');
        setLoading(false);
        return;
      }

      // Tạo user mới
      const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password, // Trong thực tế nên hash password
        createdAt: new Date().toISOString()
      };

      // Thêm vào danh sách
      registeredUsers.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

      // Hiển thị thông báo thành công
      setSuccess('Đăng ký thành công! Chuyển hướng đến trang đăng nhập...');
      
      // Chuyển hướng tới trang đăng nhập sau 2 giây
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white p-10 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Đăng Ký</h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-6 border border-red-300">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 text-green-700 px-4 py-3 rounded mb-6 border border-green-300">
            {success}
          </div>
        )}
        
        <form onSubmit={handleRegister}>
          <div className="mb-5">
            <label htmlFor="username" className="block text-gray-700 font-semibold mb-2 text-sm">
              Tên người dùng:
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Nhập tên người dùng"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

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

          <div className="mb-5">
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-2 text-sm">
              Mật khẩu:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-gray-700 font-semibold mb-2 text-sm">
              Xác nhận mật khẩu:
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Nhập lại mật khẩu"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Đã có tài khoản? <Link to="/login" className="text-indigo-600 font-semibold hover:text-purple-600">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
