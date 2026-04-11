

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Info,
  LogOut,
  UserPlus,
  X,
  XCircle,
} from "lucide-react";

/** Giới hạn hiển thị dạng "đang dùng / tối đa" (ví dụ 4/10), giống giao diện Trello — có thể đổi theo gói. */
const MEMBER_CAP = 10;

/**
 * Các class Tailwind gradient cho avatar tròn.
 * Dùng xen kẽ theo index để mỗi dòng có màu khác nhau, tránh giao diện đơn điệu.
 */
const AVATAR_BACKGROUNDS = [
  "bg-gradient-to-br from-teal-500 to-cyan-700",
  "bg-gradient-to-br from-emerald-500 to-green-700",
  "bg-gradient-to-br from-sky-500 to-indigo-600",
  "bg-gradient-to-br from-violet-500 to-purple-700",
];

/**
 * Chọn màu nền avatar theo thứ tự dòng (lặp lại sau 4 màu).
 * @param {number} index - chỉ số trong danh sách đang hiển thị (sau lọc)
 */
function avatarBg(index) {
  return AVATAR_BACKGROUNDS[index % AVATAR_BACKGROUNDS.length];
}

/**
 * @typedef {Object} WorkspaceMember
 * @property {string} id
 * @property {string} [name]
 * @property {string} [initials] - chữ viết tắt hiển thị trong avatar
 * @property {string} [handle] - ví dụ @username
 * @property {string} [role] - ví dụ "Quản trị viên"
 * @property {string} [lastActive] - chuỗi hiển thị, ví dụ "Apr 2026" hoặc "Mới tham gia"
 */

/**
 * @typedef {Object} ContentMembersProps
 * @property {object} workspace - workspace đang chọn (có id, members[])
 * @property {object} [user] - user đăng nhập; dùng để biết dòng nào là "tôi" (hiện Rời đi thay vì Loại bỏ)
 * @property {(workspaceId: string, email: string) => void} [onInviteMember] - gọi khi submit form mời (hook useWorkspaceShell)
 * @property {() => void} [onBack] - khi bấm nút X: thường chuyển về tab Trang chủ workspace
 */
