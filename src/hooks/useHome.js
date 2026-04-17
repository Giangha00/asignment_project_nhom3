import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import { useNotifications } from "../context/NotificationContext";
import {
  deliverBoardShareFromPayload,
  deliverBoardShareNotification,
} from "../lib/boardInviteNotification";
import { extractUserId } from "../lib/ids";
import { useWorkspaceShell } from "./useWorkspaceShell";
import { getSocket } from "../lib/socket";

function initialsFromName(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
}

export function useHome(currentUser) {
  const { workspaceId: workspaceIdParam, section: sectionParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("home");
  const { addNotification } = useNotifications();

  const myUserId = extractUserId(currentUser);
  const myEmail = String(currentUser?.email || "").toLowerCase();

  const {
    activeWorkspace,
    activeWorkspaceId,
    addBoardToWorkspace,
    inviteMember,
    leaveWorkspace,
    removeMember,
    refreshWorkspaceMembers,
    removeBoardFromWorkspace,
    removeWorkspace,
    resolvedUser,
    setActiveWorkspaceId,
    toggleWorkspace,
    updateBoardInWorkspace,
    upsertWorkspace,
    workspaces,
  } = useWorkspaceShell(currentUser, workspaceIdParam || null);

  /**
   * Cùng một lời mời workspace có thể tới qua socket và qua effect đồng bộ GET /members sau load trang;
   * ref giữ rowKey đã xử lý trong phiên để không gọi addNotification hai lần.
   */
  const workspaceInviteDeliveredRef = useRef(new Set());

  /**
   * Chỉ khi user hiện tại là người được mời (target) và có invitedBy: đẩy mục vào panel chuông.
   * Không bật Toast — chỉ addNotification (Toastify dùng riêng cho lỗi ở màn khác).
   */
  const deliverWorkspaceInvite = useCallback(
    async ({ wid, memberRowId, invitedById, targetUserId }) => {
      if (!myUserId || !targetUserId || targetUserId !== myUserId) return;
      if (!invitedById || invitedById === myUserId) return;

      const rowKey = String(memberRowId || `${wid}:${myUserId}`);
      if (workspaceInviteDeliveredRef.current.has(rowKey)) return;

      let workspaceName =
        workspaces.find((w) => w.id === wid)?.name || "";
      if (!workspaceName) {
        try {
          const wsRes = await api.get(`/api/workspaces/${wid}`);
          workspaceName = wsRes.data?.name || "Workspace";
        } catch {
          workspaceName = "Workspace";
        }
      }

      let inviterName = "Một thành viên";
      let inviterInitials = "?";
      try {
        const usersRes = await api.get("/api/users");
        const users = Array.isArray(usersRes.data) ? usersRes.data : [];
        const inviter = users.find(
          (u) => String(u?._id || u?.id || "") === invitedById,
        );
        if (inviter) {
          inviterName =
            inviter.fullName ||
            inviter.name ||
            inviter.username ||
            inviterName;
          inviterInitials = initialsFromName(inviterName);
        }
      } catch {
        // giữ mặc định
      }

      workspaceInviteDeliveredRef.current.add(rowKey);

      addNotification({
        kind: "workspace_invite",
        persistKey: `ws_member:${rowKey}`,
        actorName: inviterName,
        actorInitials: inviterInitials,
        actionLine: "đã thêm bạn vào workspace",
        targetLabel: workspaceName,
        targetHref: `/workspace/${encodeURIComponent(wid)}/home`,
        metaLine: myEmail
          ? `Tài khoản ${myEmail} vừa được thêm vào không gian làm việc.`
          : undefined,
      });
    },
    [addNotification, myEmail, myUserId, workspaces],
  );

  useEffect(() => {
    const focus = location.state?.workspaceShellFocus;
    if (!focus?.workspaceId || !focus?.section) return;
    setActiveWorkspaceId(focus.workspaceId);
    setActiveSection(focus.section);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, location.pathname, navigate, setActiveWorkspaceId]);

  const getBoardApiId = (board) =>
    String(board?.apiId || board?._id || board?.boardId || board?.id || "");

  const boardDescriptionForVisibility = (visibility) => {
    const visibilityLabel =
      visibility === "private"
        ? "Riêng tư"
        : visibility === "public"
          ? "Công khai"
          : "Không gian làm việc";
    return `Quyền xem: ${visibilityLabel}`;
  };

  const normalizeSectionFromPath = (section) => {
    if (!section) return "home";
    if (section === "boards") return "board";
    return section;
  };

  useEffect(() => {
    setActiveSection(normalizeSectionFromPath(sectionParam));
  }, [sectionParam]);

  useEffect(() => {
    if (workspaceIdParam) {
      setActiveWorkspaceId(workspaceIdParam);
    }
  }, [workspaceIdParam, setActiveWorkspaceId]);

  /**
   * Người được mời thường CHƯA join socket room `workspace:*` tại thời điểm emit → họ không nhận
   * `workspaceMember:upserted`. Sau khi GET /workspaces có workspace mới, đồng bộ từ API members
   * (invitedBy + joinedAt) để vẫn có thông báo trong panel — dữ liệu thật từ backend.
   */
  const workspaceIdsSignature = workspaces
    .map((w) => w?.id)
    .filter((id) => id && id !== "default-workspace")
    .sort()
    .join(",");

  useEffect(() => {
    if (!myUserId || !workspaceIdsSignature) return;
    let cancelled = false;
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000;

    const run = async () => {
      const ids = workspaceIdsSignature.split(",").filter(Boolean);
      for (const wid of ids) {
        if (cancelled) return;
        try {
          const res = await api.get(`/api/workspaces/${wid}/members`);
          const rows = Array.isArray(res.data) ? res.data : [];
          const mine = rows.find(
            (r) => extractUserId(r.userId) === myUserId,
          );
          if (!mine) continue;

          const invitedById = extractUserId(mine.invitedBy);
          if (!invitedById || invitedById === myUserId) continue;

          const ja = mine.joinedAt ? new Date(mine.joinedAt).getTime() : 0;
          if (!ja || Date.now() - ja > maxAgeMs) continue;

          await deliverWorkspaceInvite({
            wid,
            memberRowId: String(mine._id || mine.id || ""),
            invitedById,
            targetUserId: extractUserId(mine.userId),
          });
        } catch {
          // bỏ qua workspace không đọc được
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [workspaceIdsSignature, myUserId, deliverWorkspaceInvite]);

  /**
   * Đồng bộ thông báo chia sẻ bảng sau load (giống workspace): GET /boards/:id/members,
   * bản ghi của user + createdAt gần đây — không cần invitedBy (API board member không có field đó).
   */
  const boardsWorkspaceSignature = useMemo(() => {
    const parts = [];
    for (const w of workspaces) {
      if (!w?.id || w.id === "default-workspace") continue;
      for (const b of w.boards || []) {
        const bid = String(b?.apiId || b?._id || b?.boardId || b?.id || "");
        if (bid) parts.push(`${w.id}/${bid}`);
      }
    }
    return parts.sort().join(",");
  }, [workspaces]);

  useEffect(() => {
    if (!myUserId || !boardsWorkspaceSignature) return;
    let cancelled = false;
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000;

    const run = async () => {
      const pairs = boardsWorkspaceSignature.split(",").filter(Boolean);
      for (const pair of pairs) {
        if (cancelled) return;
        const slash = pair.indexOf("/");
        if (slash === -1) continue;
        const wid = pair.slice(0, slash);
        const bid = pair.slice(slash + 1);
        if (!wid || !bid) continue;
        try {
          const res = await api.get(`/api/boards/${bid}/members`);
          const rows = Array.isArray(res.data) ? res.data : [];
          const mine = rows.find(
            (r) => extractUserId(r.userId) === myUserId,
          );
          if (!mine) continue;

          const created = mine.createdAt
            ? new Date(mine.createdAt).getTime()
            : 0;
          if (!created || Date.now() - created > maxAgeMs) continue;

          await deliverBoardShareNotification({
            addNotification,
            myUserId,
            myEmail,
            boardId: bid,
            memberRowId: String(mine._id || mine.id || ""),
            invitedById: extractUserId(mine.invitedBy),
            targetUserId: extractUserId(mine.userId),
            workspaces,
          });
        } catch {
          // bỏ qua bảng không đọc được
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [boardsWorkspaceSignature, myUserId, addNotification, myEmail, workspaces]);

  // Socket: vào phòng từng workspace + từng bảng (để nhận boardMember:upserted khi đang ở Home).
  useEffect(() => {
    const socket = getSocket();
    const workspaceIds = workspaces
      .map((ws) => ws?.id)
      .filter((id) => id && id !== "default-workspace");

    workspaceIds.forEach((workspaceId) => {
      socket.emit("join:workspace", workspaceId);
    });

    const boardIds = [
      ...new Set(
        workspaces.flatMap((ws) =>
          (Array.isArray(ws?.boards) ? ws.boards : []).map((b) =>
            getBoardApiId(b),
          ),
        ),
      ),
    ].filter(Boolean);

    boardIds.forEach((bid) => {
      socket.emit("join:board", bid);
    });

    const handleBoardCreated = (payload) => {
      const workspaceId = String(payload?.workspaceId || "");
      const boardId = getBoardApiId(payload);
      if (!workspaceId || !boardId) return;
      addBoardToWorkspace(workspaceId, {
        ...payload,
        id: boardId,
        apiId: boardId,
      });
    };

    const handleBoardUpdated = (payload) => {
      const workspaceIdFromPayload = String(payload?.workspaceId || "");
      const boardId = getBoardApiId(payload);
      if (!boardId) return;

      const resolvedWorkspaceId =
        workspaceIdFromPayload ||
        workspaces.find((ws) =>
          (Array.isArray(ws?.boards) ? ws.boards : []).some(
            (board) => board.id === boardId,
          ),
        )?.id;

      if (!resolvedWorkspaceId) return;
      updateBoardInWorkspace(resolvedWorkspaceId, boardId, {
        ...payload,
        id: boardId,
        apiId: boardId,
      });
    };

    const handleBoardDeleted = (payload) => {
      const boardId = String(
        payload?.id || payload?._id || payload?.boardId || "",
      );
      if (!boardId) return;
      const workspaceId = workspaces.find((ws) =>
        (Array.isArray(ws?.boards) ? ws.boards : []).some(
          (board) => board.id === boardId,
        ),
      )?.id;
      if (!workspaceId) return;
      removeBoardFromWorkspace(workspaceId, boardId);
    };

    // Backend emit khi thêm/cập nhật membership: refresh UI + thử đẩy thông báo panel nếu payload là “bạn được mời”.
    const handleWorkspaceMemberUpserted = async (payload) => {
      const wid = String(payload?.workspaceId || "");
      if (!wid || wid === "default-workspace") return;

      refreshWorkspaceMembers(wid);

      await deliverWorkspaceInvite({
        wid,
        memberRowId: String(payload?._id || payload?.id || ""),
        invitedById: extractUserId(payload?.invitedBy),
        targetUserId: extractUserId(payload?.userId),
      });
    };

    const handleWorkspaceMemberUpdated = (payload) => {
      const wid = String(payload?.workspaceId || "");
      if (!wid || wid === "default-workspace") return;
      refreshWorkspaceMembers(wid);
    };

    // Payload removed chỉ có id bản ghi membership — tìm workspace đang chứa member đó rồi refresh.
    const handleWorkspaceMemberRemoved = (payload) => {
      const memberId = String(payload?.id || payload?._id || "");
      if (!memberId) return;
      const ws = workspaces.find((w) =>
        (Array.isArray(w?.members) ? w.members : []).some(
          (m) =>
            String(m.id) === memberId ||
            String(m._id) === memberId ||
            String(m.memberId) === memberId,
        ),
      );
      if (!ws?.id || ws.id === "default-workspace") return;
      refreshWorkspaceMembers(ws.id);
    };

    const handleBoardMemberUpserted = async (payload) => {
      await deliverBoardShareFromPayload(payload, {
        addNotification,
        myUserId,
        myEmail,
        workspaces,
      });
    };

    socket.on("board:created", handleBoardCreated);
    socket.on("board:updated", handleBoardUpdated);
    socket.on("board:deleted", handleBoardDeleted);
    socket.on("workspaceMember:upserted", handleWorkspaceMemberUpserted);
    socket.on("workspaceMember:updated", handleWorkspaceMemberUpdated);
    socket.on("workspaceMember:removed", handleWorkspaceMemberRemoved);
    socket.on("boardMember:upserted", handleBoardMemberUpserted);

    return () => {
      socket.off("board:created", handleBoardCreated);
      socket.off("board:updated", handleBoardUpdated);
      socket.off("board:deleted", handleBoardDeleted);
      socket.off("workspaceMember:upserted", handleWorkspaceMemberUpserted);
      socket.off("workspaceMember:updated", handleWorkspaceMemberUpdated);
      socket.off("workspaceMember:removed", handleWorkspaceMemberRemoved);
      socket.off("boardMember:upserted", handleBoardMemberUpserted);
      workspaceIds.forEach((workspaceId) => {
        socket.emit("leave:workspace", workspaceId);
      });
      boardIds.forEach((bid) => {
        socket.emit("leave:board", bid);
      });
    };
  }, [
    addBoardToWorkspace,
    addNotification,
    deliverWorkspaceInvite,
    myEmail,
    myUserId,
    refreshWorkspaceMembers,
    removeBoardFromWorkspace,
    updateBoardInWorkspace,
    workspaces,
  ]);

  const handleSelectSection = ({ workspaceId, section }) => {
    if (workspaceId) {
      setActiveWorkspaceId(workspaceId);
    }
    setActiveSection(section || "home");
  };

  /** Rời workspace (chỉ chính user): sau khi thành công chuyển URL sang workspace còn lại hoặc /home. */
  const handleLeaveWorkspace = useCallback(
    async (workspaceId, member) => {
      const result = await leaveWorkspace(workspaceId, member);
      if (result?.ok === false) return result;
      if (!workspaceId || workspaceId === "default-workspace") return result;
      const next = result?.nextWorkspaceId;
      if (next) {
        navigate(`/workspace/${encodeURIComponent(next)}/home`, { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
      return result;
    },
    [leaveWorkspace, navigate]
  );

  const handleWorkspaceCreated = (workspaceInput) => {
    upsertWorkspace({
      ...workspaceInput,
      isOpen: workspaceInput?.isOpen ?? true,
    });
  };

  const handleCreateWorkspace = async (newWorkspace) => {
    const response = await api.post("/api/workspaces", {
      name: newWorkspace.name,
      description: newWorkspace.description || "",
      visibility: newWorkspace.visibility || "private",
    });

    const workspace = upsertWorkspace({
      ...response.data,
      type: newWorkspace.type || "default",
      color: newWorkspace.color || "#2f67ff",
      isOpen: true,
    });

    return workspace;
  };

  const handleUpdateWorkspace = (workspaceInput) => {
    upsertWorkspace(workspaceInput);
  };

  const handleCreateBoard = async (payload = "board") => {
    let targetWorkspaceId = activeWorkspaceId ?? workspaces[0]?.id;
    if (payload && typeof payload === "object" && payload.workspaceId) {
      targetWorkspaceId = payload.workspaceId;
    }
    if (targetWorkspaceId === "default-workspace") {
      const persistedWorkspace = workspaces.find(
        (ws) => ws.id && ws.id !== "default-workspace",
      );
      if (!persistedWorkspace) {
        alert(
          "Không thể lưu bảng trong workspace mặc định. Vui lòng tạo workspace thật trước.",
        );
        return;
      }
      targetWorkspaceId = persistedWorkspace.id;
    }
    const targetWorkspace = workspaces.find(
      (ws) => ws.id === targetWorkspaceId,
    );
    if (!targetWorkspace) return;
    const targetBoards = Array.isArray(targetWorkspace.boards)
      ? targetWorkspace.boards
      : [];

    const nextIndex = targetBoards.length + 1;

    const boardNames = {
      board: `Bảng mới ${nextIndex}`,
      "workspace-view": `Bảng xem ${nextIndex}`,
      template: `Bảng mẫu ${nextIndex}`,
    };

    const boardDescriptions = {
      board: "Bảng mới được tạo từ Header",
      "workspace-view": "Bảng dạng xem không gian làm việc",
      template: "Bảng bắt đầu với mẫu",
    };

    let boardName = "";
    let boardDescription = "";

    if (payload && typeof payload === "object" && payload.title) {
      boardName = payload.title;
      if (payload.description && String(payload.description).trim()) {
        boardDescription = String(payload.description).trim();
      } else {
        boardDescription = boardDescriptionForVisibility(
          payload.visibility || "workspace",
        );
      }
    } else {
      const option = typeof payload === "string" ? payload : "board";
      boardName = boardNames[option] || `Bảng mới ${nextIndex}`;
      boardDescription =
        boardDescriptions[option] || "Bảng mới được tạo từ Header";
    }

    try {
      const response = await api.post("/api/boards", {
        workspaceId: targetWorkspaceId,
        name: boardName,
        description: boardDescription,
        visibility:
          payload && typeof payload === "object" && payload.visibility
            ? payload.visibility
            : "workspace",
        ...(payload && typeof payload === "object" && payload.coverUrl
          ? { coverUrl: payload.coverUrl }
          : {}),
      });
      const createdBoard = response.data || {};
      addBoardToWorkspace(targetWorkspaceId, {
        ...createdBoard,
        id: getBoardApiId(createdBoard),
        apiId: getBoardApiId(createdBoard),
        name: createdBoard.name || boardName,
        description: createdBoard.description || boardDescription,
      });
    } catch (error) {
      console.error("Failed to create board:", error);
      const apiMessage =
        error.response?.data?.message || error.response?.data?.error;
      alert(apiMessage || "Không thể tạo bảng. Vui lòng thử lại.");
      return;
    }

    setActiveSection("board");
  };

  const handleUpdateBoard = async (workspaceId, boardId, patch) => {
    const targetWorkspace = workspaces.find((ws) => ws.id === workspaceId);
    const board = (targetWorkspace?.boards || []).find(
      (item) => item.id === boardId,
    );
    if (!board) return;

    const patchToSend =
      patch.visibility !== undefined && patch.description === undefined
        ? {
            ...patch,
            description: boardDescriptionForVisibility(patch.visibility),
          }
        : { ...patch };

    if (workspaceId === "default-workspace") {
      updateBoardInWorkspace(workspaceId, boardId, patchToSend);
      return;
    }

    const apiId = getBoardApiId(board);
    if (!apiId) {
      updateBoardInWorkspace(workspaceId, boardId, patchToSend);
      return;
    }

    try {
      const response = await api.patch(`/api/boards/${apiId}`, patchToSend);
      const updated = response.data || {};
      updateBoardInWorkspace(workspaceId, boardId, {
        ...updated,
        id: getBoardApiId(updated) || boardId,
        apiId: getBoardApiId(updated) || apiId,
      });
    } catch (error) {
      console.error("Failed to update board:", error);
      const apiMessage =
        error.response?.data?.message || error.response?.data?.error;
      alert(apiMessage || "Không thể sửa bảng. Vui lòng thử lại.");
    }
  };

  const openBoardDetailPage = (workspaceId, board) => {
    const nextBoardId = String(
      board?.apiId || board?._id || board?.boardId || board?.id || "",
    );
    if (!workspaceId || !nextBoardId) return;
    navigate(
      `/workspace/${encodeURIComponent(workspaceId)}/board/${encodeURIComponent(nextBoardId)}`,
    );
  };

  const handleDeleteBoard = async (workspaceId, boardId) => {
    const targetWorkspace = workspaces.find((ws) => ws.id === workspaceId);
    const board = (targetWorkspace?.boards || []).find(
      (item) => item.id === boardId,
    );
    if (!board) return;

    if (workspaceId === "default-workspace") {
      removeBoardFromWorkspace(workspaceId, boardId);
      return;
    }

    const apiId = getBoardApiId(board);
    if (!apiId) {
      removeBoardFromWorkspace(workspaceId, boardId);
      return;
    }

    try {
      await api.delete(`/api/boards/${apiId}`);
      removeBoardFromWorkspace(workspaceId, boardId);
    } catch (error) {
      console.error("Failed to delete board:", error);
      const apiMessage =
        error.response?.data?.message || error.response?.data?.error;
      alert(apiMessage || "Không thể xóa bảng. Vui lòng thử lại.");
    }
  };

  return {
    activeSection,
    activeWorkspace,
    activeWorkspaceId,
    resolvedUser,
    workspaces,
    inviteMember,
    handleLeaveWorkspace,
    removeMember,
    removeWorkspace,
    toggleWorkspace,
    handleSelectSection,
    handleWorkspaceCreated,
    handleCreateWorkspace,
    handleUpdateWorkspace,
    handleCreateBoard,
    handleUpdateBoard,
    openBoardDetailPage,
    handleDeleteBoard,
  };
}
