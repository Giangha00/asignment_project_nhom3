import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HomeContent from "./HomeContent";
import api from "../../lib/api";
import { useWorkspaceShell } from "../../hooks/useWorkspaceShell";
import WorkspaceLayout from "../../layouts/WorkspaceLayout";
import ContentBoard from "../../components/ContentBoard";
import MemberContent from "../../components/MemberContent";
import { getSocket } from "../../lib/socket";

function Home({ currentUser, onLogout }) {
  const { workspaceId: workspaceIdParam, section: sectionParam } = useParams();
  const navigate = useNavigate();

  const normalizeSectionFromPath = (pathSection) => {
    if (pathSection === "boards") return "board";
    if (pathSection === "members") return "members";
    if (pathSection === "settings") return "settings";
    return "home";
  };

  const [activeSection, setActiveSection] = useState(
    normalizeSectionFromPath(sectionParam)
  );
  const {
    activeWorkspace,
    activeWorkspaceId,
    addBoardToWorkspace,
    changeMemberRole,
    inviteMember,
    leaveWorkspace,
    removeBoardFromWorkspace,
    removeMember,
    removeWorkspace,
    resolvedUser,
    setActiveWorkspaceId,
    toggleWorkspace,
    updateBoardInWorkspace,
    upsertWorkspace,
    workspaces,
  } = useWorkspaceShell(currentUser, workspaceIdParam || null);

  const getBoardApiId = (board) =>
    String(board?.apiId || board?._id || board?.boardId || board?.id || "");

  /** Mô tả mặc định đồng bộ với quyền xem (giống lúc tạo bảng trong handleCreateBoard). */
  const boardDescriptionForVisibility = (visibility) => {
    const visibilityLabel =
      visibility === "private"
        ? "Riêng tư"
        : visibility === "public"
          ? "Công khai"
          : "Không gian làm việc";
    return `Quyền xem: ${visibilityLabel}`;
  };

  useEffect(() => {
    setActiveSection(normalizeSectionFromPath(sectionParam));
  }, [sectionParam]);

  useEffect(() => {
    if (workspaceIdParam) {
      setActiveWorkspaceId(workspaceIdParam);
    }
  }, [workspaceIdParam, setActiveWorkspaceId]);

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
          (Array.isArray(ws?.boards) ? ws.boards : []).some((board) => board.id === boardId)
        )?.id;

      if (!resolvedWorkspaceId) return;
      updateBoardInWorkspace(resolvedWorkspaceId, boardId, {
        ...payload,
        id: boardId,
        apiId: boardId,
      });
    };

    const handleBoardDeleted = (payload) => {
      const boardId = String(payload?.id || payload?._id || payload?.boardId || "");
      if (!boardId) return;
      const workspaceId = workspaces.find((ws) =>
        (Array.isArray(ws?.boards) ? ws.boards : []).some((board) => board.id === boardId)
      )?.id;
      if (!workspaceId) return;
      removeBoardFromWorkspace(workspaceId, boardId);
    };

    socket.on("board:created", handleBoardCreated);
    socket.on("board:updated", handleBoardUpdated);
    socket.on("board:deleted", handleBoardDeleted);

    return () => {
      socket.off("board:created", handleBoardCreated);
      socket.off("board:updated", handleBoardUpdated);
      socket.off("board:deleted", handleBoardDeleted);
      workspaceIds.forEach((workspaceId) => {
        socket.emit("leave:workspace", workspaceId);
      });
    };
  }, [
    addBoardToWorkspace,
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
    upsertWorkspace({ ...workspaceInput, isOpen: workspaceInput?.isOpen ?? true });
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

  const handleCreateBoard = async (payload = 'board') => {
    let targetWorkspaceId = activeWorkspaceId ?? workspaces[0]?.id;
    if (payload && typeof payload === 'object' && payload.workspaceId) {
      targetWorkspaceId = payload.workspaceId;
    }
    if (targetWorkspaceId === "default-workspace") {
      // "default-workspace" is UI-only and does not exist in DB.
      // Route board creation to the first persisted workspace to avoid data loss after reload.
      const persistedWorkspace = workspaces.find((ws) => ws.id && ws.id !== "default-workspace");
      if (!persistedWorkspace) {
        alert("Không thể lưu bảng trong workspace mặc định. Vui lòng tạo workspace thật trước.");
        return;
      }
      targetWorkspaceId = persistedWorkspace.id;
    }
    const targetWorkspace = workspaces.find(ws => ws.id === targetWorkspaceId);
    if (!targetWorkspace) return;
    const targetBoards = Array.isArray(targetWorkspace.boards)
      ? targetWorkspace.boards
      : [];

    const nextIndex = targetBoards.length + 1;

    const boardNames = {
      board: `Bảng mới ${nextIndex}`,
      'workspace-view': `Bảng xem ${nextIndex}`,
      template: `Bảng mẫu ${nextIndex}`
    };

    const boardDescriptions = {
      board: 'Bảng mới được tạo từ Header',
      'workspace-view': 'Bảng dạng xem không gian làm việc',
      template: 'Bảng bắt đầu với mẫu'
    };

    let boardName = '';
    let boardDescription = '';

    if (payload && typeof payload === 'object' && payload.title) {
      boardName = payload.title;
      if (payload.description && String(payload.description).trim()) {
        boardDescription = String(payload.description).trim();
      } else {
        boardDescription = boardDescriptionForVisibility(
          payload.visibility || "workspace"
        );
      }
    } else {
      const option = typeof payload === 'string' ? payload : 'board';
      boardName = boardNames[option] || `Bảng mới ${nextIndex}`;
      boardDescription = boardDescriptions[option] || 'Bảng mới được tạo từ Header';
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
      const apiMessage = error.response?.data?.message || error.response?.data?.error;
      alert(apiMessage || "Không thể tạo bảng. Vui lòng thử lại.");
      return;
    }

    setActiveSection("board");
  };

  const handleUpdateBoard = async (workspaceId, boardId, patch) => {
    const targetWorkspace = workspaces.find((ws) => ws.id === workspaceId);
    const board = (targetWorkspace?.boards || []).find((item) => item.id === boardId);
    if (!board) return;

    // Khi đổi quyền xem từ form sửa: cập nhật luôn description để không bị kẹt "Quyền xem: ..." cũ.
    const patchToSend =
      patch.visibility !== undefined && patch.description === undefined
        ? { ...patch, description: boardDescriptionForVisibility(patch.visibility) }
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
      const apiMessage = error.response?.data?.message || error.response?.data?.error;
      alert(apiMessage || "Không thể sửa bảng. Vui lòng thử lại.");
    }
  };

  const openBoardDetailPage = (workspaceId, board) => {
    const nextBoardId = String(board?.apiId || board?._id || board?.boardId || board?.id || "");
    if (!workspaceId || !nextBoardId) return;
    navigate(`/workspace/${encodeURIComponent(workspaceId)}/board/${encodeURIComponent(nextBoardId)}`);
  };

  const handleDeleteBoard = async (workspaceId, boardId) => {
    const targetWorkspace = workspaces.find((ws) => ws.id === workspaceId);
    const board = (targetWorkspace?.boards || []).find((item) => item.id === boardId);
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
      const apiMessage = error.response?.data?.message || error.response?.data?.error;
      alert(apiMessage || "Không thể xóa bảng. Vui lòng thử lại.");
    }
  };

  const handleRemoveMember = (member) => {
    if (!activeWorkspace?.id || !member?.id) return;
    removeMember(activeWorkspace.id, member.id);
  };

  const handleLeaveMember = (member) => {
    if (!activeWorkspace?.id || !member?.id) return;
    leaveWorkspace(activeWorkspace.id, member.id);
  };

  const handleChangeMemberRole = (member) => {
    if (!activeWorkspace?.id || !member?.id) return;
    changeMemberRole(activeWorkspace.id, member.id);
  };

  return (
    <WorkspaceLayout
      activeSection={activeSection}
      activeWorkspaceId={activeWorkspaceId}
      onCreateBoard={handleCreateBoard}
      onCreateWorkspace={handleWorkspaceCreated}
      onDeleteWorkspace={removeWorkspace}
      onLogout={onLogout}
      onSelectSection={handleSelectSection}
      onToggleWorkspace={toggleWorkspace}
      onUpdateWorkspace={handleUpdateWorkspace}
      user={resolvedUser}
      workspaces={workspaces}
    >
      {activeSection === "board" ? (
        <ContentBoard
          workspace={activeWorkspace}
          workspaces={workspaces}
          onCreateBoard={handleCreateBoard}
          onUpdateBoard={handleUpdateBoard}
          onDeleteBoard={handleDeleteBoard}
          onSelectBoard={(board) => openBoardDetailPage(activeWorkspace?.id, board)}
        />
      ) : activeSection === "members" ? (
        <MemberContent
          workspace={activeWorkspace}
          onInviteMember={inviteMember}
          onMemberRemove={handleRemoveMember}
          onMemberLeave={handleLeaveMember}
          onMemberChangeRole={handleChangeMemberRole}
        />
      ) : (
        <HomeContent
          workspace={activeWorkspace}
          user={resolvedUser}
          workspaces={workspaces}
          onCreateWorkspace={handleCreateWorkspace}
          onCreateBoard={handleCreateBoard}
          onInviteMember={inviteMember}
          onOpenWorkspaceBoards={(workspaceId) =>
            handleSelectSection({ workspaceId, section: "board" })
          }
          onOpenBoardDetail={openBoardDetailPage}
        />
      )}
    </WorkspaceLayout>
  );
}

export default Home ;
