import React from "react";
import { ChevronDown, Info, X } from "lucide-react";
import MemberAvatar from "./MemberAvatar";
import MemberActionButton from "./MemberActionButton";

const DEFAULT_LABELS = {
  admin: "Quản trị viên",
  member: "Thành viên",
  leave: "Rời đi",
  remove: "Loại bỏ",
  lastActivePrefix: "Lần hoạt động gần nhất",
  boards: "Bảng",
  infoRole: "Thông tin quyền",
};

const isDateLike = (value) => {
  if (!value) return false;
  if (value instanceof Date) return !Number.isNaN(value.getTime());
  const timestamp = Date.parse(value);
  return !Number.isNaN(timestamp);
};

const formatLastActive = (lastActive) => {
  if (!lastActive) return "-";
  if (!isDateLike(lastActive)) return String(lastActive);

  const date = lastActive instanceof Date ? lastActive : new Date(lastActive);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
};

const resolveRole = (role, labels) => {
  const roleText = String(role || "").toLowerCase();
  const isAdmin = roleText.includes("admin") || roleText.includes("quản trị");
  return {
    isAdmin,
    label: isAdmin ? labels.admin : role || labels.member,
  };
};

function MemberItem({
  member,
  labels,
  onBoardsClick,
  onLeave,
  onRemove,
}) {
  const mergedLabels = { ...DEFAULT_LABELS, ...(labels || {}) };
  const {
    name,
    username,
    avatarUrl,
    accentColor,
    initials,
    lastActive,
    role,
    boardsCount,
    isCurrentUser,
  } = member || {};

  const roleState = resolveRole(role, mergedLabels);
  const resolvedLastActive = formatLastActive(lastActive);
  const resolvedBoardsCount = Number.isFinite(boardsCount) ? Math.max(boardsCount, 0) : null;
  const hasBoardsDropdown = resolvedBoardsCount !== null && resolvedBoardsCount > 0;
  const shouldShowLeave = roleState.isAdmin || Boolean(isCurrentUser);

  return (
    <div className="flex flex-col gap-4 rounded-[14px] border border-[#242b33] bg-[#181f25] px-4 py-3 text-sm transition hover:border-[#3a4550] hover:bg-[#1c242d] sm:flex-row sm:items-center">
      <div className="min-w-0 flex-[1.4]">
        <div className="flex items-center gap-3">
          <MemberAvatar
            name={name}
            username={username}
            initials={initials}
            avatarUrl={avatarUrl}
            accentColor={accentColor}
          />
          <div className="min-w-0">
            <div className="truncate text-[20px] font-semibold leading-6 text-white">{name || username || "-"}</div>
            <div className="truncate text-sm text-[#9fadbc]">@{username || "unknown"}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 text-base text-[#d4dce5]">
        <span className="text-[#9fadbc]">{mergedLabels.lastActivePrefix}</span> {resolvedLastActive}
      </div>

      <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
        {hasBoardsDropdown && (
          <MemberActionButton
            onClick={() => onBoardsClick?.(member)}
            iconRight={<ChevronDown size={16} />}
          >
            {`${mergedLabels.boards} (${resolvedBoardsCount})`}
          </MemberActionButton>
        )}

        <MemberActionButton
          iconRight={roleState.isAdmin ? <Info size={16} aria-label={mergedLabels.infoRole} /> : null}
          title={mergedLabels.infoRole}
          variant="quiet"
          className="cursor-default"
        >
          {roleState.label}
        </MemberActionButton>

        {shouldShowLeave ? (
          <MemberActionButton onClick={() => onLeave?.(member)} variant="ghost">
            {mergedLabels.leave}
          </MemberActionButton>
        ) : (
          <MemberActionButton
            onClick={() => onRemove?.(member)}
            variant="danger"
            iconLeft={<X size={16} />}
          >
            {mergedLabels.remove}
          </MemberActionButton>
        )}
      </div>
    </div>
  );
}

export default MemberItem;
