import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftRight,
  Calendar,
  Globe,
  Grid3x3,
  LayoutGrid,
  Lightbulb,
  Mail,
  MoreHorizontal,
  Plus,
  Sparkles,
  SquareArrowOutUpRight,
  Star,
  X,
} from "lucide-react";
import Header from "../../components/Header";

const STORAGE_KEY = "workspaces";
const LEGACY_STORAGE_KEY = "trelloWorkspaces";

const DEFAULT_LISTS = [
  { id: "list-todo", title: "Todo", cards: [] },
  { id: "list-doing", title: "Doing", cards: [] },
  { id: "list-review", title: "Review", cards: [] },
  { id: "list-done", title: "Done", cards: [] },
];

function loadWorkspaces() {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function findBoardById(workspaces, boardId) {
  for (const ws of workspaces) {
    const board = (ws.boards || []).find((b) => b.id === boardId);
    if (board) return { workspace: ws, board };
  }
  return null;
}

function cloneDefaultLists() {
  return DEFAULT_LISTS.map((l) => ({ ...l, cards: [...(l.cards || [])] }));
}

function getListsForBoard(boardId) {
  const workspaces = loadWorkspaces();
  const r = findBoardById(workspaces, boardId);
  if (!r?.board) return cloneDefaultLists();
  const raw = r.board.lists;
  if (raw && Array.isArray(raw) && raw.length > 0) {
    return raw.map((l) => ({
      ...l,
      cards: Array.isArray(l.cards) ? [...l.cards] : [],
    }));
  }
  return cloneDefaultLists();
}

function persistBoardLists(boardId, workspaceId, lists) {
  const workspaces = loadWorkspaces();
  const next = workspaces.map((ws) => {
    if (ws.id !== workspaceId) return ws;
    return {
      ...ws,
      boards: (ws.boards || []).map((b) =>
        b.id === boardId ? { ...b, lists } : b,
      ),
    };
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  if (localStorage.getItem(LEGACY_STORAGE_KEY)) {
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(next));
  }
}

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

function BoardDetail() {
  const { boardId: boardIdParam } = useParams();
  const navigate = useNavigate();
  const boardId = boardIdParam ? decodeURIComponent(boardIdParam) : "";

  const [bannerVisible, setBannerVisible] = useState(true);
  const [plannerOpen, setPlannerOpen] = useState(true);
  const [listColumns, setListColumns] = useState(() =>
    getListsForBoard(boardId),
  );
  const [addingForListId, setAddingForListId] = useState(null);
  const [composerTitle, setComposerTitle] = useState("");
  const [draggingCardId, setDraggingCardId] = useState(null);
  const [dragOverListId, setDragOverListId] = useState(null);
  const [listComposerOpen, setListComposerOpen] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [newListError, setNewListError] = useState("");

  const resolved = useMemo(() => {
    const workspaces = loadWorkspaces();
    return findBoardById(workspaces, boardId);
  }, [boardId]);

  useEffect(() => {
    setListColumns(getListsForBoard(boardId));
    setAddingForListId(null);
    setComposerTitle("");
    setDraggingCardId(null);
    setDragOverListId(null);
    setListComposerOpen(false);
    setNewListTitle("");
    setNewListError("");
  }, [boardId]);

  const boardName = resolved?.board?.name ?? "Bảng";
  const workspaceName = resolved?.workspace?.name ?? "";
  const workspaceId = resolved?.workspace?.id ?? null;

  const openComposer = (listId) => {
    setAddingForListId(listId);
    setComposerTitle("");
  };

  const closeComposer = () => {
    setAddingForListId(null);
    setComposerTitle("");
  };

  const submitCard = (listId) => {
    const trimmed = composerTitle.trim();
    if (!trimmed || workspaceId == null) return;
    const card = { id: `card-${Date.now()}`, title: trimmed };
    const next = listColumns.map((l) =>
      l.id === listId ? { ...l, cards: [...(l.cards || []), card] } : l,
    );
    setListColumns(next);
    persistBoardLists(boardId, workspaceId, next);
    closeComposer();
  };

  const showTips = () => {
    window.alert(
      "Mẹo: Dán liên kết vào ô tiêu đề để tạo thẻ với xem trước trang web. Bạn cũng có thể nhấn Enter để thêm nhanh sau khi gõ xong.",
    );
  };

  const moveCardBetweenLists = (fromListId, toListId, cardId) => {
    if (workspaceId == null || !cardId || !fromListId || !toListId) return;
    if (fromListId === toListId) return;

    setListColumns((prev) => {
      const next = prev.map((l) => ({
        ...l,
        cards: [...(l.cards || [])],
      }));
      const fromList = next.find((l) => l.id === fromListId);
      const toList = next.find((l) => l.id === toListId);
      if (!fromList || !toList) return prev;

      const cardIndex = fromList.cards.findIndex((c) => c.id === cardId);
      if (cardIndex === -1) return prev;

      const [card] = fromList.cards.splice(cardIndex, 1);
      toList.cards.push(card);
      persistBoardLists(boardId, workspaceId, next);
      return next;
    });
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
  };

  const handleListDragOver = (e, listId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverListId(listId);
  };

  const handleListDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverListId(null);
    }
  };

  const handleListDrop = (e, toListId) => {
    e.preventDefault();
    const data = parseDragCardPayload(e);
    setDragOverListId(null);
    setDraggingCardId(null);
    if (!data) return;
    moveCardBetweenLists(data.fromListId, toListId, data.cardId);
  };

  const closeListComposer = () => {
    setListComposerOpen(false);
    setNewListTitle("");
    setNewListError("");
  };

  const submitNewList = () => {
    const trimmed = newListTitle.trim();
    if (!trimmed) {
      setNewListError("Vui lòng nhập tên danh sách.");
      return;
    }
    if (workspaceId == null) return;
    const newList = {
      id: `list-${Date.now()}`,
      title: trimmed,
      cards: [],
    };
    const next = [...listColumns, newList];
    setListColumns(next);
    persistBoardLists(boardId, workspaceId, next);
    closeListComposer();
  };

  const handleHeaderCreateBoard = () => {
    navigate("/home");
  };

  if (!resolved) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0f1214] px-4 text-center text-[#9fadbc]">
        <p className="text-lg text-white">Không tìm thấy bảng</p>
        <p className="max-w-md text-sm">
          Bảng có thể đã bị xóa hoặc liên kết không đúng.
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

      <div className="relative z-10 flex min-h-0 flex-1">
        {/* Sidebar trình lập kế hoạch */}
        {plannerOpen && (
          <aside className="hidden w-[280px] shrink-0 flex-col border-r border-white/10 bg-[#1d2125]/80 backdrop-blur-sm lg:flex">
            <div className="border-b border-white/10 p-4">
              <h2 className="text-sm font-semibold text-white">
                Trình lập kế hoạch
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-[#8b9bab]">
                Kết nối lịch để xem thẻ có hạn ở đây.
              </p>
              <button
                type="button"
                className="mt-3 w-full rounded-md bg-[#579dff] py-2 text-xs font-semibold text-[#0c1f3d] hover:bg-[#6cabff]"
              >
                Kết nối tài khoản
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-3">
              <div className="h-full rounded-lg border border-dashed border-[#3c444d] bg-[#22272b]/50 p-2">
                <div className="flex justify-between border-b border-[#3c444d] pb-2 text-[10px] text-[#6b7785]">
                  <span>8:00</span>
                  <span>12:00</span>
                </div>
                <div className="mt-2 space-y-2">
                  <div className="h-2 w-3/4 rounded bg-emerald-500/70" />
                  <div className="h-2 w-1/2 rounded bg-violet-500/70" />
                  <div className="h-2 w-2/3 rounded bg-orange-500/70" />
                </div>
              </div>
            </div>
          </aside>
        )}

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Header bảng */}
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
              <div className="flex -space-x-1">
                {["NH", "A", "B"].map((x) => (
                  <span
                    key={x}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#1d2125] bg-[#4b9e7a] text-[10px] font-bold text-white"
                  >
                    {x}
                  </span>
                ))}
              </div>
              <button
                type="button"
                className="rounded-md bg-[#3d454c] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#4a535c]"
              >
                Chia sẻ
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

          {/* Các danh sách */}
          <div className="flex flex-1 gap-3 overflow-x-auto overflow-y-hidden px-3 pb-24 pt-1 sm:px-4">
            {listColumns.map((list) => {
              const isComposing = addingForListId === list.id;
              const cards = list.cards || [];
              const showEmptyHint = cards.length === 0 && !isComposing;

              return (
                <div
                  key={list.id}
                  className="flex w-[272px] shrink-0 flex-col max-h-[calc(100vh-220px)] rounded-xl bg-[#101204]/85 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between gap-2 px-3 py-2">
                    <h2 className="truncate text-sm font-semibold text-[#d1d7e0]">
                      {list.title}
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
                    {cards.map((card) => (
                      <div
                        key={card.id}
                        draggable
                        onDragStart={(e) =>
                          handleCardDragStart(e, list.id, card)
                        }
                        onDragEnd={handleCardDragEnd}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                          setDragOverListId(list.id);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleListDrop(e, list.id);
                        }}
                        aria-grabbed={draggingCardId === card.id}
                        className={`cursor-grab rounded-lg bg-[#22272b] px-3 py-2 text-sm text-[#d1d7e0] shadow-sm active:cursor-grabbing hover:bg-[#2c333a] ${
                          draggingCardId === card.id ? "opacity-40" : ""
                        }`}
                      >
                        {card.title}
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
                        placeholder="Nhập tiêu đề hoặc dán liên kết"
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
                          onClick={showTips}
                          className="inline-flex items-center gap-1.5 rounded-md bg-[#6d5de7] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#7d6df0]"
                        >
                          <Lightbulb className="h-3.5 w-3.5" aria-hidden />
                          Mẹo
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

      {/* Thanh dưới */}
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
            onClick={() => setPlannerOpen((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium hover:bg-[#3d454c] ${
              plannerOpen
                ? "border-b-2 border-[#579dff] text-white"
                : "text-[#9fadbc] hover:text-white"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            Trình lập kế hoạch
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
