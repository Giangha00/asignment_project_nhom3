/**
 * Màn "Người cộng tác": hiển thị danh sách thành viên workspace, lọc tên, mời bằng email, tab yêu cầu (placeholder).
 * Logic nặng tách nhỏ: MemberRow / MemberAvatar / BadgeRole; ô tìm dùng debounce để đỡ re-render khi gõ.
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { UserPlus, X } from "lucide-react";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import MemberRow from "./members/MemberRow";
import { workspacePropType } from "./members/memberPropTypes";

/** Số hiển thị kiểu "đang có / tối đa" (vd 4/10); sau có thể lấy giới hạn thật từ API. */
const MEMBER_CAP = 10;

/** 4 màu gradient xen kẽ theo dòng — avatar chữ không bị một màu. */
const AVATAR_BACKGROUNDS = [
  "bg-gradient-to-br from-teal-500 to-cyan-700",
  "bg-gradient-to-br from-emerald-500 to-green-700",
  "bg-gradient-to-br from-sky-500 to-indigo-600",
  "bg-gradient-to-br from-violet-500 to-purple-700",
];

function avatarBg(index) {
  return AVATAR_BACKGROUNDS[index % AVATAR_BACKGROUNDS.length];
}

/**
 * @typedef {Object} WorkspaceMember
 * @property {string} id
 * @property {string} [name]
 * @property {string} [initials]
 * @property {string} [handle]
 * @property {string} [role]
 * @property {string} [lastActive]
 * @property {string} [avatarUrl]
 */

