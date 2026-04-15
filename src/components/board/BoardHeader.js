import React from "react";
import { Globe, LayoutGrid, MoreHorizontal, Star, UserPlus } from "lucide-react";
import MemberAvatar from "../members/MemberAvatar";

const AVATAR_SIZE = 32;
const MAX_VISIBLE = 4;

function MemberAvatarStack({ members = [], onInviteClick }) {
  const visible = members.slice(0, MAX_VISIBLE);
  const overflow = members.length - MAX_VISIBLE;

  return (
    <div className="flex items-center">
      {/* Stack avatar chồng lên nhau như Trello */}
      <div className="flex items-center" style={{ marginRight: visible.length ? 6 : 0 }}>
        {visible.map((m, idx) => (
          <div
            key={m.id || m.userId || idx}
            title={m.name || m.email || "Thành viên"}
            style={{
              marginLeft: idx === 0 ? 0 : -8,
              zIndex: MAX_VISIBLE - idx,
              position: "relative",
            }}
          >
            <MemberAvatar
              name={m.name}
              username={m.email}
              avatarUrl={m.avatarUrl}
              initials={m.initials}
              accentColor={m.accentColor}
              size={AVATAR_SIZE}
              className="ring-2 ring-[#181f25]"
            />
          </div>
        ))}
        {overflow > 0 && (
          <div
            title={`Còn ${overflow} thành viên khác`}
            aria-label={`Và ${overflow} thành viên nữa`}
            className="flex items-center justify-center rounded-full ring-2 ring-[#181f25] bg-[#3a4550] text-[11px] font-semibold text-[#dee4ea]"
            style={{ height: AVATAR_SIZE, width: AVATAR_SIZE, marginLeft: -8, zIndex: 0, position: "relative" }}
          >
            +{overflow}
          </div>
        )}
      </div>

      {/* Nút mời thành viên */}
      <button
        type="button"
        title="Mời thành viên vào bảng"
        onClick={onInviteClick}
        aria-label="Mời thành viên vào bảng"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[#9fadbc] transition hover:bg-white/20 hover:text-white"
      >
        <UserPlus className="h-4 w-4" />
      </button>
    </div>
  );
}

function BoardHeader({ boardName, workspaceName, onInviteClick, boardMembers = [] }) {
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-4">
      {/* ── Left: tên bảng + các nút điều hướng ── */}
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <h1 className="truncate text-lg font-bold text-white sm:text-xl">{boardName}</h1>
        <button type="button" className="rounded-md p-1.5 text-[#9fadbc] hover:bg-white/10" aria-label="Đánh dấu sao">
          <Star className="h-4 w-4" />
        </button>
        <button type="button" className="rounded-md p-1.5 text-[#9fadbc] hover:bg-white/10" aria-label="Chế độ xem">
          <LayoutGrid className="h-4 w-4" />
        </button>
        <span className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[#9fadbc]">
          <Globe className="h-3.5 w-3.5" /> Hiển thị
        </span>
        {workspaceName && (
          <span className="ml-2 border-l border-[#3c444d] pl-3 text-xs text-[#6b7785]">
            Không gian: {workspaceName}
          </span>
        )}
      </div>

      {/* ── Right: avatar thành viên + chia sẻ + menu ── */}
      <div className="flex items-center gap-3">
        {/* Stack avatar thành viên của bảng */}
        <MemberAvatarStack members={boardMembers} onInviteClick={onInviteClick} />

        {/* Nút Chia sẻ (label) */}
        <button
          type="button"
          onClick={onInviteClick}
          className="hidden items-center gap-1.5 rounded-md border border-[#3c444d] bg-[#2c333a] px-3 py-1.5 text-sm font-medium text-[#9fadbc] hover:border-[#579dff] hover:text-white transition-colors sm:flex"
        >
          <UserPlus className="h-4 w-4" />
          Chia sẻ
        </button>

        <button type="button" className="rounded-md p-1.5 text-[#9fadbc] hover:bg-white/10" aria-label="Thêm tuỳ chọn">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default BoardHeader;
