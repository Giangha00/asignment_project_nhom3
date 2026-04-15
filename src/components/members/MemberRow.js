import React, { memo } from "react";
import { LogOut, XCircle } from "lucide-react";
import MemberAvatar from "./MemberAvatar";
import BadgeRole from "./BadgeRole";

const boardBtnClass =
  "inline-flex items-center gap-1 rounded-[3px] border border-[#3c444d] bg-[#3a3f44] px-2.5 py-1.5 text-xs text-[#dee4ea] hover:bg-[#454b51]";
const actionBtnClass = boardBtnClass;

/**
 * Một dòng trong danh sách thành viên (1 <li>).
 * avatarBackgroundClass tách ra khỏi member để không "nhét" field tạm vào object từ API.
 */
function MemberRowComponent({
  member,
  isCurrentMember,
  canRemoveOthers,
  onRemoveMember,
  onLeaveWorkspace,
  isBusy,
}) {
  const showRemoveOthers = Boolean(canRemoveOthers) && !isCurrentMember && typeof onRemoveMember === "function";

  return (
    <li className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <MemberAvatar
          name={member.name}
          username={member.handle}
          initials={member.initials}
          avatarUrl={member.avatarUrl}
          size={40}
        />
        <div className="min-w-0">
          <span className="font-semibold text-[#dee4ea]">{member.name}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-2">
        <span className="text-xs text-[#738496] sm:min-w-[10rem] sm:text-right">
          Lần hoạt động gần nhất {member.lastActive || "—"}
        </span>
        <BadgeRole
          label={member.role || "Quản trị viên"}
          ariaLabel={`Vai trò thành viên ${member.name || ""}: ${member.role || "Quản trị viên"}`}
        />
        {isCurrentMember ? (
          <button
            type="button"
            className={actionBtnClass}
            aria-label="Rời khỏi không gian làm việc"
            disabled={isBusy}
            onClick={() => onLeaveWorkspace?.(member)}
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            {isBusy ? "Đang xử lý…" : "Rời đi"}
          </button>
        ) : showRemoveOthers ? (
          <button
            type="button"
            className={actionBtnClass}
            disabled={isBusy}
            aria-label={`Loại bỏ ${member.name || "thành viên"} khỏi không gian làm việc`}
            onClick={() => onRemoveMember(member)}
          >
            <XCircle className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            {isBusy ? "Đang xử lý…" : "Loại bỏ"}
          </button>
        ) : null}
      </div>
    </li>
  );
}

const MemberRow = memo(MemberRowComponent, (prev, next) => {
  return (
    prev.member === next.member &&
    prev.isCurrentMember === next.isCurrentMember &&
    prev.canRemoveOthers === next.canRemoveOthers &&
    prev.isBusy === next.isBusy &&
    prev.onRemoveMember === next.onRemoveMember &&
    prev.onLeaveWorkspace === next.onLeaveWorkspace
  );
});
MemberRow.displayName = "MemberRow";

export default MemberRow;
