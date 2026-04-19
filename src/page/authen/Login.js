// React: thư viện UI; không cần import useState ở đây vì state nằm trong useLogin
import React from "react";
// Link: thẻ <a> của React Router — điều hướng client-side không reload app
import { Link } from "react-router-dom";
// Hook tách logic đăng nhập (API, navigate, lỗi) khỏi JSX
import { useLogin } from "../../hooks/useLogin";
// Khối card bọc form (style thống nhất màn auth)
import AuthCard from "../../components/auth/AuthCard";
// Ô input có label (tái sử dụng)
import AuthField from "../../components/auth/AuthField";
// Hiển thị dòng lỗi màu đỏ khi error !== ""
import AuthAlert from "../../components/auth/AuthAlert";
// Nút submit có trạng thái loading
import AuthButton from "../../components/auth/AuthButton";

/**
 * Component trang đăng nhập.
 * Props:
 * - onLoginSuccess: hàm App truyền vào — gọi sau khi POST /api/auth/login thành công với { user, token }.
 */
function Login({ onLoginSuccess }) {
  // Destructuring: lấy state và handleLogin từ hook; truyền onLoginSuccess xuống hook
  const { email, setEmail, password, setPassword, error, loading, handleLogin } =
    useLogin({ onLoginSuccess });

  return (
    // Khung card tiêu đề "Đăng Nhập"
    <AuthCard title="Đăng Nhập">
      {/* Hiện message lỗi từ server hoặc validate client; ẩn khi error rỗng */}
      <AuthAlert message={error} />
      {/* onSubmit={handleLogin}: Enter hoặc click nút sẽ gọi handleLogin (preventDefault + gọi API) */}
      <form onSubmit={handleLogin}>
        <AuthField
          id="email" // id HTML — liên kết label / accessibility
          label="Email:" // Nhãn hiển thị bên cạnh ô
          type="email" // Trình duyệt gợi ý định dạng email + bàn phím phù hợp mobile
          value={email} // Controlled component: giá trị luôn đồng bộ state React
          onChange={(e) => setEmail(e.target.value)} // Mỗi ký tự gõ cập nhật state email
          placeholder="Nhập email của bạn" // Gợi ý trong ô khi trống
          autoComplete="email" // Trình duyệt có thể gợi ý email đã lưu
        />
        <AuthField
          id="password"
          label="Mật khẩu:"
          type="password" // Ẩn ký tự khi gõ
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nhập mật khẩu"
          autoComplete="current-password" // Gợi ý điền mật khẩu đã lưu cho trang login
        />
        {/* loading: vô hiệu hóa nút + đổi chữ; type submit kích hoạt onSubmit form */}
        <AuthButton loading={loading} loadingText="Đang đăng nhập...">
          Đăng Nhập
        </AuthButton>
      </form>
      {/* Hàng link phụ: quên mật khẩu / đăng ký — không gọi API, chỉ đổi route */}
      <p className="text-center text-gray-600 text-sm mt-4">
        <Link to="/forgot-password" className="text-indigo-600 font-semibold hover:text-purple-600 mr-2">
          Quên mật khẩu?
        </Link>
        <Link to="/register" className="text-indigo-600 font-semibold hover:text-purple-600">
          Đăng ký ngay
        </Link>
      </p>
    </AuthCard>
  );
}

// Cho phép import default: import Login from "./Login"
export default Login;
