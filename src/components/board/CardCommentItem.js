import React, { useState } from "react";
import MemberAvatar from "../members/MemberAvatar";

function formatDateTime(dateValue) {
  if (!dateValue) return "";
  try {
    return new Date(dateValue).toLocaleString("vi-VN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "";
  }
}

function CardCommentItem({ comment, onSave, onCancel }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content || "");

  const handleSave = () => {
    const trimmed = editContent.trim();
    if (!trimmed || trimmed === comment.content) {
      setIsEditing(false);
      setEditContent(comment.content);
      return;
    }
    onSave(comment.id, trimmed);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  return (
    <div className="flex gap-3 animate-in fade-in duration-300">
      <MemberAvatar size={32} initials="?" className="shrink-0 mt-1" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-[#d1d7e0]">Thành viên</span>
          <span className="text-[10px] text-[#8c9bab]">{formatDateTime(comment.updatedAt || comment.createdAt)}</span>
        </div>

        {isEditing ? (
          <div className="space-y-2 mt-1">
            <textarea
              autoFocus
              rows={2}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full resize-none rounded-md bg-[#1d2125] px-3 py-2 text-xs text-[#d1d7e0] outline-none focus:ring-1 focus:ring-[#579dff] border border-white/5"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                className="rounded bg-[#579dff] px-3 py-1 text-[11px] font-medium text-[#1d2125] hover:bg-[#6cabff] transition-colors"
              >
                Lưu
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded px-3 py-1 text-[11px] text-[#9fadbc] hover:bg-white/10 transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        ) : (
          <div className="group relative">
            <div className="rounded-lg bg-[#22272b] px-3 py-2 text-sm text-[#d1d7e0] shadow-sm border border-white/5">
              <p className="whitespace-pre-wrap">{comment.content}</p>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-[11px] text-[#9fadbc] hover:text-[#dee4ea] hover:underline transition-colors"
              >
                Sửa
              </button>
              <span className="text-[11px] text-[#444e5a]">●</span>
              <button
                type="button"
                className="text-[11px] text-[#9fadbc] hover:text-[#ff8f8f] hover:underline transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CardCommentItem;
