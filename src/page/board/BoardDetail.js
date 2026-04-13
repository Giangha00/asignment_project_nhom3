import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  AlignLeft,
  ArrowLeftRight,
  CheckSquare,
  Clock,
  Globe,
  Grid3x3,
  LayoutGrid,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Sparkles,
  SquareArrowOutUpRight,
  Star,
  Tag,
  User2,
  UserPlus,
  X,
} from "lucide-react";
import Header from "../../components/Header";
import api from "../../lib/api";
import { getSocket } from "../../lib/socket";

const DND_MIME = "application/json";

function parseDragCardPayload(e) {
  try {
    const raw =
      e.dataTransfer.getData(DND_MIME) || e.dataTransfer.getData("text/plain");
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data?.cardId && data?.fromListId) return data;
  } catch {
    /* ignore */
  }
  return null;
}

function normalizeId(obj) {
  return String(obj?._id || obj?.id || "");
}

function mapListToUi(list) {
  return {
    id: normalizeId(list),
    name: list.name || list.title || "Danh sách",
    position: list.position ?? 0,
  };
}

function mapCardToUi(card) {
  return {
    id: normalizeId(card),
    listId: String(card.listId || ""),
    title: card.title || "",
    description: card.description || "",
    position: card.position ?? 0,
  };
}

function mapCommentToUi(comment) {
  return {
    id: normalizeId(comment),
    content: comment?.content || "",
    userId: String(comment?.userId || ""),
    createdAt: comment?.createdAt || null,
    updatedAt: comment?.updatedAt || null,
  };
}

function mapBoardMemberToUi(member) {
  const user = member?.userId && typeof member.userId === "object" ? member.userId : null;
  const userId = user ? normalizeId(user) : String(member?.userId || "");

  return {
    id: normalizeId(member),
    userId,
    role: member?.role || "member",
    name: user?.fullName || user?.name || user?.username || "Thành viên",
    email: user?.email || "",
    avatarUrl: user?.avatarUrl || "",
  };
}

function formatDateTime(dateValue) {
  if (!dateValue) return "";
  try {
    return new Date(dateValue).toLocaleString("vi-VN");
  } catch {
    return "";
  }
}

