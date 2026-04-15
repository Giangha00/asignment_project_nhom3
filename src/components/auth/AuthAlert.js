import React from "react";

/**
 * Alert box dùng chung cho error và success ở các trang auth.
 * variant: "error" | "success"
 */
function AuthAlert({ message, variant = "error" }) {
  if (!message) return null;

  const styles =
    variant === "success"
      ? "bg-green-100 text-green-700 border border-green-300"
      : "bg-red-100 text-red-700 border border-red-300";

  return (
    <div className={`px-4 py-3 rounded mb-6 text-sm ${styles}`}>
      {message}
    </div>
  );
}

export default AuthAlert;
