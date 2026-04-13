import React, { memo } from "react";
import PropTypes from "prop-types";
import { Info } from "lucide-react";

const baseBtn =
  "inline-flex items-center gap-1 rounded-[3px] border border-[#3c444d] bg-[#3a3f44] px-2.5 py-1.5 text-xs text-[#dee4ea] hover:bg-[#454b51]";

/**
 * Nút hiển thị vai trò (vd: Quản trị viên / Thành viên).
 * Tách riêng để MemberRow gọn và sau này gắn onClick mở menu đổi quyền ở một chỗ.
 */
function BadgeRoleComponent({ label = "", onClick, ariaLabel = "" }) {
  const resolvedLabel = label || "Quản trị viên";
  return (
    <button
      type="button"
      onClick={onClick}
      className={baseBtn}
      aria-label={
        ariaLabel.trim() ? ariaLabel : `Vai trò: ${resolvedLabel}. Xem thông tin quyền.`
      }
    >
      {resolvedLabel}
      <Info className="h-3.5 w-3.5 opacity-70" aria-hidden />
    </button>
  );
}

BadgeRoleComponent.propTypes = {
  label: PropTypes.string,
  onClick: PropTypes.func,
  ariaLabel: PropTypes.string,
};

const BadgeRole = memo(BadgeRoleComponent);
BadgeRole.displayName = "BadgeRole";

export default BadgeRole;
