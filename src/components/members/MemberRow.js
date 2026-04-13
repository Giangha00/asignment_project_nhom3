import React, { memo } from "react";
import PropTypes from "prop-types";
import { ChevronDown, LogOut, XCircle } from "lucide-react";
import MemberAvatar from "./MemberAvatar";
import BadgeRole from "./BadgeRole";
import { workspaceMemberPropType } from "./memberPropTypes";

const boardBtnClass =
  "inline-flex items-center gap-1 rounded-[3px] border border-[#3c444d] bg-[#3a3f44] px-2.5 py-1.5 text-xs text-[#dee4ea] hover:bg-[#454b51]";
const actionBtnClass = boardBtnClass;

/**
 * Một dòng trong danh sách thành viên (1 <li>).
 * avatarBackgroundClass tách ra khỏi member để không "nhét" field tạm vào object từ API.
 */
function MemberRowComponent({ member, boardLabel, isCurrentMember, avatarBackgroundClass }) {
  return (
    <li className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <MemberAvatar
          name={member.name}
          initials={member.initials}
          avatarUrl={member.avatarUrl}
          backgroundClass={avatarBackgroundClass}
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
            <span className="font-semibold text-[#dee4ea]">{member.name}</span>
            <span className="text-sm text-[#738496]">{member.handle}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-2">
        <span className="text-xs text-[#738496] sm:min-w-[10rem] sm:text-right">
          Lần hoạt động gần nhất {member.lastActive || "—"}
        </span>
        <button
          type="button"
          className={boardBtnClass}
          aria-label={`Số bảng tham gia: ${boardLabel}. Mở tùy chọn.`}
        >
          {boardLabel}
          <ChevronDown className="h-3.5 w-3.5 opacity-80" aria-hidden />
        </button>
        <BadgeRole
          label={member.role || "Quản trị viên"}
          ariaLabel={`Vai trò thành viên ${member.name || ""}: ${member.role || "Quản trị viên"}`}
        />
        {isCurrentMember ? (
          <button type="button" className={actionBtnClass} aria-label="Rời khỏi không gian làm việc">
            <LogOut className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Rời đi
          </button>
        ) : (
          <button
            type="button"
            className={actionBtnClass}
            aria-label={`Loại bỏ ${member.name || "thành viên"} khỏi không gian làm việc`}
          >
            <XCircle className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Loại bỏ
          </button>
        )}
      </div>
    </li>
  );
}

MemberRowComponent.propTypes = {
  member: workspaceMemberPropType.isRequired,
  boardLabel: PropTypes.string.isRequired,
  isCurrentMember: PropTypes.bool.isRequired,
  avatarBackgroundClass: PropTypes.string.isRequired,
};

/**
 * memo + hàm so sánh tùy chỉnh: chỉ render lại hàng này khi member / nhãn / cờ "là tôi" / màu avatar thật sự đổi.
 * Giúp khi cha (ContentMembers) re-render vì gõ ô search, các hàng không đổi vẫn bỏ qua render.
 */
const MemberRow = memo(MemberRowComponent, (prev, next) => {
  return (
    prev.member === next.member &&
    prev.boardLabel === next.boardLabel &&
    prev.isCurrentMember === next.isCurrentMember &&
    prev.avatarBackgroundClass === next.avatarBackgroundClass
  );
});
MemberRow.displayName = "MemberRow";

export default MemberRow;
