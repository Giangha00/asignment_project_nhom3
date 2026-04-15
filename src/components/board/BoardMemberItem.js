import React, { memo, useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { AlertCircle, Check, ChevronDown, Loader2, LogOut, X } from "lucide-react";
import MemberAvatar from "../members/MemberAvatar";

// ─── Role config ──────────────────────────────────────────────────────────────

const ROLE_OPTIONS = [
  { value: "admin", label: "Quản trị viên" },
  { value: "member", label: "Thành viên" },
  { value: "observer", label: "Quan sát viên" },
];

const ROLE_LABEL = {
  admin: "Quản trị viên",
  member: "Thành viên",
  observer: "Quan sát viên",
};

const ROLE_COLOR = {
  admin: "text-[#579dff]",
  member: "text-[#dee4ea]",
  observer: "text-[#9fadbc]",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * So sánh id của thành viên với id người dùng đang đăng nhập.
 * member.userId: id người dùng trong document boardMember (populate hoặc string).
 * member.id: id của document boardMember.
 */
function resolveIsCurrentUser(member, currentUserId) {
  if (!currentUserId || !member) return false;
  const cid = String(currentUserId);
  const userId = String(member.userId || "");
  return userId !== "" && userId === cid;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * BoardMemberItem — một dòng thành viên trong bảng.
 *
 * Props:
 *   member         – object thành viên { id, userId, role, name, email, avatarUrl, initials, accentColor }
 *   currentUserId  – id người dùng đang đăng nhập (để hiện nhãn "Bạn" và nút "Rời đi")
 *   canEdit        – người dùng hiện tại có quyền chỉnh sửa hay không
 *   onRoleChange   – async (memberId, newRole) => void   | được gọi khi đổi vai trò
 *   onRemove       – async (memberId) => void            | được gọi khi xóa / rời bảng
 *   disabled       – khoá toàn bộ tương tác (loading từ component cha)
 */
function BoardMemberItemComponent({
  member,
  currentUserId,
  canEdit = false,
  onRoleChange,
  onRemove,
  disabled = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const menuRef = useRef(null);

  const isCurrentUser = resolveIsCurrentUser(member, currentUserId);
  const role = member?.role || "member";
  const roleLabel = ROLE_LABEL[role] || role;
  const isInteracting = isUpdating || isRemoving || disabled;

  // ── Đóng menu khi click ra ngoài ──────────────────────────────────────────
  useEffect(() => {
    if (!menuOpen) return undefined;
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuOpen]);

  // ── Xoá error khi member thay đổi (vd: sau khi cập nhật thành công từ cha) ─
  useEffect(() => {
    setUpdateError("");
  }, [member]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleRoleChange = async (newRole) => {
    if (newRole === role || !onRoleChange || isInteracting) return;
    setMenuOpen(false);
    setUpdateError("");
    setIsUpdating(true);
    try {
      await Promise.resolve(onRoleChange(member.id, newRole));
    } catch (err) {
      setUpdateError(
        err?.response?.data?.message ||
          err?.message ||
          "Cập nhật quyền thất bại. Vui lòng thử lại.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (!onRemove || isInteracting) return;
    setUpdateError("");
    setIsRemoving(true);
    try {
      await Promise.resolve(onRemove(member.id));
    } catch (err) {
      setUpdateError(
        err?.response?.data?.message ||
          err?.message ||
          (isCurrentUser
            ? "Không thể rời bảng. Vui lòng thử lại."
            : "Không thể xóa thành viên. Vui lòng thử lại."),
      );
    } finally {
      setIsRemoving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className={[
        "flex flex-col gap-3 rounded-[14px] border border-[#242b33] bg-[#181f25] px-4 py-3 text-sm transition",
        isInteracting
          ? "pointer-events-none opacity-60"
          : "hover:border-[#3a4550] hover:bg-[#1c242d]",
      ].join(" ")}
    >
      {/* ── Dòng chính: avatar + danh tính + quyền + hành động ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Avatar + danh tính */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <MemberAvatar
            name={member?.name}
            username={member?.email}
            initials={member?.initials}
            avatarUrl={member?.avatarUrl}
            accentColor={member?.accentColor}
            size={36}
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="truncate font-semibold text-[#dee4ea]">
                {member?.name || member?.email || "Thành viên"}
              </span>
              {/* Nhãn "Bạn" */}
              {isCurrentUser && (
                <span
                  aria-label="Đây là bạn"
                  className="rounded-full bg-[#1c3a5a] px-2 py-0.5 text-[11px] font-medium text-[#579dff]"
                >
                  Bạn
                </span>
              )}
            </div>
            {member?.email && (
              <div className="truncate text-xs text-[#738496]">{member.email}</div>
            )}
          </div>
        </div>

        {/* Quyền + hành động */}
        <div className="flex flex-wrap items-center justify-end gap-2">
          {/* ── Bộ chọn quyền (canEdit) hoặc badge chỉ đọc ── */}
          {canEdit ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                disabled={isInteracting}
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={menuOpen}
                aria-label={`Vai trò hiện tại: ${roleLabel}. Nhấn để thay đổi.`}
                className={[
                  "inline-flex items-center gap-1.5 rounded-[6px] border border-[#3c444d] bg-[#2a3038] px-2.5 py-1.5 text-xs font-medium transition",
                  ROLE_COLOR[role] || "text-[#dee4ea]",
                  "hover:border-[#579dff] hover:bg-[#333c45] disabled:cursor-not-allowed",
                ].join(" ")}
              >
                {isUpdating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : (
                  <span>{roleLabel}</span>
                )}
                <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden />
              </button>

              {/* Dropdown danh sách vai trò */}
              {menuOpen && (
                <ul
                  role="listbox"
                  aria-label="Chọn vai trò cho thành viên"
                  className="absolute right-0 top-full z-30 mt-1 min-w-[160px] overflow-hidden rounded-[10px] border border-[#3c444d] bg-[#1e252e] py-1 shadow-2xl"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <li key={opt.value} role="option" aria-selected={opt.value === role}>
                      <button
                        type="button"
                        onClick={() => handleRoleChange(opt.value)}
                        className={[
                          "flex w-full items-center justify-between gap-2 px-3 py-2 text-xs transition hover:bg-[#27303b]",
                          opt.value === role ? "text-[#579dff]" : "text-[#dee4ea]",
                        ].join(" ")}
                      >
                        <span>{opt.label}</span>
                        {opt.value === role && (
                          <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            /* Badge chỉ đọc khi không có quyền */
            <span
              aria-label={`Vai trò: ${roleLabel}`}
              className={[
                "inline-flex items-center rounded-[6px] border border-[#2a3038] bg-[#1e252e] px-2.5 py-1.5 text-xs font-medium",
                ROLE_COLOR[role] || "text-[#9fadbc]",
              ].join(" ")}
            >
              {roleLabel}
            </span>
          )}

          {/* ── Nút Rời đi (current user) hoặc Xóa (other member) ── */}
          {canEdit && (
            <button
              type="button"
              disabled={isInteracting}
              onClick={handleRemove}
              aria-label={
                isCurrentUser
                  ? "Rời khỏi bảng"
                  : `Xóa ${member?.name || "thành viên"} khỏi bảng`
              }
              className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#3c444d] bg-[#2a3038] px-2.5 py-1.5 text-xs text-[#9fadbc] transition hover:border-[#f87168] hover:bg-[#3f2124] hover:text-[#f87168] disabled:cursor-not-allowed"
            >
              {isRemoving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-label="Đang xử lý..." />
              ) : isCurrentUser ? (
                <>
                  <LogOut className="h-3.5 w-3.5" aria-hidden />
                  Rời đi
                </>
              ) : (
                <>
                  <X className="h-3.5 w-3.5" aria-hidden />
                  Xóa
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── Thông báo lỗi (dismissible) ── */}
      {updateError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-[#3f1b1d] px-3 py-2 text-xs text-[#f87168]"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="flex-1">{updateError}</span>
          <button
            type="button"
            onClick={() => setUpdateError("")}
            aria-label="Đóng thông báo lỗi"
            className="shrink-0 rounded p-0.5 text-[#f87168] hover:bg-white/10"
          >
            <X className="h-3 w-3" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── PropTypes ────────────────────────────────────────────────────────────────

BoardMemberItemComponent.propTypes = {
  member: PropTypes.shape({
    /** id của document BoardMember */
    id: PropTypes.string.isRequired,
    /** id của User (string sau khi normalise từ useBoardDetail) */
    userId: PropTypes.string,
    role: PropTypes.oneOf(["admin", "member", "observer"]),
    name: PropTypes.string,
    email: PropTypes.string,
    avatarUrl: PropTypes.string,
    initials: PropTypes.string,
    accentColor: PropTypes.string,
  }).isRequired,
  /** id người dùng đang đăng nhập — dùng để hiển thị nhãn "Bạn" và nút "Rời đi" */
  currentUserId: PropTypes.string,
  /** Người dùng hiện tại có quyền thay đổi vai trò / xóa thành viên hay không */
  canEdit: PropTypes.bool,
  /** Callback khi đổi vai trò: async (memberId: string, newRole: string) => void */
  onRoleChange: PropTypes.func,
  /** Callback khi xóa/rời bảng: async (memberId: string) => void */
  onRemove: PropTypes.func,
  /** Khoá toàn bộ tương tác từ component cha (vd: đang tải dữ liệu toàn bảng) */
  disabled: PropTypes.bool,
};

// ─── Memo ─────────────────────────────────────────────────────────────────────

const BoardMemberItem = memo(BoardMemberItemComponent, (prev, next) => {
  return (
    prev.member === next.member &&
    prev.currentUserId === next.currentUserId &&
    prev.canEdit === next.canEdit &&
    prev.disabled === next.disabled
  );
});

BoardMemberItem.displayName = "BoardMemberItem";

export default BoardMemberItem;
