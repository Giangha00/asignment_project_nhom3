import React from "react";
import { Link } from "react-router-dom";
import { useRegister } from "../../hooks/useRegister";
import AuthCard from "../../components/auth/AuthCard";
import AuthField from "../../components/auth/AuthField";
import AuthAlert from "../../components/auth/AuthAlert";
import AuthButton from "../../components/auth/AuthButton";

function Register() {
  const {
    username, setUsername,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    error, loading,
    handleRegister,
  } = useRegister();

  return (
    <AuthCard title="Đăng Ký">
      <AuthAlert message={error} />
      <form onSubmit={handleRegister}>
        <AuthField
          id="username"
          label="Tên người dùng:"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Nhập tên người dùng"
          autoComplete="name"
        />
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
          placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
          autoComplete="new-password"
        />
        <AuthField
          id="confirmPassword"
          label="Xác nhận mật khẩu:"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Nhập lại mật khẩu"
          autoComplete="new-password"
        />
        <AuthButton loading={loading} loadingText="Đang đăng ký...">
          Đăng Ký
        </AuthButton>
      </form>
      <p className="text-center text-gray-600 text-sm mt-6">
        Đã có tài khoản?{" "}
        <Link to="/" className="text-indigo-600 font-semibold hover:text-purple-600">
          Đăng nhập
        </Link>
      </p>
    </AuthCard>
  );
}

export default Register;
