import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import api from "../lib/api";
import { extractUserId } from "../lib/ids";
import { notify, shouldDedupe } from "../lib/notify";
import { getSocket } from "../lib/socket";

const DND_MIME = "application/json";

function normalizeId(obj) {
  return String(obj?._id || obj?.id || "");
}

function mapListToUi(list) {
  return { id: normalizeId(list), name: list.name || list.title || "Danh sách", position: list.position ?? 0 };
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

export function useBoardDetail(currentUser) {
  const { boardId: boardIdParam, workspaceId: workspaceIdParam } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const myUserId = extractUserId(currentUser);

  const boardId = boardIdParam ? decodeURIComponent(boardIdParam) : "";
  const workspaceId = workspaceIdParam ? decodeURIComponent(workspaceIdParam) : "";

  // Data state
  const [boardMeta, setBoardMeta] = useState(null);
  const [lists, setLists] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [boardMembers, setBoardMembers] = useState([]);

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
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  // ── Load board data ─────────────────────────────────────────────────────────
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
        setBoardMembers(rows.map(mapBoardMemberToUi).filter((m) => m.id));
      } catch {
        setBoardMembers([]);
      }
    } catch (err) {
      setLoadError(err?.response?.data?.message || "Không thể tải dữ liệu bảng.");
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => { loadBoardData(); }, [loadBoardData]);

  // ── Socket realtime ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!boardId) return;
    const socket = getSocket();
    socket.emit("join:board", boardId);

    const onCardCreated = (payload) => {
      if (String(payload?.boardId) !== boardId) return;
      const card = mapCardToUi(payload);
      if (!card.id) return;
      setCards((prev) => (prev.some((c) => c.id === card.id) ? prev : [...prev, card]));
    };
    const onCardUpdated = (payload) => {
      const updated = mapCardToUi(payload);
      if (!updated.id) return;
      setCards((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
      setSelectedCard((prev) => (prev?.id === updated.id ? { ...prev, ...updated } : prev));
    };
    const onCardDeleted = (payload) => {
      const id = normalizeId(payload);
      if (!id) return;
      setCards((prev) => prev.filter((c) => c.id !== id));
      setSelectedCard((prev) => (prev?.id === id ? null : prev));
    };
    const onListCreated = (payload) => {
      if (String(payload?.boardId) !== boardId) return;
      const list = mapListToUi(payload);
      if (!list.id) return;
      setLists((prev) => (prev.some((l) => l.id === list.id) ? prev : [...prev, list]));
    };
    const onListUpdated = (payload) => {
      const updated = mapListToUi(payload);
      if (!updated.id) return;
      setLists((prev) => prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l)));
    };
    const onListDeleted = (payload) => {
      const id = normalizeId(payload);
      if (!id) return;
      setLists((prev) => prev.filter((l) => l.id !== id));
      setCards((prev) => prev.filter((c) => c.listId !== id));
    };

    socket.on("card:created", onCardCreated);
    socket.on("card:updated", onCardUpdated);
    socket.on("card:deleted", onCardDeleted);
    socket.on("list:created", onListCreated);
    socket.on("list:updated", onListUpdated);
    socket.on("list:deleted", onListDeleted);

    // Khi chính user được thêm vào bảng: cập nhật danh sách member + một dòng trong panel chuông (socket board room).
    const onBoardMemberUpserted = async (payload) => {
      if (String(payload?.boardId) !== boardId) return;
      try {
        const membersRes = await api.get(`/api/boards/${boardId}/members`);
        const rows = Array.isArray(membersRes.data) ? membersRes.data : [];
        setBoardMembers(rows.map(mapBoardMemberToUi).filter((m) => m.id));
      } catch {
        // ignore
      }

      const targetId = extractUserId(payload?.userId);
      if (!myUserId || !targetId || targetId !== myUserId) return;

      const dedupeKey = `board-member-invite:${payload?._id || payload?.id || `${boardId}:${targetId}`}`;
      if (shouldDedupe(dedupeKey)) return;

      const boardName = boardMeta?.name || "Bảng";
      const myEmail = String(currentUser?.email || "").toLowerCase();

      addNotification({
        kind: "board_invite",
        persistKey: `board_member:${String(payload?._id || payload?.id || `${boardId}:${targetId}`)}`,
        actorName: "Hệ thống",
        actorInitials: "HS",
        actionLine: "Bạn đã được thêm vào bảng",
        targetLabel: boardName,
        targetHref: workspaceIdParam
          ? `/workspace/${encodeURIComponent(workspaceIdParam)}/board/${encodeURIComponent(boardId)}`
          : undefined,
        metaLine: myEmail
          ? `Tài khoản ${myEmail} có quyền truy cập bảng này.`
          : undefined,
      });
    };

    socket.on("boardMember:upserted", onBoardMemberUpserted);

    return () => {
      socket.off("card:created", onCardCreated);
      socket.off("card:updated", onCardUpdated);
      socket.off("card:deleted", onCardDeleted);
      socket.off("list:created", onListCreated);
      socket.off("list:updated", onListUpdated);
      socket.off("list:deleted", onListDeleted);
      socket.off("boardMember:upserted", onBoardMemberUpserted);
      socket.emit("leave:board", boardId);
    };
  }, [addNotification, boardId, boardMeta?.name, currentUser?.email, myUserId, workspaceIdParam]);

  // ── Computed ────────────────────────────────────────────────────────────────
  const listColumns = useMemo(
    () => lists.map((list) => ({
      ...list,
      cards: cards.filter((c) => c.listId === list.id).sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
    })),
    [lists, cards]
  );

  // ── Card CRUD ───────────────────────────────────────────────────────────────
  const handleSaveCard = async (card, patch) => {
    setCards((prev) => prev.map((c) => (c.id === card.id ? { ...c, ...patch } : c)));
    setSelectedCard((prev) => (prev?.id === card.id ? { ...prev, ...patch } : prev));
    try {
      await api.patch(`/api/cards/${card.id}`, patch);
    } catch (err) {
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

  // ── DnD ────────────────────────────────────────────────────────────────────
  const moveCardBetweenLists = async (fromListId, toListId, cardId) => {
    if (!cardId || !fromListId || !toListId || fromListId === toListId) return;
    const snapshot = cards;
    const fromCards = snapshot.filter((c) => c.listId === fromListId).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    const toCards = snapshot.filter((c) => c.listId === toListId).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    const movingCard = fromCards.find((c) => c.id === cardId);
    if (!movingCard) return;

    const nextFrom = fromCards.filter((c) => c.id !== cardId).map((c, i) => ({ ...c, position: i }));
    const nextTo = [...toCards, { ...movingCard, listId: toListId }].map((c, i) => ({ ...c, position: i }));
    const changedMap = new Map([...nextFrom, ...nextTo].map((c) => [c.id, c]));
    setCards((prev) => prev.map((c) => (changedMap.has(c.id) ? changedMap.get(c.id) : c)));

    try {
      const changedCards = [...nextFrom, ...nextTo].filter((nextCard) => {
        const old = snapshot.find((c) => c.id === nextCard.id);
        return old && (old.listId !== nextCard.listId || old.position !== nextCard.position);
      });
      await Promise.all(changedCards.map((c) => api.patch(`/api/cards/${c.id}`, { listId: c.listId, position: c.position })));
    } catch (err) {
      setCards(snapshot);
      window.alert(err?.response?.data?.message || "Không thể di chuyển thẻ.");
    }
  };

  const reorderCardsInList = async (listId, draggedCardId, targetCardId) => {
    if (draggedCardId === targetCardId) return;
    const snapshot = cards;
    const listCards = snapshot.filter((c) => c.listId === listId).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    const fromIndex = listCards.findIndex((c) => c.id === draggedCardId);
    const toIndex = listCards.findIndex((c) => c.id === targetCardId);
    if (fromIndex === -1 || toIndex === -1) return;

    const reordered = [...listCards];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    const withPositions = reordered.map((c, i) => ({ ...c, position: i }));

    setCards((prev) => prev.map((c) => {
      const found = withPositions.find((u) => u.id === c.id);
      return found ? { ...c, position: found.position } : c;
    }));

    const changedCards = withPositions.filter((c, i) => listCards[i]?.id !== c.id);
    try {
      await Promise.all(changedCards.map((c) => api.patch(`/api/cards/${c.id}`, { position: c.position })));
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

  const handleCardDragOver = (cardId, listId) => {
    setDragOverCardId(cardId);
    setDragOverListId(listId);
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

  const parseDragPayload = (e) => {
    try {
      const raw = e.dataTransfer.getData(DND_MIME) || e.dataTransfer.getData("text/plain");
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data?.cardId && data?.fromListId) return data;
    } catch { /* ignore */ }
    return null;
  };

  const handleListDrop = (e, toListId) => {
    e.preventDefault();
    const data = parseDragPayload(e);
    setDragOverListId(null); setDragOverCardId(null); setDraggingCardId(null);
    if (!data) return;
    moveCardBetweenLists(data.fromListId, toListId, data.cardId);
  };

  const handleCardDrop = (e, listId, targetCard) => {
    e.preventDefault();
    e.stopPropagation();
    const data = parseDragPayload(e);
    setDragOverListId(null); setDragOverCardId(null); setDraggingCardId(null);
    if (!data) return;
    if (data.fromListId === listId) {
      reorderCardsInList(listId, data.cardId, targetCard.id);
    } else {
      moveCardBetweenLists(data.fromListId, listId, data.cardId);
    }
  };

  // ── Composer ────────────────────────────────────────────────────────────────
  const openComposer = (listId) => { setAddingForListId(listId); setComposerTitle(""); };
  const closeComposer = () => { setAddingForListId(null); setComposerTitle(""); };

  const submitCard = async (listId) => {
    const trimmed = composerTitle.trim();
    if (!trimmed || !listId || !boardId) return;
    const nextPosition = cards.filter((c) => c.listId === listId).reduce((max, c) => Math.max(max, Number(c.position ?? 0)), -1) + 1;
    closeComposer();
    try {
      await api.post("/api/cards", { boardId, listId, title: trimmed, description: "", position: nextPosition });
    } catch (err) {
      window.alert(err?.response?.data?.message || "Không thể thêm thẻ.");
      setComposerTitle(trimmed);
      setAddingForListId(listId);
    }
  };

  const openListComposer = () => { setListComposerOpen(true); setNewListTitle(""); setNewListError(""); };
  const closeListComposer = () => { setListComposerOpen(false); setNewListTitle(""); setNewListError(""); };

  const submitNewList = async () => {
    const trimmed = newListTitle.trim();
    if (!trimmed) { setNewListError("Vui lòng nhập tên danh sách."); return; }
    closeListComposer();
    try {
      await api.post("/api/board-lists", { boardId, name: trimmed });
    } catch (err) {
      window.alert(err?.response?.data?.message || "Không thể thêm danh sách.");
    }
  };

  // ── Invite ──────────────────────────────────────────────────────────────────
  const handleInviteMember = async (event) => {
    event.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    if (!email) { setInviteError("Vui lòng nhập email."); return; }

    setInviteLoading(true);
    setInviteError("");
    setInviteSuccess("");

    try {
      const usersRes = await api.get("/api/users");
      const users = Array.isArray(usersRes.data) ? usersRes.data : [];
      const targetUser = users.find((u) => String(u?.email || "").toLowerCase() === email);
      if (!targetUser) {
        setInviteError("Không tìm thấy người dùng với email này.");
        notify.error("Không tìm thấy người dùng với email này.");
        return;
      }

      const targetUserId = String(targetUser?._id || targetUser?.id || "");
      if (!targetUserId) {
        setInviteError("Không xác định được người dùng để mời.");
        notify.error("Không xác định được người dùng để mời.");
        return;
      }

      const response = await api.post(`/api/boards/${boardId}/members`, { userId: targetUserId, role: "member" });
      const created = mapBoardMemberToUi(response.data || {});
      setBoardMembers((prev) => {
        const idx = prev.findIndex((m) => m.userId === created.userId);
        if (idx === -1) return [...prev, created];
        const next = [...prev];
        next[idx] = { ...next[idx], ...created };
        return next;
      });
      setInviteSuccess("Đã mời thành viên vào bảng.");
      setInviteEmail("");
    } catch (err) {
      const msg = err?.response?.data?.message || "Không thể mời thành viên.";
      setInviteError(msg);
      notify.error(msg);
    } finally {
      setInviteLoading(false);
    }
  };

  return {
    boardId, workspaceId, boardMeta, lists, cards, loading, loadError,
    boardMembers, bannerVisible, setBannerVisible,
    selectedCard, setSelectedCard,
    addingForListId, composerTitle, setComposerTitle,
    draggingCardId, dragOverListId, dragOverCardId,
    listComposerOpen, newListTitle, setNewListTitle, newListError,
    inviteOpen, setInviteOpen, inviteEmail, setInviteEmail,
    inviteLoading, inviteError, inviteSuccess,
    listColumns,
    handleSaveCard, handleDeleteCard,
    handleCardDragStart, handleCardDragEnd, handleCardDragOver,
    handleListDragOver, handleListDragLeave, handleListDrop, handleCardDrop,
    openComposer, closeComposer, submitCard,
    openListComposer, closeListComposer, submitNewList,
    handleInviteMember,
    navigate,
  };
}
