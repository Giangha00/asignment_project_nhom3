import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/SideBarHome";
import ContentBoard from "../../components/ContentBoard";
import MemberContent from "../../components/MemberContent";
import SettingContent from "../../components/SettingContent";
import BoardDetail from "../board/BoardDetail";
import api from "../../lib/api";
import { buildDefaultWorkspace, mapWorkspaceToUi } from "../../lib/workspaceUi";

function mergeWithDefaultWorkspace(items, user) {
  const defaultWorkspace = buildDefaultWorkspace(user);
  const nonDefaultItems = items.filter((workspace) => workspace.id !== defaultWorkspace.id);
  return [defaultWorkspace, ...nonDefaultItems];
}

const WorkspaceUnifiedPage = ({ currentUser, onLogout }) => {
  const { workspaceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const resolvedUser = useMemo(
    () =>
      currentUser || {
        name: "Nguyễn Hưng",
        initials: "NH",
        email: "hungnguyen05112003@example.com",
        role: "Quản trị viên",
      },
    [currentUser]
  );
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(workspaceId || null);

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
          setActiveWorkspaceId(workspaceId || resolvedWorkspaces[0]?.id || null);
        }
      } catch (error) {
        console.error("Failed to load workspaces:", error);
        if (!cancelled) {
          const fallbackWorkspaces = mergeWithDefaultWorkspace([], resolvedUser);
          setWorkspaces(fallbackWorkspaces);
          setActiveWorkspaceId(workspaceId || fallbackWorkspaces[0].id);
        }
      }
    };

    loadWorkspaces();

    return () => {
      cancelled = true;
    };
  }, [resolvedUser, workspaceId]);

  useEffect(() => {
    const id = workspaceId || workspaces[0]?.id || null;
    setActiveWorkspaceId(id);
  }, [workspaceId, workspaces]);

  const activeWorkspace = useMemo(
    () => workspaces.find((ws) => ws.id === activeWorkspaceId) || workspaces[0],
    [workspaces, activeWorkspaceId]
  );

  const activeSection = useMemo(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    const boardIndex = parts.indexOf("board");
    if (boardIndex >= 0 && parts[boardIndex + 1]) return "board-detail";
    const section = parts[parts.length - 1];
    if (section === "boards") return "board";
    if (section === "members") return "members";
    if (section === "settings") return "settings";
    return "board";
  }, [location.pathname]);

  const toggleWorkspace = (workspaceIdToToggle) => {
    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === workspaceIdToToggle ? { ...ws, isOpen: !ws.isOpen } : ws
      )
    );
  };

  const handleDeleteWorkspace = (workspaceIdToDelete) => {
    setWorkspaces((prev) => {
      const remainingWorkspaces = prev.filter(
        (ws) =>
          ws.id === "default-workspace" ||
          (ws.id !== workspaceIdToDelete && ws.apiId !== workspaceIdToDelete)
      );
      const nextWorkspaces = mergeWithDefaultWorkspace(remainingWorkspaces, resolvedUser);

      setActiveWorkspaceId((currentActiveId) => {
        const nextActiveId =
          currentActiveId === workspaceIdToDelete
            ? nextWorkspaces[0]?.id || null
            : currentActiveId;

        if (currentActiveId === workspaceIdToDelete && nextActiveId) {
          navigate(`/workspace/${encodeURIComponent(nextActiveId)}/boards`);
        }

        return nextActiveId;
      });

      return nextWorkspaces;
    });
  };

  const handleCreateWorkspace = (newWorkspace) => {
    const workspace = mapWorkspaceToUi(
      {
        ...newWorkspace,
        isOpen: newWorkspace?.isOpen ?? true,
      },
      resolvedUser
    );
    if (!workspace) return;

    setWorkspaces((prev) => {
      const source = prev.filter((ws) => ws.id === "default-workspace" || ws.apiId);
      const existingIndex = source.findIndex((ws) => ws.id === workspace.id);
      if (existingIndex === -1) {
        return mergeWithDefaultWorkspace([...source, workspace], resolvedUser);
      }
      const next = [...source];
      next[existingIndex] = { ...next[existingIndex], ...workspace };
      return mergeWithDefaultWorkspace(next, resolvedUser);
    });
    setActiveWorkspaceId(workspace.id);
    navigate(`/workspace/${encodeURIComponent(workspace.id)}/boards`);
  };

  const handleUpdateWorkspace = (workspaceInput) => {
    handleCreateWorkspace(workspaceInput);
  };

  const handleInviteMember = (workspaceIdToInvite, email) => {
    const targetWorkspace = workspaces.find((ws) => ws.id === workspaceIdToInvite);
    if (!targetWorkspace) return;

    const rawName = email.split("@")[0].replace(/[^a-zA-Z0-9]+/g, " ").trim();
    const name = rawName
      ? rawName
          .split(/\s+/)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      : "Thành viên mới";
    const initials =
      name
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase() || email.charAt(0).toUpperCase();

    const newMember = {
      id: `member-${workspaceIdToInvite}-${Date.now()}`,
      name,
      initials,
      handle: `@${email.split("@")[0]}`,
      role: "Thành viên",
      lastActive: "Mới mời",
    };

    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === workspaceIdToInvite
          ? {
              ...ws,
              members: [...(Array.isArray(ws.members) ? ws.members : []), newMember],
            }
          : ws
      )
    );
  };

  const handleCreateBoard = (payload = "board") => {
    let targetWorkspaceId = activeWorkspaceId;
    if (payload && typeof payload === "object" && payload.workspaceId) {
      targetWorkspaceId = payload.workspaceId;
    }
    const targetWorkspace = workspaces.find((ws) => ws.id === targetWorkspaceId);
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
        const visibilityLabel =
          payload.visibility === "private"
            ? "Riêng tư"
            : payload.visibility === "public"
            ? "Công khai"
            : "Không gian làm việc";
        boardDescription = `Quyền xem: ${visibilityLabel}`;
      }
    } else {
      const option = typeof payload === "string" ? payload : "board";
      boardName = boardNames[option] || `Bảng mới ${nextIndex}`;
      boardDescription =
        boardDescriptions[option] || "Bảng mới được tạo từ Header";
    }

    const newBoard = {
      id: `board-${targetWorkspace.id}-${Date.now()}`,
      name: boardName,
      description: boardDescription,
    };

    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === targetWorkspaceId
          ? {
              ...ws,
              isOpen: true,
              boards: [...(Array.isArray(ws.boards) ? ws.boards : []), newBoard],
            }
          : ws
      )
    );

    setActiveWorkspaceId(targetWorkspaceId);
    navigate(`/workspace/${encodeURIComponent(targetWorkspaceId)}/board/${encodeURIComponent(newBoard.id)}`);
  };

  if (activeSection === "board-detail") {
    return <BoardDetail />;
  }

  const renderSection = () => {
    if (activeSection === "members") {
      return (
        <MemberContent
          workspace={activeWorkspace}
          onInviteMember={handleInviteMember}
        />
      );
    }

    if (activeSection === "settings") {
      return <SettingContent workspace={activeWorkspace} />;
    }

    return (
      <ContentBoard
        workspace={activeWorkspace}
        workspaces={workspaces}
        onCreateBoard={handleCreateBoard}
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#121517] text-[#9fadbc]">
      <Header onCreateBoard={handleCreateBoard} user={resolvedUser} onLogout={onLogout} />
      <div className="flex">
        <Sidebar
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          activeSection={activeSection}
          onToggleWorkspace={toggleWorkspace}
          onCreateWorkspace={handleCreateWorkspace}
          onDeleteWorkspace={handleDeleteWorkspace}
          onUpdateWorkspace={handleUpdateWorkspace}
          onLogout={onLogout}
        />
        <main
          className="ml-[300px] flex-1 overflow-y-auto p-6"
          style={{ minHeight: "calc(100vh - 48px)" }}
        >
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default WorkspaceUnifiedPage;
