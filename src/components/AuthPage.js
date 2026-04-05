import React, { useState } from 'react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Đây là nơi bạn gọi API Node.js của mình
    if (isLogin) {
      console.log("Đang đăng nhập với:", { email: formData.email, password: formData.password });
      // Gọi API: POST /api/auth/login
    } else {
      console.log("Đang đăng ký với:", formData);
      // Gọi API: POST /api/auth/register
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-8">
          {isLogin ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              required
              className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="name@company.com"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Mật khẩu</label>
            <input
              type="password"
              required
              className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="••••••••"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700">Xác nhận mật khẩu</label>
              <input
                type="password"
                required
                className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="••••••••"
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
          >
            {isLogin ? 'Đăng nhập' : 'Đăng ký'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            {isLogin ? "Chưa có tài khoản? Đăng ký ngay" : "Đã có tài khoản? Đăng nhập"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
