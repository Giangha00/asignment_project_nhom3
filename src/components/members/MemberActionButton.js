import React from "react";

const VARIANT_CLASS_MAP = {
  ghost:
    "border-[#3c444d] bg-[#111822] text-[#d4dce5] hover:border-[#579dff] hover:text-white",
  quiet:
    "border-transparent bg-[#1c222b] text-[#d4dce5] hover:bg-[#27303b] hover:text-white",
  danger:
    "border-[#4a2c2f] bg-[#211518] text-[#ffb8c0] hover:border-[#ff7b8c] hover:text-[#ffd7dc]",
};

function MemberActionButton({
  children,
  className = "",
  iconLeft,
  iconRight,
  onClick,
  variant = "ghost",
  type = "button",
  title,
}) {
  const variantClass = VARIANT_CLASS_MAP[variant] || VARIANT_CLASS_MAP.ghost;

  return (
    <button
      type={type}
      onClick={onClick}
      title={title}
      className={`inline-flex items-center justify-center gap-2 rounded-[10px] border px-3 py-2 text-sm font-medium transition ${variantClass} ${className}`}
    >
      {iconLeft}
      <span>{children}</span>
      {iconRight}
    </button>
  );
}

export default MemberActionButton;
