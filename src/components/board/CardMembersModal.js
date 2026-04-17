import React, { useState } from "react";
import { X, Search, Users } from "lucide-react";
import api from "../../lib/api";
import MemberAvatar from "../members/MemberAvatar";

const ROW_AVATAR = 28;

/** userId có thể là object populate hoặc chuỗi ObjectId — dùng để khớp với boardMembers.userId */
function userIdKeyFromAssignee(m) {
  const u = m?.userId;
  if (u == null) return "";
  if (typeof u === "object") return String(u._id || u.id || "");
  return String(u);
}

function CardMembersModal({
  cardId,
  boardMembers,
  assignedMembers,
  onClose,
  /** Sau POST/DELETE: GET lại assignees (populate userId) để hiện tên ngay */
  onAssigneesUpdated,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const assignedUserIds = new Set(assignedMembers.map(userIdKeyFromAssignee));

  const availableMembers = boardMembers.filter((member) => {
    const uid = String(member.userId || "");
    const isAssigned = uid && assignedUserIds.has(uid);
    const matchesQuery = searchQuery.length === 0 || 
      (member.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    return !isAssigned && matchesQuery;
  });

  const syncAssigneesFromApi = async () => {
    const listRes = await api.get(`/api/cards/${cardId}/assignees`);
    const next = Array.isArray(listRes.data) ? listRes.data : [];
    if (typeof onAssigneesUpdated === "function") {
      onAssigneesUpdated(next);
    }
  };

  const handleAddMember = async (userId) => {
    setLoading(true);
    setError("");
    try {
      await api.post(`/api/cards/${cardId}/assignees`, { userId });
      await syncAssigneesFromApi();
      setSearchQuery("");
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể thêm thành viên.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    setLoading(true);
    setError("");
    try {
      await api.delete(`/api/cards/${cardId}/assignees/${memberId}`);
      await syncAssigneesFromApi();
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể xóa thành viên.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-8 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-[#323940] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-[#9fadbc] hover:bg-white/10 hover:text-white transition-all"
          aria-label="Đóng"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-[#9fadbc]" />
            <h2 className="text-lg font-semibold text-white">Thành viên</h2>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#8c9bab] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm các thành viên"
              className="w-full rounded-lg border border-[#3c444d] bg-[#22272b] pl-10 pr-3 py-2 text-sm text-[#d1d7e0] placeholder:text-[#6b7785] outline-none focus:border-[#579dff] focus:ring-1 focus:ring-[#579dff]"
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-4">
          {/* Assigned Members */}
          {assignedMembers.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#8c9bab]">
                Thành viên của thẻ
              </p>
              <div className="space-y-1">
                {assignedMembers.map((member) => {
                  const user =
                    member.userId && typeof member.userId === "object"
                      ? member.userId
                      : {};
                  const userId = user.id || user._id || userIdKeyFromAssignee(member);
                  return (
                    <div
                      key={member.id || member._id || userId}
                      className="flex items-center justify-between gap-2 rounded-lg bg-[#2c333a] px-3 py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MemberAvatar
                          name={user.fullName || user.name || user.username}
                          username={user.email}
                          avatarUrl={user.avatarUrl}
                          size={ROW_AVATAR}
                          className="shrink-0 ring-2 ring-[#2c333a]"
                        />
                        <span className="truncate text-sm text-[#d1d7e0]">
                          {user.fullName || user.name || user.username || "Unknown"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id || member._id)}
                        disabled={loading}
                        className="rounded p-1 text-[#8c9bab] hover:bg-white/10 hover:text-white disabled:opacity-50"
                        aria-label="Xóa thành viên"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available Members */}
          {availableMembers.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#8c9bab]">
                Thành viên của bảng
              </p>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {availableMembers.map((member) => (
                  <button
                    key={member.userId}
                    type="button"
                    onClick={() => handleAddMember(member.userId)}
                    disabled={loading}
                    className="w-full flex items-center gap-2 rounded-lg bg-[#2c333a] px-3 py-2 text-left hover:bg-[#3d454c] transition-colors disabled:opacity-50"
                  >
                    <MemberAvatar
                      name={member.name}
                      username={member.email}
                      avatarUrl={member.avatarUrl}
                      size={ROW_AVATAR}
                      className="shrink-0 ring-2 ring-[#2c333a]"
                    />
                    <span className="truncate text-sm text-[#d1d7e0]">{member.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {assignedMembers.length === 0 && availableMembers.length === 0 && !searchQuery && (
            <p className="text-center text-sm text-[#8c9bab] py-4">
              Tất cả thành viên đã được thêm vào thẻ.
            </p>
          )}

          {searchQuery && availableMembers.length === 0 && assignedMembers.length === 0 && (
            <p className="text-center text-sm text-[#8c9bab] py-4">
              Không tìm thấy thành viên phù hợp.
            </p>
          )}

          {error && (
            <div className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CardMembersModal;
