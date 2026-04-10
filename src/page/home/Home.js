import React from "react";
import { useNavigate } from "react-router-dom";
import HomeContent from "./HomeContent";
import api from "../../lib/api";
import { useWorkspaceShell } from "../../hooks/useWorkspaceShell";
import WorkspaceLayout from "../../layouts/WorkspaceLayout";

function Home({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const {
    activeWorkspace,
    activeWorkspaceId,
    addBoardToWorkspace,
    inviteMember,
    removeWorkspace,
    resolvedUser,
    toggleWorkspace,
    upsertWorkspace,
    workspaces,
  } = useWorkspaceShell(currentUser);

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

  const handleCreateBoard = (payload = 'board') => {
    let targetWorkspaceId = activeWorkspaceId ?? workspaces[0]?.id;
    if (payload && typeof payload === 'object' && payload.workspaceId) {
      targetWorkspaceId = payload.workspaceId;
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
        const visibilityLabel = payload.visibility === 'private'
          ? 'Riêng tư'
          : payload.visibility === 'public'
            ? 'Công khai'
            : 'Không gian làm việc';
        boardDescription = `Quyền xem: ${visibilityLabel}`;
      }
    } else {
      const option = typeof payload === 'string' ? payload : 'board';
      boardName = boardNames[option] || `Bảng mới ${nextIndex}`;
      boardDescription = boardDescriptions[option] || 'Bảng mới được tạo từ Header';
    }

    const newBoard = {
      id: `board-${targetWorkspace.id}-${Date.now()}`,
      name: boardName,
      description: boardDescription,
    };

    addBoardToWorkspace(targetWorkspaceId, newBoard);
    navigate(`/workspace/${encodeURIComponent(targetWorkspaceId)}/board/${encodeURIComponent(newBoard.id)}`);
  };

  return (
    <WorkspaceLayout
      activeSection="home"
      activeWorkspaceId={activeWorkspaceId}
      onCreateBoard={handleCreateBoard}
      onCreateWorkspace={handleWorkspaceCreated}
      onDeleteWorkspace={removeWorkspace}
      onLogout={onLogout}
      onToggleWorkspace={toggleWorkspace}
      onUpdateWorkspace={handleUpdateWorkspace}
      user={resolvedUser}
      workspaces={workspaces}
    >
      <HomeContent
        workspace={activeWorkspace}
        user={resolvedUser}
        workspaces={workspaces}
        onCreateWorkspace={handleCreateWorkspace}
        onCreateBoard={handleCreateBoard}
        onInviteMember={inviteMember}
      />
    </WorkspaceLayout>
  );
}

export default Home ;