function ContentMembers({ workspace, user, onInviteMember, onBack }) {
  /**
   * Danh sách thành viên đã chuẩn hóa: luôn là mảng (tránh crash khi members null/undefined).
   * useMemo: chỉ tính lại khi workspace.members đổi tham chiếu — giảm render thừa khi state khác thay đổi.
   */
  const members = useMemo(() => {
    const m = workspace?.members;
    return Array.isArray(m) ? m : [];
  }, [workspace?.members]);

  /** Chuỗi tìm kiếm trong ô "Lọc theo tên" (so khớp không phân biệt hoa thường). */
  const [filterName, setFilterName] = useState("");
  /** Tab đang chọn: "members" = danh sách thành viên, "requests" = yêu cầu tham gia (placeholder). */
  const [activeTab, setActiveTab] = useState("members");
  /** true = đang mở popover mời thành viên (dropdown dưới nút xanh). */
  const [inviteOpen, setInviteOpen] = useState(false);
  /** Email trong form mời. */
  const [email, setEmail] = useState("");
  /** ref gắn vào hộp popover mời — dùng để phát hiện click ra ngoài và đóng popover. */
  const inviteRef = useRef(null);

  /**
   * Đóng popover mời khi user click bất kỳ đâu ngoài vùng inviteRef.
   * Cleanup: gỡ listener khi unmount để tránh rò rỉ bộ nhớ / handler chạy sau khi component đã hủy.
   */
  useEffect(() => {
    const handleOutside = (e) => {
      if (inviteRef.current && !inviteRef.current.contains(e.target)) {
        setInviteOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  /**
   * Xác định một bản ghi member có phải là user đang đăng nhập không.
   * Logic khớp cách buildDefaultMembers tạo id: `member-${userId}` hoặc id kết thúc bằng userId.
   */
  const isCurrentMember = (member) => {
    const uid = user?._id || user?.id;
    if (!uid) return false;
    const sid = String(uid);
    return member.id === `member-${sid}` || String(member.id || "").endsWith(sid);
  };

  /**
   * Danh sách sau khi lọc theo filterName.
   * So khớp tên hoặc handle (substring, không dấu regex phức tạp — đủ cho ô tìm nhanh).
   */
  const filteredMembers = useMemo(() => {
    const q = filterName.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => {
      const name = String(m.name || "").toLowerCase();
      const handle = String(m.handle || "").toLowerCase();
      return name.includes(q) || handle.includes(q);
    });
  }, [members, filterName]);

  /** Submit form mời: chặn reload trang, gọi onInviteMember(workspaceId, email), reset form và đóng popover. */
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
    /**
     * Section: cùng pattern với ContentBoard — nằm trong <main> của WorkspaceLayout,
     * tạo một "khối nội dung" có viền nền thống nhất với tab Bảng.
     */
    <section className="rounded-xl bg-[#1d2125] px-4 py-6 sm:px-6">
      {/* --- Phần 1: Tiêu đề trang + badge số lượng + nút đóng (tuỳ chọn) --- */}
      <header className="mb-5 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Người cộng tác
          </h2>
          {/* Badge dạng "đang có / giới hạn" — MEMBER_CAP có thể thay bằng giới hạn thật từ API sau */}
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
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        )}
      </header>

      {/* --- Phần 2: Banner quảng cáo Premium (chỉ UI, chưa gắn thanh toán) --- */}
      <div className="mb-5 flex gap-4 rounded-md border border-[#3c444d] bg-[#22272b] p-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-[#dee4ea]">
            Nâng cấp để kiểm soát nhiều quyền hơn
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-[#9fadbc]">
            Quyết định ai có thể gửi lời mời, chỉnh sửa cài đặt Không gian làm việc và hơn thế
            nữa với Premium.
          </p>
          <button type="button" className="mt-2 text-sm text-[#579dff] underline hover:text-[#85b8ff]">
            Dùng thử Premium miễn phí trong 14 ngày
          </button>
        </div>
        {/* Icon trang trí gợi logo lưới bảng (SVG inline, không phụ thuộc asset) */}
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

      {/* --- Phần 3: Tab — cố ý không có tab "Khách" theo yêu cầu --- */}
      <div className="mb-4 flex flex-wrap gap-1 border-b border-[#3c444d]">
        <button
          type="button"
          onClick={() => setActiveTab("members")}
          className={`relative px-3 py-2 text-sm font-medium transition ${
            activeTab === "members"
              ? // Gạch chân tab active: dùng pseudo-element `after:` của Tailwind
                "text-[#579dff] after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:bg-[#579dff]"
              : "text-[#9fadbc] hover:text-[#dee4ea]"
          }`}
        >
          Thành viên ({members.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("requests")}
          className={`relative px-3 py-2 text-sm font-medium transition ${
            activeTab === "requests"
              ? "text-[#579dff] after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:bg-[#579dff]"
              : "text-[#9fadbc] hover:text-[#dee4ea]"
          }`}
        >
          {/* Số 0 cố định — sau này thay bằng requests.length khi có API */}
          Yêu cầu tham gia (0)
        </button>
      </div>

      {activeTab === "requests" ? (
        /* Tab yêu cầu: chưa có dữ liệu — chỉ một dòng trống */
        <p className="py-10 text-center text-sm text-[#738496]">Chưa có yêu cầu tham gia.</p>
      ) : (
        <>
          {/* --- Phần 4: Mô tả quyền thành viên + nút mời + popover form email --- */}
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <p className="max-w-3xl text-sm leading-relaxed text-[#9fadbc]">
              Các thành viên trong Không gian làm việc có thể xem và tham gia tất cả các bảng Không
              gian làm việc hiển thị và tạo ra các bảng mới trong Không gian làm việc.
            </p>
            {/* relative: để popover absolute bám theo nút; z-20 để nổi trên danh sách bên dưới */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setInviteOpen((v) => !v)}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-[3px] bg-[#579dff] px-4 py-2.5 text-sm font-semibold text-[#1d2125] hover:bg-[#85b8ff]"
              >
                <UserPlus className="h-4 w-4 shrink-0" strokeWidth={2} />
                Mời các thành viên Không gian làm việc
              </button>
              {inviteOpen && (
                <div
                  ref={inviteRef}
                  className="absolute right-0 top-full z-20 mt-2 w-[min(100vw-2rem,22rem)] rounded-md border border-[#3c444d] bg-[#282e33] p-4 shadow-xl"
                >
                  <div className="mb-3 text-sm font-semibold text-[#dee4ea]">Mời thành viên</div>
                  <form onSubmit={handleInviteSubmit}>
                    <label className="mb-1 block text-xs text-[#9fadbc]">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      required
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

          {/* --- Phần 5: Ô lọc cục bộ (không gọi API — chỉ lọc mảng đã có trong memory) --- */}
          <div className="mb-4">
            <input
              type="search"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Lọc theo tên"
              className="w-full max-w-xl rounded-[3px] border border-[#3c444d] bg-[#22272b] px-3 py-2.5 text-sm text-[#dee4ea] placeholder:text-[#738496] outline-none focus:border-[#579dff]"
            />
          </div>

          {/* --- Phần 6: Danh sách thành viên (hoặc thông báo rỗng / không khớp lọc) --- */}
          {filteredMembers.length > 0 ? (
            <ul className="divide-y divide-[#3c444d] rounded-md border border-[#3c444d] bg-[#22272b]">
              {filteredMembers.map((member, index) => {
                const me = isCurrentMember(member);
                /**
                 * Nhãn "Bảng (n)" hiện là giả lập theo index (1–3) để giống mockup;
                 * khi có API, thay bằng số bảng thật của từng user.
                 */
                const boardLabel = `Bảng (${(index % 3) + 1})`;
                return (
                  <li
                    key={member.id}
                    className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    {/* Cụm trái: avatar + tên */}
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="relative shrink-0">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${avatarBg(index)}`}
                        >
                          {member.initials || "?"}
                        </div>
                        {/* Badge nhỏ góc avatar — trang trí giống Trello (trạng thái / tier), chưa có logic */}
                        <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-[#22272b] bg-[#3c444d] text-[#9fadbc]">
                          <ChevronUp className="h-2.5 w-2.5" strokeWidth={2.5} aria-hidden />
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                          <span className="font-semibold text-[#dee4ea]">{member.name}</span>
                          <span className="text-sm text-[#738496]">{member.handle}</span>
                        </div>
                      </div>
                    </div>
                    {/* Cụm phải: hoạt động + nút (UI only trừ khi sau này gắn handler) */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-2">
                      <span className="text-xs text-[#738496] sm:min-w-[10rem] sm:text-right">
                        Lần hoạt động gần nhất {member.lastActive || "—"}
                      </span>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-[3px] border border-[#3c444d] bg-[#3a3f44] px-2.5 py-1.5 text-xs text-[#dee4ea] hover:bg-[#454b51]"
                      >
                        {boardLabel}
                        <ChevronDown className="h-3.5 w-3.5 opacity-80" aria-hidden />
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-[3px] border border-[#3c444d] bg-[#3a3f44] px-2.5 py-1.5 text-xs text-[#dee4ea] hover:bg-[#454b51]"
                      >
                        {member.role || "Quản trị viên"}
                        <Info className="h-3.5 w-3.5 opacity-70" aria-hidden />
                      </button>
                      {me ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-[3px] border border-[#3c444d] bg-[#3a3f44] px-2.5 py-1.5 text-xs text-[#dee4ea] hover:bg-[#454b51]"
                        >
                          <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
                          Rời đi
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-[3px] border border-[#3c444d] bg-[#3a3f44] px-2.5 py-1.5 text-xs text-[#dee4ea] hover:bg-[#454b51]"
                        >
                          <XCircle className="h-3.5 w-3.5" strokeWidth={2} />
                          Loại bỏ
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="rounded-md border border-[#3c444d] bg-[#22272b] py-10 text-center text-sm text-[#738496]">
              {members.length === 0
                ? "Chưa có thành viên nào trong không gian làm việc này."
                : "Không có thành viên khớp bộ lọc."}
            </p>
          )}
        </>
      )}
    </section>
  );
}

export default ContentMembers;
