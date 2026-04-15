import React from "react";
import { X, UserPlus } from "lucide-react";

/**
 * Modal mời thành viên vào bảng.
 */
function InviteMemberModal({ boardMembers, inviteEmail, setInviteEmail, inviteLoading, inviteError, inviteSuccess, onSubmit, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/60 px-4 py-16" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-[#3c444d] bg-[#1d2125] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Mời thành viên vào bảng
          </h3>
          <button type="button" onClick={onClose} className="rounded p-1 text-[#9fadbc] hover:bg-white/10" aria-label="Đóng">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Nhập email thành viên"
            className="w-full rounded-lg border border-[#3c444d] bg-[#11161c] px-3 py-2 text-sm text-white outline-none focus:border-[#579dff]"
          />
          <button
            type="submit"
            disabled={inviteLoading}
            className="w-full rounded-lg bg-[#579dff] px-3 py-2 text-sm font-semibold text-[#0c1f3d] transition hover:bg-[#6cabff] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {inviteLoading ? "Đang mời..." : "Mời vào bảng"}
          </button>
        </form>

        {inviteError && <p className="mt-3 text-xs text-[#ff8f8f]">{inviteError}</p>}
        {inviteSuccess && <p className="mt-3 text-xs text-[#8fffb3]">{inviteSuccess}</p>}

        <div className="mt-4 border-t border-white/10 pt-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#8c9bab]">
            Thành viên trong bảng ({boardMembers.length})
          </p>
          <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
            {boardMembers.length === 0 ? (
              <p className="text-xs text-[#8c9bab]">Chưa có thành viên nào.</p>
            ) : (
              boardMembers.map((member) => (
                <div key={member.id || member.userId} className="flex items-center justify-between rounded-lg bg-[#11161c] px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-white">{member.name}</p>
                    <p className="truncate text-xs text-[#8c9bab]">{member.email || "-"}</p>
                  </div>
                  <span className="ml-3 rounded-md bg-[#2b323a] px-2 py-1 text-[11px] text-[#c8d1db]">
                    {member.role === "admin" ? "Quản trị viên" : "Thành viên"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InviteMemberModal;
