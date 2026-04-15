import React, { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import api from "../../lib/api";
import CardCommentItem from "./CardCommentItem";

function mapCommentToUi(comment) {
  return {
    id: String(comment?._id || comment?.id || ""),
    content: comment?.content || "",
    userId: String(comment?.userId || ""),
    createdAt: comment?.createdAt || null,
    updatedAt: comment?.updatedAt || null,
  };
}

function CardActivity({ cardId }) {
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const loadComments = async () => {
      if (!cardId) return;
      setLoading(true);
      setError("");
      try {
        const response = await api.get(`/api/comments?cardId=${cardId}`);
        if (cancelled) return;
        const rows = Array.isArray(response.data) ? response.data : [];
        setComments(rows.map(mapCommentToUi));
      } catch (err) {
        if (cancelled) return;
        setError(err?.response?.data?.message || "Không thể tải nhận xét.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadComments();
    return () => { cancelled = true; };
  }, [cardId]);

  const handleCreateComment = async () => {
    const content = commentInput.trim();
    if (!content || !cardId) return;
    try {
      const response = await api.post("/api/comments", { cardId, content });
      const created = mapCommentToUi(response.data || {});
      if (created.id) {
        setComments((prev) => [created, ...prev]);
        setCommentInput("");
        setError("");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể thêm nhận xét.");
    }
  };

  const handleUpdateComment = async (commentId, nextContent) => {
    try {
      const response = await api.patch(`/api/comments/${commentId}`, { content: nextContent });
      const updated = mapCommentToUi(response.data || {});
      setComments((prev) => prev.map((item) => (item.id === commentId ? { ...item, ...updated } : item)));
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể sửa nhận xét.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-5 w-5 text-[#9fadbc]" />
        <h3 className="text-sm font-semibold text-[#d1d7e0]">Hoạt động</h3>
      </div>

      {/* Comment Input */}
      <div className="space-y-3">
        <div className="relative">
          <textarea
            rows={2}
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleCreateComment();
              }
            }}
            placeholder="Viết bình luận..."
            className="w-full resize-none rounded-lg bg-[#22272b] px-4 py-3 text-sm text-[#d1d7e0] placeholder:text-[#6b7785] outline-none focus:ring-2 focus:ring-[#579dff] border border-white/5 transition-all shadow-inner"
          />
        </div>
        <div className="flex justify-start">
          <button
            type="button"
            onClick={handleCreateComment}
            disabled={!commentInput.trim()}
            className="rounded-md bg-[#3d454c] px-4 py-1.5 text-xs font-semibold text-[#d1d7e0] hover:bg-[#4a535c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Thêm nhận xét
          </button>
        </div>
        {error && <p className="text-xs text-[#ff8f8f] mt-1">{error}</p>}
      </div>

      {/* Comments List */}
      <div className="space-y-5">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#579dff] border-t-transparent"></div>
          </div>
        ) : comments.length === 0 ? (
          <p className="text-xs text-[#8c9bab] italic pl-1">Chưa có nhận xét nào.</p>
        ) : (
          comments.map((comment) => (
            <CardCommentItem
              key={comment.id}
              comment={comment}
              onSave={handleUpdateComment}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default CardActivity;