function ContentMembers({ workspace, user, onInviteMember, onBack }) {
  // Luôn là mảng — tránh crash khi API/workspace chưa có members
  const members = useMemo(() => {
    const m = workspace?.members;
    return Array.isArray(m) ? m : [];
  }, [workspace?.members]);

  // filterInput: cập nhật mỗi lần gõ (ô input mượt). debouncedFilter: chỉ đổi sau 300ms im — dùng để lọc list
  const [filterInput, setFilterInput] = useState("");
  const debouncedFilter = useDebouncedValue(filterInput, 300);

  const [activeTab, setActiveTab] = useState("members");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const inviteRef = useRef(null);
  // id duy nhất theo workspace — trùng label htmlFor nếu nhiều form trên trang
  const emailFieldId = useMemo(() => `invite-email-${workspace?.id || "ws"}`, [workspace?.id]);

  // Bấm ra ngoài hộp mời → đóng popover
  useEffect(() => {
    const handleOutside = (e) => {
      if (inviteRef.current && !inviteRef.current.contains(e.target)) {
        setInviteOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Dòng của user đăng nhập → hiện "Rời đi" thay vì "Loại bỏ"
  const isCurrentMember = (member) => {
    const uid = user?._id || user?.id;
    if (!uid) return false;
    const sid = String(uid);
    return member.id === `member-${sid}` || String(member.id || "").endsWith(sid);
  };

  // Lọc theo chuỗi đã debounce — khớp tên hoặc @handle
  const filteredMembers = useMemo(() => {
    const q = debouncedFilter.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => {
      const name = String(m.name || "").toLowerCase();
      const handle = String(m.handle || "").toLowerCase();
      return name.includes(q) || handle.includes(q);
    });
  }, [members, debouncedFilter]);

  // Gọi lên Home/useWorkspaceShell để thêm thành viên vào state (không reload trang)
  const handleInviteSubmit = (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !workspace?.id) return;
    if (typeof onInviteMember === "function") {
      onInviteMember(workspace.id, trimmed);
    }
    setEmail("");
    setInviteOpen(false);
  };

  return (
    <section className="rounded-xl bg-[#1d2125] px-4 py-6 sm:px-6">
      {/* Tiêu đề + badge số lượng + nút đóng */}
      <header className="mb-5 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Người cộng tác
          </h2>
          <span className="rounded border border-[#3c444d] bg-[#282e33] px-2 py-0.5 text-xs font-medium text-[#9fadbc]">
            {members.length}/{MEMBER_CAP}
          </span>
        </div>
        {typeof onBack === "function" && (
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 rounded-[3px] p-1.5 text-[#9fadbc] hover:bg-[#333c43] hover:text-white"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" strokeWidth={2} aria-hidden />
          </button>
        )}
      </header>

      {/* Banner Premium — chỉ giao diện */}
      <div className="mb-5 flex gap-4 rounded-md border border-[#3c444d] bg-[#22272b] p-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-[#dee4ea]">
            Nâng cấp để kiểm soát nhiều quyền hơn
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-[#9fadbc]">
            Quyết định ai có thể gửi lời mời, chỉnh sửa cài đặt Không gian làm việc và hơn thế
            nữa với Premium.
          </p>
          <button
            type="button"
            className="mt-2 text-sm text-[#579dff] underline hover:text-[#85b8ff]"
            aria-label="Dùng thử Premium miễn phí trong 14 ngày"
          >
            Dùng thử Premium miễn phí trong 14 ngày
          </button>
        </div>
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-violet-600 to-indigo-800 shadow-inner"
          aria-hidden
        >
          <svg width="22" height="22" viewBox="0 0 24 24" className="text-white/95" fill="currentColor">
            <rect x="3" y="3" width="8" height="8" rx="1.5" opacity="0.95" />
            <rect x="13" y="3" width="8" height="8" rx="1.5" opacity="0.75" />
            <rect x="3" y="13" width="8" height="8" rx="1.5" opacity="0.75" />
            <rect x="13" y="13" width="8" height="8" rx="1.5" opacity="0.55" />
          </svg>
        </div>
      </div>

      {/* Hai tab: luôn render 2 tabpanel + hidden — aria-controls luôn trỏ đúng phần tử */}
      <div
        className="mb-4 flex flex-wrap gap-1 border-b border-[#3c444d]"
        role="tablist"
        aria-label="Danh sách và yêu cầu tham gia"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "members"}
          id="tab-members"
          aria-controls="tab-panel-members"
          onClick={() => setActiveTab("members")}
          className={`relative px-3 py-2 text-sm font-medium transition ${
            activeTab === "members"
              ? "text-[#579dff] after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:bg-[#579dff]"
              : "text-[#9fadbc] hover:text-[#dee4ea]"
          }`}
        >
          Thành viên ({members.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "requests"}
          id="tab-requests"
          aria-controls="tab-panel-requests"
          onClick={() => setActiveTab("requests")}
          className={`relative px-3 py-2 text-sm font-medium transition ${
            activeTab === "requests"
              ? "text-[#579dff] after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:bg-[#579dff]"
              : "text-[#9fadbc] hover:text-[#dee4ea]"
          }`}
        >
          Yêu cầu tham gia (0)
        </button>
      </div>

      {/* Tab "Yêu cầu" — chưa có API */}
      <div
        id="tab-panel-requests"
        role="tabpanel"
        aria-labelledby="tab-requests"
        hidden={activeTab !== "requests"}
        className="py-10 text-center text-sm text-[#738496]"
      >
        Chưa có yêu cầu tham gia.
      </div>

      {/* Tab "Thành viên": mô tả, mời email, lọc, danh sách MemberRow */}
      <div
        id="tab-panel-members"
        role="tabpanel"
        aria-labelledby="tab-members"
        hidden={activeTab !== "members"}
      >
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <p className="max-w-3xl text-sm leading-relaxed text-[#9fadbc]">
              Các thành viên trong Không gian làm việc có thể xem và tham gia tất cả các bảng Không
              gian làm việc hiển thị và tạo ra các bảng mới trong Không gian làm việc.
            </p>
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setInviteOpen((v) => !v)}
                aria-expanded={inviteOpen}
                aria-haspopup="dialog"
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-[3px] bg-[#579dff] px-4 py-2.5 text-sm font-semibold text-[#1d2125] hover:bg-[#85b8ff]"
              >
                <UserPlus className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                Mời các thành viên Không gian làm việc
              </button>
              {inviteOpen && (
                <div
                  ref={inviteRef}
                  role="dialog"
                  aria-label="Mời thành viên"
                  className="absolute right-0 top-full z-20 mt-2 w-[min(100vw-2rem,22rem)] rounded-md border border-[#3c444d] bg-[#282e33] p-4 shadow-xl"
                >
                  <div className="mb-3 text-sm font-semibold text-[#dee4ea]">Mời thành viên</div>
                  <form onSubmit={handleInviteSubmit}>
                    <label htmlFor={emailFieldId} className="mb-1 block text-xs text-[#9fadbc]">
                      Email
                    </label>
                    <input
                      id={emailFieldId}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      required
                      autoComplete="email"
                      className="mb-3 w-full rounded-[3px] border border-[#3c444d] bg-[#1d2125] px-3 py-2 text-sm text-white outline-none focus:border-[#579dff]"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setInviteOpen(false);
                          setEmail("");
                        }}
                        className="rounded-[3px] border border-[#3c444d] px-3 py-1.5 text-sm text-[#9fadbc] hover:bg-[#333c43]"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="rounded-[3px] bg-[#579dff] px-3 py-1.5 text-sm font-semibold text-[#1d2125] hover:bg-[#85b8ff]"
                      >
                        Gửi lời mời
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* sr-only label: screen reader đọc mục đích ô (placeholder không đủ thay label) */}
          <div className="mb-4">
            <label htmlFor="members-filter-name" className="sr-only">
              Lọc theo tên thành viên
            </label>
            <input
              id="members-filter-name"
              type="search"
              value={filterInput}
              onChange={(e) => setFilterInput(e.target.value)}
              placeholder="Lọc theo tên"
              autoComplete="off"
              className="w-full max-w-xl rounded-[3px] border border-[#3c444d] bg-[#22272b] px-3 py-2.5 text-sm text-[#dee4ea] placeholder:text-[#738496] outline-none focus:border-[#579dff]"
            />
          </div>

          {/* boardLabel tạm theo index (1–3); sau thay bằng số bảng thật từ API */}
          {filteredMembers.length > 0 ? (
            <ul className="divide-y divide-[#3c444d] rounded-md border border-[#3c444d] bg-[#22272b]">
              {filteredMembers.map((member, index) => {
                const me = isCurrentMember(member);
                const boardLabel = `Bảng (${(index % 3) + 1})`;
                return (
                  <MemberRow
                    key={member.id}
                    member={member}
                    boardLabel={boardLabel}
                    isCurrentMember={me}
                  />
                );
              })}
            </ul>
          ) : (
            /* Empty: chưa ai hoặc lọc không ra ai */
            <p className="rounded-md border border-[#3c444d] bg-[#22272b] py-10 text-center text-sm text-[#738496]">
              {members.length === 0
                ? "Chưa có thành viên nào trong không gian làm việc này."
                : "Không có thành viên khớp bộ lọc."}
            </p>
          )}
      </div>
    </section>
  );
}

// Kiểm tra props lúc dev (console warning nếu sai kiểu / thiếu field quan trọng)
ContentMembers.propTypes = {
  workspace: PropTypes.oneOfType([PropTypes.oneOf([null]), workspacePropType, PropTypes.object]),
  user: PropTypes.object,
  onInviteMember: PropTypes.func,
  onBack: PropTypes.func,
};

ContentMembers.defaultProps = {
  workspace: null,
  user: null,
  onInviteMember: undefined,
  onBack: undefined,
};

export default ContentMembers;
