import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/SideBarHome";
import ContentBoard from "../../components/ContentBoard";
import MemberContent from "../../components/MemberContent";
import SettingContent from "../../components/SettingContent";
import BoardDetail from "../board/BoardDetail";

const initialWorkspaces = [

  {
    id: 2,
    name: "Trello workspace",
    color: "bg-[#cd5a91]",
    isOpen: false,
    hasBilling: false,
    boards: [
      {
        id: "board-2",
        name: "Bảng Nhiệm vụ",
        description: "Sắp xếp nhiệm vụ theo từng giai đoạn rõ ràng",
      },
    ],
    members: [
      {
        id: "member-2",
        name: "Nguyễn Hưng",
        initials: "NH",
        handle: "@hungnguyen05112003",
        role: "Quản trị viên",
        lastActive: "Apr 2026",
      },
    ],
  },
];

const WorkspaceUnifiedPage = ({ authToken, currentUser, onLogout }) => {
  const { workspaceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const resolvedUser = currentUser || {
    name: "Nguyễn Hưng",
    initials: "NH",
    email: "hungnguyen05112003@example.com",
    role: "Quản trị viên",
  };
  const [workspaces, setWorkspaces] = useState(initialWorkspaces);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(
    Number(workspaceId) || workspaces[0]?.id || 1
  );

  useEffect(() => {
    const id = Number(workspaceId) || workspaces[0]?.id || 1;
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
    const remainingWorkspaces = workspaces.filter(
      (ws) => ws.id !== workspaceIdToDelete
    );
    setWorkspaces(remainingWorkspaces);

    if (activeWorkspaceId === workspaceIdToDelete) {
      if (remainingWorkspaces.length > 0) {
        const nextWorkspaceId = remainingWorkspaces[0].id;
        setActiveWorkspaceId(nextWorkspaceId);
        navigate(`/workspace/${nextWorkspaceId}/boards`);
      } else {
        navigate("/home");
      }
    }
  };

  const handleCreateWorkspace = (newWorkspace) => {
    const defaultBoard = {
      id: `board-${Date.now()}`,
      name: "Bảng",
      description: "Bảng khởi đầu để quản lý công việc trực quan",
      color: "#6d5de7",
    };

    const nextWorkspaceId = workspaces.length
      ? Math.max(...workspaces.map((ws) => Number(ws.id))) + 1
      : 1;

    const workspace = {
      id: newWorkspace.id ? Number(newWorkspace.id) : nextWorkspaceId,
      name: newWorkspace.name || `Workspace mới ${workspaces.length + 1}`,
      type: newWorkspace.type || "default",
      description: newWorkspace.description || "",
      color: newWorkspace.color ? `bg-[${newWorkspace.color}]` : "bg-[#6d5de7]",
      apiId: newWorkspace.apiId,
      isOpen: newWorkspace.isOpen !== undefined ? newWorkspace.isOpen : true,
      hasBilling: newWorkspace.hasBilling || false,
      boards: [defaultBoard, ...(newWorkspace.boards || [])],
      members: newWorkspace.members || [
        {
          id: `member-${Date.now()}`,
          name: resolvedUser.name,
          initials: resolvedUser.initials,
          handle: `@${resolvedUser.email.split("@")[0]}`,
          role: resolvedUser.role,
          lastActive: "Mới tham gia",
        },
      ],
    };

    setWorkspaces((prev) => [...prev, workspace]);
    setActiveWorkspaceId(workspace.id);
    navigate(`/workspace/${workspace.id}/boards`);
  };

  const handleUpdateWorkspace = (workspaceIdToUpdate, patch) => {
    setWorkspaces((prev) =>
      prev.map((ws) => {
        if (ws.id !== workspaceIdToUpdate) return ws;
        const next = { ...ws, ...patch };
        if (patch?.color) {
          next.color = `bg-[${patch.color}]`;
        }
        return next;
      })
    );
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
    navigate(`/workspace/${targetWorkspaceId}/board/${encodeURIComponent(newBoard.id)}`);
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
          authToken={authToken}
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