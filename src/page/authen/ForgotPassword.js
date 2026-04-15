import React from "react";
import { Link } from "react-router-dom";
import { useForgotPassword } from "../../hooks/useForgotPassword";
import AuthCard from "../../components/auth/AuthCard";
import AuthField from "../../components/auth/AuthField";
import AuthAlert from "../../components/auth/AuthAlert";
import AuthButton from "../../components/auth/AuthButton";

function ForgotPassword({ onEmailReady }) {
  const { email, setEmail, message, error, loading, handleSubmit } =
    useForgotPassword({ onEmailReady });

  return (
    <AuthCard
      title="Quên mật khẩu"
      subtitle="Nhập email đã đăng ký để tiếp tục đặt lại mật khẩu."
    >
      <AuthAlert message={message} variant="success" />
      <AuthAlert message={error} />
      <form onSubmit={handleSubmit}>
        <AuthField
          id="email"
          label="Email:"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email của bạn"
          autoComplete="email"
        />
        <AuthButton loading={loading} loadingText="Đang gửi...">
          Tiếp tục
        </AuthButton>
      </form>
      <p className="text-center text-gray-600 text-sm mt-6">
        Đã nhớ mật khẩu?{" "}
        <Link to="/" className="text-indigo-600 font-semibold hover:text-purple-600">
          Quay lại đăng nhập
        </Link>
      </p>
    </AuthCard>
  );
}

export default ForgotPassword;
