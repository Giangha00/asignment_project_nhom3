import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function ResetPassword() {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      // Lấy OTP từ localStorage
      const otpData = JSON.parse(localStorage.getItem('otpData') || '{}');

      if (!otpData.otp || !otpData.email) {
        setError('Vui lòng yêu cầu OTP trước');
        setLoading(false);
        return;
      }

      // Kiểm tra OTP
      if (otp !== otpData.otp) {
        setError('OTP không đúng');
        setLoading(false);
        return;
      }

      // Kiểm tra OTP hết hạn (1 phút)
      const otpTime = new Date(otpData.createdAt).getTime();
      const currentTime = new Date().getTime();
      const otpExpireTime = 1 * 60 * 1000; // 1 phút

      if (currentTime - otpTime > otpExpireTime) {
        setError('OTP đã hết hạn. Vui lòng yêu cầu OTP mới');
        localStorage.removeItem('otpData');
        setLoading(false);
        return;
      }

      // Kiểm tra mật khẩu mới
      if (newPassword !== confirmPassword) {
        setError('Mật khẩu mới không khớp');
        setLoading(false);
        return;
      }

      if (newPassword.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự');
        setLoading(false);
        return;
      }

      // Lấy danh sách users
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

      // Tìm user và cập nhật mật khẩu
      const userIndex = registeredUsers.findIndex(u => u.email === otpData.email);
      if (userIndex !== -1) {
        registeredUsers[userIndex].password = newPassword;
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
      }

      // Xóa OTP data
      localStorage.removeItem('otpData');

      setMessage('✅ Mật khẩu đã được đặt lại thành công!');
      
      // Chuyển hướng tới login sau 2 giây
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
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Đặt lại mật khẩu</h2>
        <p className="text-gray-600 text-sm text-center mb-6">Nhập OTP và mật khẩu mới của bạn</p>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-6 border border-red-300">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-100 text-green-700 px-4 py-3 rounded mb-6 border border-green-300">
            {message}
          </div>
        )}

        <form onSubmit={handleResetPassword}>
          <div className="mb-5">
            <label htmlFor="otp" className="block text-gray-700 font-semibold mb-2 text-sm">
              Mã OTP:
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              placeholder="Nhập mã OTP"
              maxLength="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <p className="text-gray-500 text-xs mt-2">💡 Mã OTP có hiệu lực 1 phút</p>
          </div>

          <div className="mb-5">
            <label htmlFor="newPassword" className="block text-gray-700 font-semibold mb-2 text-sm">
              Mật khẩu mới:
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Nhập mật khẩu mới"
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
              placeholder="Nhập lại mật khẩu mới"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
        <Link to="/forgot-password" className="text-indigo-600 font-semibold hover:text-purple-600 td">quay lại</Link>
        <Link to="/login" className="text-indigo-600 font-semibold hover:text-purple-600 td">trở về trang đăng nhập</Link>

        </p>

    
        
      </div>
    </div>
  );
}

export default ResetPassword;
