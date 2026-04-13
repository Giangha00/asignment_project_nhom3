import React from "react";

/**
 * Submit button dùng chung cho các trang auth với gradient + disabled/loading state.
 */
function AuthButton({ loading, loadingText, children, disabled }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full py-2 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? loadingText : children}
    </button>
  );
}

export default AuthButton;
