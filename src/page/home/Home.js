import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/SideBarHome";
import HomeContent from "../../components/HomeContent";
import api from "../../lib/api";
import { buildDefaultWorkspace, mapWorkspaceToUi } from "../../lib/workspaceUi";

function mergeWithDefaultWorkspace(items, user) {
  const defaultWorkspace = buildDefaultWorkspace(user);
  const nonDefaultItems = items.filter((workspace) => workspace.id !== defaultWorkspace.id);
  return [defaultWorkspace, ...nonDefaultItems];
}

function Home({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const resolvedUser = useMemo(
    () =>
      currentUser || {
        name: 'Nguyễn Hưng',
        initials: 'NH',
        email: 'hungnguyen05112003@example.com',
        role: 'Quản trị viên'
      },
    [currentUser]
  );
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadWorkspaces = async () => {
      try {
        const response = await api.get("/api/workspaces");
        const nextWorkspaces = (response.data || [])
          .map((workspace) => mapWorkspaceToUi(workspace, resolvedUser))
          .filter(Boolean);
        const resolvedWorkspaces = mergeWithDefaultWorkspace(nextWorkspaces, resolvedUser);

        if (!cancelled) {
          setWorkspaces(resolvedWorkspaces);
          setActiveWorkspaceId((prev) => prev || resolvedWorkspaces[0]?.id || null);
        }
      } catch (error) {
        console.error("Failed to load workspaces:", error);
        if (!cancelled) {
          const fallbackWorkspaces = mergeWithDefaultWorkspace([], resolvedUser);
          setWorkspaces(fallbackWorkspaces);
          setActiveWorkspaceId(fallbackWorkspaces[0].id);
        }
      }
    };

    loadWorkspaces();

    return () => {
      cancelled = true;
    };
  }, [resolvedUser]);

  const activeWorkspace = workspaces.find(ws => ws.id === activeWorkspaceId) || workspaces[0];

  const upsertWorkspace = (workspaceInput) => {
    const mappedWorkspace = mapWorkspaceToUi(workspaceInput, resolvedUser);
    if (!mappedWorkspace) return null;

    setWorkspaces((prev) => {
      const source = prev.filter((ws) => ws.id === "default-workspace" || ws.apiId);
      const existingIndex = source.findIndex((ws) => ws.id === mappedWorkspace.id);
      if (existingIndex === -1) {
        return mergeWithDefaultWorkspace([...source, mappedWorkspace], resolvedUser);
      }

      const next = [...source];
      next[existingIndex] = {
        ...next[existingIndex],
        ...mappedWorkspace,
      };
      return mergeWithDefaultWorkspace(next, resolvedUser);
    });
    setActiveWorkspaceId(mappedWorkspace.id);
    return mappedWorkspace;
  };

  const toggleWorkspace = (workspaceId) => {
    setWorkspaces(prev => prev.map(ws =>
      ws.id === workspaceId ? { ...ws, isOpen: !ws.isOpen } : ws
    ));
  };

  const handleDeleteWorkspace = (workspaceId) => {
    setWorkspaces((prev) => {
      const remainingWorkspaces = prev.filter(
        (ws) =>
          ws.id === "default-workspace" ||
          (ws.id !== workspaceId && ws.apiId !== workspaceId)
      );
      const nextWorkspaces = mergeWithDefaultWorkspace(remainingWorkspaces, resolvedUser);
      setActiveWorkspaceId((currentActiveId) =>
        currentActiveId === workspaceId ? nextWorkspaces[0]?.id || null : currentActiveId
      );
      return nextWorkspaces;
    });
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

  const handleInviteMember = (workspaceId, email) => {
    const targetWorkspace = workspaces.find(ws => ws.id === workspaceId);
    if (!targetWorkspace) return;

    const rawName = email.split('@')[0].replace(/[^a-zA-Z0-9]+/g, ' ').trim();
    const name = rawName
      ? rawName.split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      : 'Thành viên mới';
    const initials = name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase() || email.charAt(0).toUpperCase();

    const newMember = {
      id: `member-${workspaceId}-${Date.now()}`,
      name,
      initials,
      handle: `@${email.split('@')[0]}`,
      role: 'Thành viên',
      lastActive: 'Mới mời'
    };

    setWorkspaces(prev => prev.map(ws =>
      ws.id === workspaceId
        ? { ...ws, members: [...(Array.isArray(ws.members) ? ws.members : []), newMember] }
        : ws
    ));
  };

  const handleCreateBoard = (payload = 'board') => {
      let targetWorkspaceId = activeWorkspaceId ?? workspaces[0].id;
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

    const updatedWorkspace = {
      ...targetWorkspace,
      isOpen: true,
      boards: [...targetBoards, newBoard]
    };

    setWorkspaces(prev => prev.map(ws =>
      ws.id === targetWorkspaceId ? updatedWorkspace : ws
    ));

    setActiveWorkspaceId(targetWorkspaceId);
    navigate(`/workspace/${encodeURIComponent(targetWorkspaceId)}/board/${encodeURIComponent(newBoard.id)}`);
  };

  return (
    <div className="min-h-screen bg-[#121517] text-[#9fadbc]">
      <Header onCreateBoard={handleCreateBoard} user={resolvedUser} onLogout={onLogout} />
      <div className="flex">
        <Sidebar
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          activeSection="home"
          onToggleWorkspace={toggleWorkspace}
          onCreateWorkspace={handleWorkspaceCreated}
          onDeleteWorkspace={handleDeleteWorkspace}
          onUpdateWorkspace={handleUpdateWorkspace}
          onLogout={onLogout}
        />

        <main className="ml-[300px] flex-1 p-6 overflow-y-auto" style={{ minHeight: 'calc(100vh - 48px)' }}>
          <HomeContent
            workspace={activeWorkspace}
            user={resolvedUser}
            workspaces={workspaces}
            onCreateWorkspace={handleCreateWorkspace}
            onCreateBoard={handleCreateBoard}
            onInviteMember={handleInviteMember}
          />
        </main>
      </div>
    </div>
    );
}

export default Home ;
