import React from "react";
import { ChevronDown, Link2, X } from "lucide-react";
import MemberAvatar from "../members/MemberAvatar";

function handleFromEmail(email) {
  if (!email) return "—";
  const local = String(email).split("@")[0];
  return `@${local}`;
}

/**
 * Modal chia sẻ bảng — bố cục theo Trello (chỉ giao diện; hành vi mời giữ nguyên hook).
 */
function InviteMemberModal({
  boardName = "bảng",
  currentUserId,
  boardMembers,
  inviteEmail,
  setInviteEmail,
  inviteLoading,
  inviteError,
  inviteSuccess,
  onSubmit,
  onClose,
}) {
  const tabTitle = `Thành viên của bảng ${boardName}`;

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center bg-black/55 px-3 py-10 sm:py-14"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-xl rounded-xl border border-[#3c444d] bg-[#1d2125] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="share-board-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#3c444d] px-4 py-3 sm:px-5">
          <h2 id="share-board-title" className="text-lg font-semibold text-white">
            Chia sẻ bảng
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 text-[#9fadbc] hover:bg-white/10 hover:text-white"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <div className="space-y-4 px-4 py-4 sm:px-5">
          {/* Hàng mời: input + vai trò (chỉ hiển thị) + Chia sẻ */}
          <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-2">
            <input
              type="text"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Địa chỉ email hoặc tên"
              autoComplete="off"
              className="min-w-0 flex-1 rounded-md border border-[#3c444d] bg-[#22272b] px-3 py-2 text-sm text-[#dee4ea] placeholder:text-[#738496] outline-none focus:border-[#579dff]"
            />
            <div className="flex shrink-0 gap-2">
              <div
                className="flex min-w-[7.5rem] cursor-default items-center justify-between gap-1 rounded-md border border-[#3c444d] bg-[#282e33] px-2.5 py-2 text-sm text-[#9fadbc]"
                aria-hidden
              >
                Thành viên
                <ChevronDown className="h-4 w-4 shrink-0 opacity-70" />
              </div>
              <button
                type="submit"
                disabled={inviteLoading}
                className="rounded-md bg-[#579dff] px-4 py-2 text-sm font-semibold text-[#0c1f3d] transition hover:bg-[#85b8ff] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {inviteLoading ? "Đang gửi…" : "Chia sẻ"}
              </button>
            </div>
          </form>

          {inviteError && <p className="text-xs text-[#ff8f8f]">{inviteError}</p>}
          {inviteSuccess && <p className="text-xs text-[#8fffb3]">{inviteSuccess}</p>}

          {/* Liên kết — chỉ giao diện */}
          <div className="flex gap-3 rounded-md border border-[#3c444d]/80 bg-[#22272b]/80 px-3 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#333c43] text-[#9fadbc]">
              <Link2 className="h-4 w-4" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#dee4ea]">Chia sẻ bảng này bằng liên kết</p>
              <button
                type="button"
                tabIndex={-1}
                className="mt-0.5 cursor-default text-left text-sm font-medium text-[#579dff] hover:underline"
              >
                Tạo liên kết
              </button>
            </div>
          </div>

          {/* Tab + danh sách */}
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-[#3c444d] pb-2">
              <span className="border-b-2 border-[#579dff] pb-2 text-sm font-semibold text-[#579dff]">
                {tabTitle}
              </span>
              <span className="rounded bg-[#333c43] px-2 py-0.5 text-xs font-medium text-[#9fadbc]">
                {boardMembers.length}
              </span>
            </div>

            <div className="max-h-[min(50vh,22rem)] space-y-0 overflow-y-auto pr-1">
              {boardMembers.length === 0 ? (
                <p className="py-6 text-center text-sm text-[#738496]">Chưa có thành viên nào.</p>
              ) : (
                boardMembers.map((member) => {
                  const isSelf =
                    currentUserId &&
                    member.userId &&
                    String(member.userId) === String(currentUserId);
                  const boardAdmin = member.role === "admin";
                  const subLine = `${handleFromEmail(member.email)} • ${
                    boardAdmin ? "Quản trị viên bảng" : "Thành viên bảng"
                  }`;

                  return (
                    <div
                      key={member.id || member.userId}
                      className="flex items-center gap-3 border-b border-[#3c444d]/60 py-3 last:border-0"
                    >
                      <MemberAvatar
                        name={member.name}
                        username={member.email}
                        avatarUrl={member.avatarUrl}
                        size={40}
                        className="shrink-0 ring-2 ring-[#1d2125]"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#dee4ea]">
                          {member.name}
                          {isSelf ? (
                            <span className="font-normal text-[#9fadbc]"> (bạn)</span>
                          ) : null}
                        </p>
                        <p className="truncate text-xs text-[#738496]">{subLine}</p>
                      </div>
                      <div
                        className={`flex shrink-0 items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium ${
                          boardAdmin
                            ? "cursor-not-allowed border-[#3c444d] bg-[#2b323a] text-[#738496]"
                            : "border-[#dfe4e8] bg-[#f6f7f9] text-[#172b4d]"
                        }`}
                        aria-hidden
                      >
                        {boardAdmin ? "Quản trị viên" : "Thành viên"}
                        <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InviteMemberModal;
