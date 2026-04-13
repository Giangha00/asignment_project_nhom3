import React, { memo } from "react";
import PropTypes from "prop-types";
import { ChevronUp } from "lucide-react";

/**
 * Avatar tròn: hoặc ảnh (nếu có avatarUrl), hoặc chữ viết tắt trên nền gradient.
 * memo: nếu props không đổi thì không render lại — nhẹ hơn khi danh sách dài.
 */
function MemberAvatarComponent({
  name = "",
  initials = "",
  avatarUrl = "",
  backgroundClass,
  showCornerBadge = true,
}) {
  const displayName = name?.trim() || "Thành viên";
  // Dùng cho alt (ảnh) và aria-label (chữ) — trình đọc màn hình hiểu đây là ảnh đại diện ai
  const label = `Ảnh đại diện của ${displayName}`;
  const letter = initials?.trim() || "?";

  return (
    <div className="relative shrink-0">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={label}
          className="h-10 w-10 rounded-full object-cover"
        />
      ) : (
        // Không có ảnh: không dùng <img> rỗng — dùng role="img" + aria-label tương đương alt
        <div
          role="img"
          aria-label={label}
          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${backgroundClass}`}
        >
          {letter}
        </div>
      )}
      {showCornerBadge && (
        <span
          className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-[#22272b] bg-[#3c444d] text-[#9fadbc]"
          aria-hidden
        >
          <ChevronUp className="h-2.5 w-2.5" strokeWidth={2.5} />
        </span>
      )}
    </div>
  );
}

MemberAvatarComponent.propTypes = {
  name: PropTypes.string,
  initials: PropTypes.string,
  avatarUrl: PropTypes.string,
  backgroundClass: PropTypes.string.isRequired,
  showCornerBadge: PropTypes.bool,
};

const MemberAvatar = memo(MemberAvatarComponent);
MemberAvatar.displayName = "MemberAvatar";

export default MemberAvatar;
