import React from "react";
import { Link } from "react-router-dom";
import { useLogin } from "../../hooks/useLogin";
import AuthCard from "../../components/auth/AuthCard";
import AuthField from "../../components/auth/AuthField";
import AuthAlert from "../../components/auth/AuthAlert";
import AuthButton from "../../components/auth/AuthButton";

function Login({ onLoginSuccess }) {
  const { email, setEmail, password, setPassword, error, loading, handleLogin } =
    useLogin({ onLoginSuccess });

  return (
    <AuthCard title="Đăng Nhập">
      <AuthAlert message={error} />
      <form onSubmit={handleLogin}>
        <AuthField
          id="email"
          label="Email:"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email của bạn"
          autoComplete="email"
        />
        <AuthField
          id="password"
          label="Mật khẩu:"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nhập mật khẩu"
          autoComplete="current-password"
        />
        <AuthButton loading={loading} loadingText="Đang đăng nhập...">
          Đăng Nhập
        </AuthButton>
      </form>
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

export default Login;
