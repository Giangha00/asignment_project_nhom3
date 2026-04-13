import React from "react";
import { Link } from "react-router-dom";
import { useResetPassword } from "../../hooks/useResetPassword";
import AuthCard from "../../components/auth/AuthCard";
import AuthField from "../../components/auth/AuthField";
import AuthAlert from "../../components/auth/AuthAlert";
import AuthButton from "../../components/auth/AuthButton";

function ResetPassword({ pendingEmail }) {
  const {
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    error, message, loading,
    handleResetPassword,
  } = useResetPassword({ pendingEmail });

  return (
    <AuthCard title="Đặt lại mật khẩu" subtitle="Nhập mật khẩu mới của bạn">
      <AuthAlert message={error} />
      <AuthAlert message={message} variant="success" />
      <form onSubmit={handleResetPassword}>
        <AuthField
          id="newPassword"
          label="Mật khẩu mới:"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Nhập mật khẩu mới"
          autoComplete="new-password"
        />
        <AuthField
          id="confirmPassword"
          label="Xác nhận mật khẩu:"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Nhập lại mật khẩu mới"
          autoComplete="new-password"
        />
        <AuthButton loading={loading} loadingText="Đang xử lý...">
          Đặt lại mật khẩu
        </AuthButton>
      </form>
      <p className="text-center text-gray-600 text-sm mt-6">
        <Link to="/forgot-password" className="text-indigo-600 font-semibold hover:text-purple-600 mr-2">
          Quay lại
        </Link>
        <Link to="/" className="text-indigo-600 font-semibold hover:text-purple-600">
          Trở về trang đăng nhập
        </Link>
      </p>
    </AuthCard>
  );
}

export default ResetPassword;
