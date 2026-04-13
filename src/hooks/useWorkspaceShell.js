import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { buildDefaultWorkspace, mapWorkspaceToUi } from "../lib/workspaceUi";

/** Backend không nhúng boards/members trong GET /workspaces — gọi API chi tiết theo workspace. */
async function attachBoardsAndMembersToWorkspaces(workspacesRaw) {
  const list = Array.isArray(workspacesRaw) ? workspacesRaw : [];
  return Promise.all(
    list.map(async (ws) => {
      const wid = ws._id ?? ws.id;
      if (!wid) {
        return {
          ...ws,
          boards: Array.isArray(ws.boards) ? ws.boards : [],
          members: Array.isArray(ws.members) ? ws.members : [],
        };
      }

      try {
        const [boardsRes, membersRes] = await Promise.all([
          api.get("/api/boards", {
            params: { workspaceId: String(wid), t: Date.now() },
          }),
          api.get(`/api/workspaces/${String(wid)}/members`),
        ]);

        return {
          ...ws,
          boards: Array.isArray(boardsRes.data) ? boardsRes.data : [],
          members: Array.isArray(membersRes.data) ? membersRes.data : [],
        };
      } catch {
        return {
          ...ws,
          boards: [],
          members: Array.isArray(ws.members) ? ws.members : [],
        };
      }
    })
  );
}

export function mergeWithDefaultWorkspace(items, user) {
  const defaultWorkspace = buildDefaultWorkspace(user);
  const nonDefaultItems = items.filter((workspace) => workspace.id !== defaultWorkspace.id);
  return [defaultWorkspace, ...nonDefaultItems];
}

