import React from "react";

/**
 * Wrapper card trắng dùng chung cho tất cả các trang auth (Login, Register, ForgotPassword, ResetPassword).
 * Cung cấp background gradient + white box center.
 */
function AuthCard({ title, subtitle, children }) {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white p-10 rounded-lg shadow-2xl w-full max-w-md">
        {title && (
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-gray-600 text-sm text-center mb-6">{subtitle}</p>
        )}
        {children}
      </div>
    </div>
  );
}

export default AuthCard;
