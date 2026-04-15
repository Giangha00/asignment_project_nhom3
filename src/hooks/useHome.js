import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import { useWorkspaceShell } from "./useWorkspaceShell";
import { getSocket } from "../lib/socket";

export function useHome(currentUser) {
  const { workspaceId: workspaceIdParam, section: sectionParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("home");
  
  const {
    activeWorkspace,
    activeWorkspaceId,
    addBoardToWorkspace,
    inviteMember,
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

  // Socket: vào phòng từng workspace để nhận sự kiện realtime (bảng + thành viên).
  useEffect(() => {
    const socket = getSocket();
    const workspaceIds = workspaces
      .map((ws) => ws?.id)
      .filter((id) => id && id !== "default-workspace");

    workspaceIds.forEach((workspaceId) => {
      socket.emit("join:workspace", workspaceId);
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

    // Backend emit khi thêm/cập nhật membership — payload có workspaceId → gọi API làm mới danh sách.
    const handleWorkspaceMemberUpserted = (payload) => {
      const wid = String(payload?.workspaceId || "");
      if (!wid || wid === "default-workspace") return;
      refreshWorkspaceMembers(wid);
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

    socket.on("board:created", handleBoardCreated);
    socket.on("board:updated", handleBoardUpdated);
    socket.on("board:deleted", handleBoardDeleted);
    socket.on("workspaceMember:upserted", handleWorkspaceMemberUpserted);
    socket.on("workspaceMember:updated", handleWorkspaceMemberUpdated);
    socket.on("workspaceMember:removed", handleWorkspaceMemberRemoved);

    return () => {
      socket.off("board:created", handleBoardCreated);
      socket.off("board:updated", handleBoardUpdated);
      socket.off("board:deleted", handleBoardDeleted);
      socket.off("workspaceMember:upserted", handleWorkspaceMemberUpserted);
      socket.off("workspaceMember:updated", handleWorkspaceMemberUpdated);
      socket.off("workspaceMember:removed", handleWorkspaceMemberRemoved);
      workspaceIds.forEach((workspaceId) => {
        socket.emit("leave:workspace", workspaceId);
      });
    };
  }, [
    addBoardToWorkspace,
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