export function useWorkspaceShell(currentUser, initialActiveWorkspaceId = null) {
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
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(initialActiveWorkspaceId);

  useEffect(() => {
    let cancelled = false;

    const loadWorkspaces = async () => {
      try {
        const response = await api.get("/api/workspaces");
        const rawList = response.data || [];
        const withDetails = await attachBoardsAndMembersToWorkspaces(rawList);
        const nextWorkspaces = withDetails
          .map((workspace) => mapWorkspaceToUi(workspace, resolvedUser))
          .filter(Boolean);
        const resolvedWorkspaces = mergeWithDefaultWorkspace(nextWorkspaces, resolvedUser);

        if (!cancelled) {
          setWorkspaces(resolvedWorkspaces);
          setActiveWorkspaceId((prev) => prev || initialActiveWorkspaceId || resolvedWorkspaces[0]?.id || null);
        }
      } catch (error) {
        console.error("Failed to load workspaces:", error);
        if (!cancelled) {
          const fallbackWorkspaces = mergeWithDefaultWorkspace([], resolvedUser);
          setWorkspaces(fallbackWorkspaces);
          setActiveWorkspaceId((prev) => prev || initialActiveWorkspaceId || fallbackWorkspaces[0]?.id || null);
        }
      }
    };

    loadWorkspaces();

    return () => {
      cancelled = true;
    };
  }, [initialActiveWorkspaceId, resolvedUser]);

  useEffect(() => {
    if (initialActiveWorkspaceId) {
      setActiveWorkspaceId(initialActiveWorkspaceId);
    }
  }, [initialActiveWorkspaceId]);

  const activeWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace.id === activeWorkspaceId) || workspaces[0],
    [activeWorkspaceId, workspaces]
  );

  const upsertWorkspace = (workspaceInput) => {
    const mappedWorkspace = mapWorkspaceToUi(workspaceInput, resolvedUser);
    if (!mappedWorkspace) return null;

    setWorkspaces((prev) => {
      const source = prev.filter((workspace) => workspace.id === "default-workspace" || workspace.apiId);
      const existingIndex = source.findIndex((workspace) => workspace.id === mappedWorkspace.id);
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

  const removeWorkspace = (workspaceId) => {
    let nextActiveId = activeWorkspaceId;

    setWorkspaces((prev) => {
      const remainingWorkspaces = prev.filter(
        (workspace) =>
          workspace.id === "default-workspace" ||
          (workspace.id !== workspaceId && workspace.apiId !== workspaceId)
      );
      const nextWorkspaces = mergeWithDefaultWorkspace(remainingWorkspaces, resolvedUser);

      if (activeWorkspaceId === workspaceId) {
        nextActiveId = nextWorkspaces[0]?.id || null;
      }

      return nextWorkspaces;
    });

    if (activeWorkspaceId === workspaceId) {
      setActiveWorkspaceId(nextActiveId);
    }

    return nextActiveId;
  };

  const toggleWorkspace = (workspaceId) => {
    setWorkspaces((prev) =>
      prev.map((workspace) =>
        workspace.id === workspaceId
          ? { ...workspace, isOpen: !workspace.isOpen }
          : workspace
      )
    );
  };

  const inviteMember = async (workspaceId, email) => {
    if (!workspaceId || !email) return;
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!normalizedEmail) return;

    try {
      const usersResponse = await api.get("/api/users");
      const users = Array.isArray(usersResponse.data) ? usersResponse.data : [];
      const targetUser = users.find(
        (user) => String(user?.email || "").toLowerCase() === normalizedEmail
      );

      if (!targetUser) {
        window.alert("Không tìm thấy tài khoản với email này.");
        return;
      }

      const targetUserId = String(targetUser?._id || targetUser?.id || "");
      if (!targetUserId) {
        window.alert("Không xác định được người dùng để mời.");
        return;
      }

      await api.post(`/api/workspaces/${workspaceId}/members`, {
        userId: targetUserId,
        role: "member",
      });

      const membersResponse = await api.get(`/api/workspaces/${workspaceId}/members`);
      const refreshedMembers = Array.isArray(membersResponse.data)
        ? membersResponse.data
        : [];

      setWorkspaces((prev) =>
        prev.map((workspace) => {
          if (workspace.id !== workspaceId) return workspace;
          const mappedWorkspace = mapWorkspaceToUi(
            {
              ...workspace,
              members: refreshedMembers,
            },
            resolvedUser
          );
          return mappedWorkspace || workspace;
        })
      );
    } catch (error) {
      const apiMessage = error?.response?.data?.message || error?.response?.data?.error;
      window.alert(apiMessage || "Không thể mời thành viên vào workspace.");
    }
  };

  const removeMember = (workspaceId, memberId) => {
    setWorkspaces((prev) =>
      prev.map((workspace) => {
        if (workspace.id !== workspaceId) return workspace;
        const nextMembers = (Array.isArray(workspace.members) ? workspace.members : []).filter(
          (member) => member.id !== memberId
        );
        return {
          ...workspace,
          members: nextMembers,
        };
      })
    );
  };

  const leaveWorkspace = (workspaceId, memberId) => {
    removeMember(workspaceId, memberId);
  };

  const changeMemberRole = (workspaceId, memberId) => {
    setWorkspaces((prev) =>
      prev.map((workspace) => {
        if (workspace.id !== workspaceId) return workspace;
        const nextMembers = (Array.isArray(workspace.members) ? workspace.members : []).map((member) => {
          if (member.id !== memberId) return member;
          const nextRole = String(member.role || "").toLowerCase().includes("quản trị")
            ? "Thành viên"
            : "Quản trị viên";
          return {
            ...member,
            role: nextRole,
          };
        });

        return {
          ...workspace,
          members: nextMembers,
        };
      })
    );
  };

  const addBoardToWorkspace = (workspaceId, board) => {
    setWorkspaces((prev) =>
      prev.map((workspace) =>
        workspace.id === workspaceId
          ? {
              ...workspace,
              isOpen: true,
              boards: (() => {
                const currentBoards = Array.isArray(workspace.boards) ? workspace.boards : [];
                const nextBoardId = String(board?.id || board?._id || board?.boardId || "");
                if (!nextBoardId) return [...currentBoards, board];

                const existingIndex = currentBoards.findIndex(
                  (item) => String(item?.id || item?._id || item?.boardId || "") === nextBoardId
                );
                if (existingIndex === -1) return [...currentBoards, board];

                const nextBoards = [...currentBoards];
                nextBoards[existingIndex] = {
                  ...nextBoards[existingIndex],
                  ...board,
                };
                return nextBoards;
              })(),
            }
          : workspace
      )
    );
    setActiveWorkspaceId(workspaceId);
  };

  const updateBoardInWorkspace = (workspaceId, boardId, boardPatch) => {
    setWorkspaces((prev) =>
      prev.map((workspace) => {
        if (workspace.id !== workspaceId) return workspace;
        const currentBoards = Array.isArray(workspace.boards) ? workspace.boards : [];
        return {
          ...workspace,
          boards: currentBoards.map((board) =>
            board.id === boardId ? { ...board, ...boardPatch } : board
          ),
        };
      })
    );
  };

  const removeBoardFromWorkspace = (workspaceId, boardId) => {
    setWorkspaces((prev) =>
      prev.map((workspace) => {
        if (workspace.id !== workspaceId) return workspace;
        const currentBoards = Array.isArray(workspace.boards) ? workspace.boards : [];
        return {
          ...workspace,
          boards: currentBoards.filter((board) => board.id !== boardId),
        };
      })
    );
  };

  return {
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
  };
}
