import React from "react";

/**
 * Input field dùng chung: label + input.
 * Giảm lặp code giữa các trang auth.
 */
function AuthField({ id, label, type = "text", value, onChange, placeholder, required = true, autoComplete }) {
  return (
    <div className="mb-5">
      <label htmlFor={id} className="block text-gray-700 font-semibold mb-2 text-sm">
        {label}
      </label>
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
      />
    </div>
  );
}

export default AuthField;