// ── Card Detail Modal ──────────────────────────────────────────────────────────
function CardModal({ card, listName, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState(card.title);
  const [titleEditing, setTitleEditing] = useState(false);
  const [description, setDescription] = useState(card.description || "");
  const [descEditing, setDescEditing] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [editingCommentId, setEditingCommentId] = useState("");
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState("");

  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description || "");
  }, [card.title, card.description]);

  useEffect(() => {
    let cancelled = false;

    const loadComments = async () => {
      if (!card?.id) return;
      setCommentsLoading(true);
      setCommentsError("");
      try {
        const response = await api.get(`/api/comments?cardId=${card.id}`);
        if (cancelled) return;
        const rows = Array.isArray(response.data) ? response.data : [];
        setComments(rows.map(mapCommentToUi));
      } catch (err) {
        if (cancelled) return;
        setCommentsError(err?.response?.data?.message || "Không thể tải nhận xét.");
      } finally {
        if (!cancelled) setCommentsLoading(false);
      }
    };

    loadComments();

    return () => {
      cancelled = true;
    };
  }, [card?.id]);

  const commitTitle = () => {
    setTitleEditing(false);
    const trimmed = title.trim();
    if (!trimmed) { setTitle(card.title); return; }
    if (trimmed !== card.title) onSave({ title: trimmed });
  };

  const commitDescription = () => {
    setDescEditing(false);
    if (description !== (card.description || "")) {
      onSave({ description });
    }
  };

  const handleCreateComment = async () => {
    const content = commentInput.trim();
    if (!content) return;
    try {
      const response = await api.post("/api/comments", {
        cardId: card.id,
        content,
      });
      const created = mapCommentToUi(response.data || {});
      if (!created.id) return;
      setComments((prev) => [...prev, created]);
      setCommentInput("");
      setCommentsError("");
    } catch (err) {
      setCommentsError(err?.response?.data?.message || "Không thể thêm nhận xét.");
    }
  };

  const startEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentContent(comment.content || "");
  };

  const cancelEditComment = () => {
    setEditingCommentId("");
    setEditingCommentContent("");
  };

  const saveEditComment = async () => {
    const nextContent = editingCommentContent.trim();
    if (!editingCommentId || !nextContent) return;

    const previous = comments.find((item) => item.id === editingCommentId);
    if (!previous) return;

    const optimistic = {
      ...previous,
      content: nextContent,
      updatedAt: new Date().toISOString(),
    };

    setComments((prev) =>
      prev.map((item) => (item.id === editingCommentId ? optimistic : item))
    );

    try {
      const response = await api.patch(`/api/comments/${editingCommentId}`, {
        content: nextContent,
      });
      const updated = mapCommentToUi(response.data || {});
      setComments((prev) =>
        prev.map((item) => (item.id === editingCommentId ? { ...item, ...updated } : item))
      );
      cancelEditComment();
      setCommentsError("");
    } catch (err) {
      setComments((prev) =>
        prev.map((item) => (item.id === editingCommentId ? previous : item))
      );
      setCommentsError(err?.response?.data?.message || "Không thể sửa nhận xét.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-10"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-[#323940] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1.5 text-[#9fadbc] hover:bg-white/10"
          aria-label="Đóng"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="px-6 pt-6 pb-2">
          {titleEditing ? (
            <textarea
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  commitTitle();
                }
                if (e.key === "Escape") {
                  setTitle(card.title);
                  setTitleEditing(false);
                }
              }}
              rows={2}
              className="w-full resize-none rounded-lg bg-[#1d2125] px-3 py-2 text-xl font-semibold text-white outline-none focus:ring-2 focus:ring-[#579dff]"
            />
          ) : (
            <h2
              className="cursor-text rounded-lg px-3 py-2 text-xl font-semibold text-white hover:bg-white/5"
              onClick={() => setTitleEditing(true)}
            >
              {title}
            </h2>
          )}
          <p className="mt-1 px-3 text-xs text-[#8c9bab]">
            trong danh sách{" "}
            <span className="font-medium text-[#9fadbc]">{listName}</span>
          </p>
        </div>

        {/* Quick-action buttons */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 px-6 py-3">
          {[
            { icon: <Plus className="h-3.5 w-3.5" />, label: "Thêm" },
            { icon: <Tag className="h-3.5 w-3.5" />, label: "Nhãn" },
            { icon: <Clock className="h-3.5 w-3.5" />, label: "Ngày" },
            { icon: <CheckSquare className="h-3.5 w-3.5" />, label: "Việc cần làm" },
            { icon: <User2 className="h-3.5 w-3.5" />, label: "Thành viên" },
          ].map(({ icon, label }) => (
            <button
              key={label}
              type="button"
              className="flex items-center gap-1.5 rounded-md bg-[#3d454c] px-3 py-1.5 text-sm text-[#d1d7e0] hover:bg-[#4a535c]"
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex gap-6 px-6 pb-6 pt-4">
          {/* Left — description */}
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex items-center gap-2">
              <AlignLeft className="h-4 w-4 shrink-0 text-[#9fadbc]" />
              <h3 className="text-sm font-semibold text-[#d1d7e0]">Mô tả</h3>
            </div>
            {descEditing ? (
              <div>
                <textarea
                  autoFocus
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Thêm mô tả chi tiết hơn..."
                  className="w-full resize-none rounded-lg bg-[#22272b] px-3 py-2 text-sm text-[#d1d7e0] placeholder:text-[#6b7785] outline-none focus:ring-2 focus:ring-[#579dff]"
                />
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={commitDescription}
                    className="rounded-md bg-[#579dff] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#6cabff]"
                  >
                    Lưu
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDescEditing(false);
                      setDescription(card.description || "");
                    }}
                    className="rounded-md p-1.5 text-[#9fadbc] hover:bg-white/10"
                    aria-label="Hủy"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setDescEditing(true)}
                className="min-h-[80px] cursor-text rounded-lg bg-[#22272b]/80 px-3 py-2.5 text-sm hover:bg-[#22272b]"
              >
                {description ? (
                  <span className="whitespace-pre-wrap text-[#d1d7e0]">{description}</span>
                ) : (
                  <span className="text-[#6b7785]">Thêm mô tả chi tiết hơn...</span>
                )}
              </div>
            )}
          </div>

          {/* Right — activity + delete */}
          <div className="w-[200px] shrink-0 space-y-4">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 shrink-0 text-[#9fadbc]" />
                <h3 className="text-sm font-semibold text-[#d1d7e0]">
                  Nhận xét và hoạt động
                </h3>
              </div>
              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleCreateComment();
                    }
                  }}
                  placeholder="Viết bình luận..."
                  className="w-full resize-none rounded-lg bg-[#22272b] px-3 py-2 text-sm text-[#d1d7e0] placeholder:text-[#6b7785] outline-none focus:ring-2 focus:ring-[#579dff]"
                />
                <button
                  type="button"
                  onClick={handleCreateComment}
                  className="rounded-md bg-[#579dff] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#6cabff]"
                >
                  Thêm nhận xét
                </button>
                {commentsError ? (
                  <p className="text-xs text-[#ff8f8f]">{commentsError}</p>
                ) : null}
              </div>

              <div className="mt-3 max-h-[220px] space-y-2 overflow-y-auto pr-1">
                {commentsLoading ? (
                  <p className="text-xs text-[#8c9bab]">Đang tải nhận xét...</p>
                ) : comments.length === 0 ? (
                  <p className="text-xs text-[#8c9bab]">Chưa có nhận xét nào.</p>
                ) : (
                  comments.map((comment) => {
                    const isEditing = editingCommentId === comment.id;
                    return (
                      <div
                        key={comment.id}
                        className="rounded-lg border border-white/10 bg-[#22272b]/90 p-2"
                      >
                        {isEditing ? (
                          <div className="space-y-2">
                            <textarea
                              rows={3}
                              value={editingCommentContent}
                              onChange={(e) => setEditingCommentContent(e.target.value)}
                              className="w-full resize-none rounded-md bg-[#1d2125] px-2 py-1.5 text-xs text-[#d1d7e0] outline-none focus:ring-1 focus:ring-[#579dff]"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={saveEditComment}
                                className="rounded bg-[#579dff] px-2 py-1 text-[11px] font-medium text-white"
                              >
                                Lưu
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditComment}
                                className="rounded px-2 py-1 text-[11px] text-[#9fadbc] hover:bg-white/10"
                              >
                                Hủy
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="whitespace-pre-wrap text-xs text-[#d1d7e0]">
                              {comment.content}
                            </p>
                            <div className="mt-1 flex items-center justify-between gap-2">
                              <span className="text-[10px] text-[#8c9bab]">
                                {formatDateTime(comment.updatedAt || comment.createdAt)}
                              </span>
                              <button
                                type="button"
                                onClick={() => startEditComment(comment)}
                                className="rounded px-2 py-1 text-[11px] text-[#9fadbc] hover:bg-white/10"
                              >
                                Sửa
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onDelete}
              className="w-full rounded-md bg-[#4f1515]/80 px-3 py-2 text-sm font-medium text-[#ff8f8f] hover:bg-[#6d1f1f]"
            >
              Xóa thẻ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
function BoardDetail() {
  const { boardId: boardIdParam, workspaceId: workspaceIdParam } = useParams();
  const navigate = useNavigate();
  const boardId = boardIdParam ? decodeURIComponent(boardIdParam) : "";
  const workspaceId = workspaceIdParam ? decodeURIComponent(workspaceIdParam) : "";

  // Data state
  const [boardMeta, setBoardMeta] = useState(null);
  const [lists, setLists] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // UI state
  const [bannerVisible, setBannerVisible] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [addingForListId, setAddingForListId] = useState(null);
  const [composerTitle, setComposerTitle] = useState("");
  const [draggingCardId, setDraggingCardId] = useState(null);
  const [dragOverListId, setDragOverListId] = useState(null);
  const [dragOverCardId, setDragOverCardId] = useState(null);
  const [listComposerOpen, setListComposerOpen] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [newListError, setNewListError] = useState("");
  const [boardMembers, setBoardMembers] = useState([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  // Load board + lists + cards from API
  const loadBoardData = useCallback(async () => {
    if (!boardId) return;
    setLoading(true);
    setLoadError("");
    try {
      const [boardRes, listsRes, cardsRes] = await Promise.all([
        api.get(`/api/boards/${boardId}`),
        api.get(`/api/board-lists?boardId=${boardId}`),
        api.get(`/api/cards?boardId=${boardId}`),
      ]);
      setBoardMeta(boardRes.data || null);
      setLists((Array.isArray(listsRes.data) ? listsRes.data : []).map(mapListToUi));
      setCards((Array.isArray(cardsRes.data) ? cardsRes.data : []).map(mapCardToUi));

      try {
        const membersRes = await api.get(`/api/boards/${boardId}/members`);
        const rows = Array.isArray(membersRes.data) ? membersRes.data : [];
        setBoardMembers(rows.map(mapBoardMemberToUi).filter((item) => item.id));
      } catch {
        setBoardMembers([]);
      }
    } catch (err) {
      setLoadError(err?.response?.data?.message || "Không thể tải dữ liệu bảng.");
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  const handleInviteMember = async (event) => {
    event.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    if (!email) {
      setInviteError("Vui lòng nhập email.");
      return;
    }

    setInviteLoading(true);
    setInviteError("");
    setInviteSuccess("");

    try {
      const usersRes = await api.get("/api/users");
      const users = Array.isArray(usersRes.data) ? usersRes.data : [];
      const targetUser = users.find(
        (user) => String(user?.email || "").toLowerCase() === email
      );

      if (!targetUser) {
        setInviteError("Không tìm thấy người dùng với email này.");
        return;
      }

      const targetUserId = String(targetUser?._id || targetUser?.id || "");
      if (!targetUserId) {
        setInviteError("Không xác định được người dùng để mời.");
        return;
      }

      const response = await api.post(`/api/boards/${boardId}/members`, {
        userId: targetUserId,
        role: "member",
      });

      const created = mapBoardMemberToUi(response.data || {});
      setBoardMembers((prev) => {
        const idx = prev.findIndex((item) => item.userId === created.userId);
        if (idx === -1) return [...prev, created];
        const next = [...prev];
        next[idx] = { ...next[idx], ...created };
        return next;
      });

      setInviteSuccess("Đã mời thành viên vào bảng.");
      setInviteEmail("");
    } catch (err) {
      setInviteError(err?.response?.data?.message || "Không thể mời thành viên.");
    } finally {
      setInviteLoading(false);
    }
  };

  useEffect(() => {
    loadBoardData();
  }, [loadBoardData]);

  // Socket realtime
  useEffect(() => {
    if (!boardId) return;
    const socket = getSocket();
    socket.emit("join:board", boardId);

    const handleCardCreated = (payload) => {
      if (String(payload?.boardId) !== boardId) return;
      const card = mapCardToUi(payload);
      if (!card.id) return;
      setCards((prev) => (prev.some((c) => c.id === card.id) ? prev : [...prev, card]));
    };

    const handleCardUpdated = (payload) => {
      const updated = mapCardToUi(payload);
      if (!updated.id) return;
      setCards((prev) =>
        prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
      );
      setSelectedCard((prev) =>
        prev?.id === updated.id ? { ...prev, ...updated } : prev
      );
    };

    const handleCardDeleted = (payload) => {
      const deletedId = normalizeId(payload);
      if (!deletedId) return;
      setCards((prev) => prev.filter((c) => c.id !== deletedId));
      setSelectedCard((prev) => (prev?.id === deletedId ? null : prev));
    };

    const handleListCreated = (payload) => {
      if (String(payload?.boardId) !== boardId) return;
      const list = mapListToUi(payload);
      if (!list.id) return;
      setLists((prev) => (prev.some((l) => l.id === list.id) ? prev : [...prev, list]));
    };

    const handleListUpdated = (payload) => {
      const updated = mapListToUi(payload);
      if (!updated.id) return;
      setLists((prev) =>
        prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l))
      );
    };

    const handleListDeleted = (payload) => {
      const deletedId = normalizeId(payload);
      if (!deletedId) return;
      setLists((prev) => prev.filter((l) => l.id !== deletedId));
      setCards((prev) => prev.filter((c) => c.listId !== deletedId));
    };

    socket.on("card:created", handleCardCreated);
    socket.on("card:updated", handleCardUpdated);
    socket.on("card:deleted", handleCardDeleted);
    socket.on("list:created", handleListCreated);
    socket.on("list:updated", handleListUpdated);
    socket.on("list:deleted", handleListDeleted);

    return () => {
      socket.off("card:created", handleCardCreated);
      socket.off("card:updated", handleCardUpdated);
      socket.off("card:deleted", handleCardDeleted);
      socket.off("list:created", handleListCreated);
      socket.off("list:updated", handleListUpdated);
      socket.off("list:deleted", handleListDeleted);
      socket.emit("leave:board", boardId);
    };
  }, [boardId]);

  // Compute list columns
  const listColumns = useMemo(
    () =>
      lists.map((list) => ({
        ...list,
        cards: cards
          .filter((c) => c.listId === list.id)
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
      })),
    [lists, cards]
  );

  const boardName = boardMeta?.name ?? "Bảng";
  const workspaceName = boardMeta?.workspaceName || "";

  // ── Card modal actions ─────────────────────────────────────────────────────

  const handleSaveCard = async (card, patch) => {
    // Optimistic
    setCards((prev) => prev.map((c) => (c.id === card.id ? { ...c, ...patch } : c)));
    setSelectedCard((prev) => (prev?.id === card.id ? { ...prev, ...patch } : prev));
    try {
      await api.patch(`/api/cards/${card.id}`, patch);
    } catch (err) {
      // Rollback
      setCards((prev) => prev.map((c) => (c.id === card.id ? card : c)));
      setSelectedCard((prev) => (prev?.id === card.id ? card : prev));
      window.alert(err?.response?.data?.message || "Không thể cập nhật thẻ.");
    }
  };

  const handleDeleteCard = async (card) => {
    setSelectedCard(null);
    setCards((prev) => prev.filter((c) => c.id !== card.id));
    try {
      await api.delete(`/api/cards/${card.id}`);
    } catch (err) {
      setCards((prev) => [...prev, card]);
      window.alert(err?.response?.data?.message || "Không thể xóa thẻ.");
    }
  };

  // ── Drag & drop ───────────────────────────────────────────────────────────

  const moveCardBetweenLists = async (fromListId, toListId, cardId) => {
    if (!cardId || !fromListId || !toListId || fromListId === toListId) return;

    const snapshot = cards;
    const fromCards = snapshot
      .filter((c) => c.listId === fromListId)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    const toCards = snapshot
      .filter((c) => c.listId === toListId)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    const movingCard = fromCards.find((c) => c.id === cardId);
    if (!movingCard) return;

    const nextFrom = fromCards
      .filter((c) => c.id !== cardId)
      .map((c, idx) => ({ ...c, position: idx }));
    const nextTo = [...toCards, { ...movingCard, listId: toListId }].map((c, idx) => ({
      ...c,
      position: idx,
    }));

    const changedMap = new Map(
      [...nextFrom, ...nextTo].map((c) => [c.id, c])
    );

    // Optimistic update for list + position in both affected lists
    setCards((prev) =>
      prev.map((c) => (changedMap.has(c.id) ? changedMap.get(c.id) : c))
    );

    try {
      const changedCards = [...nextFrom, ...nextTo].filter((nextCard) => {
        const old = snapshot.find((c) => c.id === nextCard.id);
        if (!old) return false;
        return old.listId !== nextCard.listId || old.position !== nextCard.position;
      });

      await Promise.all(
        changedCards.map((c) =>
          api.patch(`/api/cards/${c.id}`, {
            listId: c.listId,
            position: c.position,
          })
        )
      );
    } catch (err) {
      setCards(snapshot);
      window.alert(err?.response?.data?.message || "Không thể di chuyển thẻ.");
    }
  };

  const reorderCardsInList = async (listId, draggedCardId, targetCardId) => {
    if (draggedCardId === targetCardId) return;
    const snapshot = cards;
    const listCards = snapshot
      .filter((c) => c.listId === listId)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    const fromIndex = listCards.findIndex((c) => c.id === draggedCardId);
    const toIndex = listCards.findIndex((c) => c.id === targetCardId);
    if (fromIndex === -1 || toIndex === -1) return;

    const reordered = [...listCards];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    const withPositions = reordered.map((c, i) => ({ ...c, position: i }));

    // Optimistic update
    setCards((prev) =>
      prev.map((c) => {
        const found = withPositions.find((u) => u.id === c.id);
        return found ? { ...c, position: found.position } : c;
      })
    );

    // Sync only changed cards
    const changedCards = withPositions.filter((c, i) => listCards[i]?.id !== c.id);
    try {
      await Promise.all(
        changedCards.map((c) => api.patch(`/api/cards/${c.id}`, { position: c.position }))
      );
    } catch {
      setCards(snapshot);
    }
  };

  const handleCardDragStart = (e, listId, card) => {
    const payload = JSON.stringify({ cardId: card.id, fromListId: listId });
    e.dataTransfer.setData(DND_MIME, payload);
    e.dataTransfer.setData("text/plain", payload);
    e.dataTransfer.effectAllowed = "move";
    setDraggingCardId(card.id);
  };

  const handleCardDragEnd = () => {
    setDraggingCardId(null);
    setDragOverListId(null);
    setDragOverCardId(null);
  };

  const handleListDragOver = (e, listId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverListId(listId);
  };

  const handleListDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverListId(null);
      setDragOverCardId(null);
    }
  };

  // Drop on list background (empty area) → move to list
  const handleListDrop = (e, toListId) => {
    e.preventDefault();
    const data = parseDragCardPayload(e);
    setDragOverListId(null);
    setDragOverCardId(null);
    setDraggingCardId(null);
    if (!data) return;
    moveCardBetweenLists(data.fromListId, toListId, data.cardId);
  };

  // Drop on a specific card → reorder within list or move between lists
  const handleCardDrop = (e, listId, targetCard) => {
    e.preventDefault();
    e.stopPropagation();
    const data = parseDragCardPayload(e);
    setDragOverListId(null);
    setDragOverCardId(null);
    setDraggingCardId(null);
    if (!data) return;
    if (data.fromListId === listId) {
      reorderCardsInList(listId, data.cardId, targetCard.id);
    } else {
      moveCardBetweenLists(data.fromListId, listId, data.cardId);
    }
  };

  // ── Composer ───────────────────────────────────────────────────────────────

  const openComposer = (listId) => {
    setAddingForListId(listId);
    setComposerTitle("");
  };

  const closeComposer = () => {
    setAddingForListId(null);
    setComposerTitle("");
  };

  const submitCard = async (listId) => {
    const trimmed = composerTitle.trim();
    if (!trimmed || !listId || !boardId) return;
    const nextPosition = cards
      .filter((c) => c.listId === listId)
      .reduce((maxPos, c) => Math.max(maxPos, Number(c.position ?? 0)), -1) + 1;
    closeComposer();
    try {
      await api.post("/api/cards", {
        boardId,
        listId,
        title: trimmed,
        description: "",
        position: nextPosition,
      });
    } catch (err) {
      window.alert(err?.response?.data?.message || "Không thể thêm thẻ.");
      setComposerTitle(trimmed);
      setAddingForListId(listId);
    }
  };

  const closeListComposer = () => {
    setListComposerOpen(false);
    setNewListTitle("");
    setNewListError("");
  };

  const submitNewList = async () => {
    const trimmed = newListTitle.trim();
    if (!trimmed) {
      setNewListError("Vui lòng nhập tên danh sách.");
      return;
    }
    closeListComposer();
    try {
      await api.post("/api/board-lists", { boardId, name: trimmed });
    } catch (err) {
      window.alert(err?.response?.data?.message || "Không thể thêm danh sách.");
    }
  };

  const handleHeaderCreateBoard = () => {
    navigate("/home");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0f1214] px-4 text-center text-[#9fadbc]">
        <p className="text-lg text-white">Đang tải bảng...</p>
      </div>
    );
  }

  if (loadError || !boardMeta) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0f1214] px-4 text-center text-[#9fadbc]">
        <p className="text-lg text-white">Không tìm thấy bảng</p>
        <p className="max-w-md text-sm">
          {loadError || "Bảng có thể đã bị xóa hoặc liên kết không đúng."}
        </p>
        <Link
          to="/home"
          className="rounded-md bg-[#579dff] px-4 py-2 text-sm font-semibold text-[#0c1f3d] hover:bg-[#6cabff]"
        >
          Về trang chủ
        </Link>
      </div>
    );
  }

  const selectedCardList = selectedCard
    ? lists.find((l) => l.id === selectedCard.listId)
    : null;

  return (
    <div
      className="relative flex min-h-screen flex-col text-[#d1d7e0]"
      style={{
        background: `
          linear-gradient(125deg, rgba(12, 14, 18, 0.88) 0%, rgba(35, 18, 45, 0.82) 45%, rgba(12, 28, 42, 0.9) 100%),
          radial-gradient(ellipse 80% 60% at 20% 20%, rgba(236, 72, 153, 0.35), transparent 55%),
          radial-gradient(ellipse 70% 50% at 85% 30%, rgba(56, 189, 248, 0.28), transparent 50%),
          radial-gradient(ellipse 60% 40% at 50% 90%, rgba(167, 139, 250, 0.2), transparent 45%),
          #0d1114
        `,
      }}
    >
      <Header onCreateBoard={handleHeaderCreateBoard} backTo="/home" />

      {/* Card detail modal */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          listName={selectedCardList?.name || ""}
          onClose={() => setSelectedCard(null)}
          onSave={(patch) => handleSaveCard(selectedCard, patch)}
          onDelete={() => handleDeleteCard(selectedCard)}
        />
      )}

      <div className="relative z-10 flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Board header */}
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-4">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-bold text-white sm:text-xl">
                {boardName}
              </h1>
              <button
                type="button"
                className="rounded-md p-1.5 text-[#9fadbc] hover:bg-white/10"
                aria-label="Đánh dấu sao"
              >
                <Star className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="rounded-md p-1.5 text-[#9fadbc] hover:bg-white/10"
                aria-label="Lọc"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <span className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[#9fadbc]">
                <Globe className="h-3.5 w-3.5" />
                Hiển thị
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                title="Mời thành viên"
                onClick={() => {
                  setInviteOpen(true);
                  setInviteError("");
                  setInviteSuccess("");
                }}
                className="flex items-center gap-1.5 rounded-md border border-[#3c444d] bg-[#2c333a] px-3 py-1.5 text-sm font-medium text-[#9fadbc] hover:border-[#579dff] hover:text-white"
              >
                <UserPlus className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="rounded-md p-1.5 text-[#9fadbc] hover:bg-white/10"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          {workspaceName ? (
            <p className="px-4 pb-2 text-xs text-[#6b7785]">
              Không gian: {workspaceName}
            </p>
          ) : null}

          {bannerVisible && (
            <div className="mx-3 mb-3 flex items-start gap-2 rounded-md border border-emerald-800/60 bg-emerald-950/50 px-3 py-2 text-sm text-emerald-100 sm:mx-4">
              <span className="mt-0.5 shrink-0 text-emerald-400">●</span>
              <p className="min-w-0 flex-1 leading-snug">
                Bảng này có thể được đặt chế độ công khai hoặc riêng tư tùy cài
                đặt khi tạo. Chỉ thành viên được mời mới chỉnh sửa.
              </p>
              <button
                type="button"
                onClick={() => setBannerVisible(false)}
                className="shrink-0 rounded p-1 text-emerald-200 hover:bg-emerald-900/50"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Lists */}
          <div className="flex flex-1 gap-3 overflow-x-auto overflow-y-hidden px-3 pb-24 pt-1 sm:px-4">
            {listColumns.map((list) => {
              const isComposing = addingForListId === list.id;
              const listCards = list.cards || [];
              const showEmptyHint = listCards.length === 0 && !isComposing;

              return (
                <div
                  key={list.id}
                  className="flex w-[272px] shrink-0 flex-col max-h-[calc(100vh-220px)] rounded-xl bg-[#101204]/85 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between gap-2 px-3 py-2">
                    <h2 className="truncate text-sm font-semibold text-[#d1d7e0]">
                      {list.name}
                    </h2>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <button
                        type="button"
                        className="rounded p-1 text-[#9fadbc] hover:bg-white/10"
                        aria-label="Di chuyển danh sách"
                      >
                        <ArrowLeftRight className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded p-1 text-[#9fadbc] hover:bg-white/10"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div
                    className={`min-h-0 flex-1 space-y-2 overflow-y-auto px-2 pb-2 transition-colors ${
                      dragOverListId === list.id && draggingCardId
                        ? "rounded-lg bg-[#1a3a5c]/40 ring-2 ring-[#579dff] ring-inset"
                        : ""
                    }`}
                    onDragOver={(e) => handleListDragOver(e, list.id)}
                    onDragLeave={handleListDragLeave}
                    onDrop={(e) => handleListDrop(e, list.id)}
                  >
                    {listCards.map((card) => (
                      <div
                        key={card.id}
                        draggable
                        onDragStart={(e) => handleCardDragStart(e, list.id, card)}
                        onDragEnd={handleCardDragEnd}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.dataTransfer.dropEffect = "move";
                          setDragOverCardId(card.id);
                          setDragOverListId(list.id);
                        }}
                        onDrop={(e) => handleCardDrop(e, list.id, card)}
                        aria-grabbed={draggingCardId === card.id}
                        onClick={() => setSelectedCard(card)}
                        className={`cursor-pointer rounded-lg bg-[#22272b] px-3 py-2.5 text-sm text-[#d1d7e0] shadow-sm transition-colors ${
                          draggingCardId === card.id
                            ? "cursor-grabbing opacity-40"
                            : dragOverCardId === card.id
                            ? "ring-2 ring-[#579dff] ring-inset bg-[#2c333a]"
                            : "hover:bg-[#2c333a]"
                        }`}
                      >
                        <span className="block font-medium">{card.title}</span>
                      </div>
                    ))}

                    {showEmptyHint ? (
                      <p
                        className={`min-h-[72px] rounded-lg border border-dashed px-2 py-6 text-center text-xs ${
                          dragOverListId === list.id && draggingCardId
                            ? "border-[#579dff]/60 bg-[#1a3a5c]/25 text-[#9fadbc]"
                            : "border-white/10 text-[#6b7785]"
                        }`}
                      >
                        Kéo thẻ vào đây hoặc thêm thẻ mới
                      </p>
                    ) : null}
                  </div>

                  {isComposing ? (
                    <div className="mx-2 mb-2 space-y-2">
                      <textarea
                        value={composerTitle}
                        onChange={(e) => setComposerTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            submitCard(list.id);
                          }
                        }}
                        rows={3}
                        placeholder="Nhập tiêu đề thẻ..."
                        autoFocus
                        className="w-full resize-none rounded-lg border border-[#3c444d] bg-[#22272b] px-3 py-2 text-sm text-[#d1d7e0] placeholder:text-[#6b7785] shadow-sm outline-none focus:border-[#579dff] focus:ring-1 focus:ring-[#579dff]"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => submitCard(list.id)}
                          className="rounded-md bg-[#579dff] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#6cabff]"
                        >
                          Thêm thẻ
                        </button>
                        <button
                          type="button"
                          onClick={closeComposer}
                          className="rounded-md p-1.5 text-[#c8d1db] hover:bg-white/10"
                          aria-label="Hủy"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mx-2 mb-2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openComposer(list.id)}
                        className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-[#9fadbc] hover:bg-white/10"
                      >
                        <Plus className="h-4 w-4 shrink-0" />
                        Thêm thẻ
                      </button>
                      <button
                        type="button"
                        className="shrink-0 rounded-lg p-2 text-[#9fadbc] hover:bg-white/10"
                        aria-label="Mẫu thẻ"
                      >
                        <SquareArrowOutUpRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {listComposerOpen ? (
              <div className="flex h-fit w-[272px] shrink-0 flex-col rounded-xl border border-[#3c444d] bg-[#121212] p-3 shadow-lg">
                <input
                  type="text"
                  value={newListTitle}
                  onChange={(e) => {
                    setNewListTitle(e.target.value);
                    if (newListError) setNewListError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      submitNewList();
                    }
                  }}
                  placeholder="Nhập tên danh sách..."
                  autoFocus
                  className="w-full rounded-lg border-2 border-[#579dff] bg-[#22272b] px-3 py-2.5 text-sm text-[#d1d7e0] placeholder:text-[#6b7785] outline-none focus:ring-1 focus:ring-[#579dff]"
                />
                {newListError ? (
                  <p className="mt-2 text-xs text-[#f87474]" role="alert">
                    {newListError}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={submitNewList}
                    className="rounded-lg bg-[#579dff] px-3 py-2 text-sm font-semibold text-[#0c1f3d] hover:bg-[#6cabff]"
                  >
                    Thêm danh sách
                  </button>
                  <button
                    type="button"
                    onClick={closeListComposer}
                    className="rounded-md p-2 text-[#c8d1db] hover:bg-white/10"
                    aria-label="Hủy"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setListComposerOpen(true);
                  setNewListTitle("");
                  setNewListError("");
                }}
                className="flex h-fit min-w-[272px] shrink-0 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                <Plus className="h-4 w-4" />
                Thêm danh sách khác
              </button>
            )}
          </div>
        </div>
      </div>

      {inviteOpen && (
        <div
          className="fixed inset-0 z-40 flex items-start justify-center bg-black/60 px-4 py-16"
          onClick={() => setInviteOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-[#3c444d] bg-[#1d2125] p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Mời thành viên vào bảng</h3>
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                className="rounded p-1 text-[#9fadbc] hover:bg-white/10"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleInviteMember} className="space-y-3">
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

            {inviteError ? (
              <p className="mt-3 text-xs text-[#ff8f8f]">{inviteError}</p>
            ) : null}
            {inviteSuccess ? (
              <p className="mt-3 text-xs text-[#8fffb3]">{inviteSuccess}</p>
            ) : null}

            <div className="mt-4 border-t border-white/10 pt-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#8c9bab]">
                Thành viên trong bảng ({boardMembers.length})
              </p>
              <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                {boardMembers.length === 0 ? (
                  <p className="text-xs text-[#8c9bab]">Chưa có thành viên nào.</p>
                ) : (
                  boardMembers.map((member) => (
                    <div
                      key={member.id || member.userId}
                      className="flex items-center justify-between rounded-lg bg-[#11161c] px-3 py-2"
                    >
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
      )}

      {/* Bottom nav */}
      <nav className="pointer-events-none fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 justify-center px-2">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-[#3c444d] bg-[#1d2125]/95 px-2 py-1.5 shadow-xl backdrop-blur-md">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-[#9fadbc] hover:bg-[#3d454c] hover:text-white"
          >
            <Mail className="h-3.5 w-3.5" />
            Hộp thư đến
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-[#9fadbc] hover:bg-[#3d454c] hover:text-white"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Bảng thông tin
          </button>
          <Link
            to="/home"
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-[#9fadbc] hover:bg-[#3d454c] hover:text-white"
          >
            <Grid3x3 className="h-3.5 w-3.5" />
            Các bảng
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default BoardDetail;
