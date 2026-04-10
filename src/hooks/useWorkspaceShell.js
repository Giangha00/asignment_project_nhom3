import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { buildDefaultWorkspace, mapWorkspaceToUi } from "../lib/workspaceUi";

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
        const nextWorkspaces = (response.data || [])
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

  const inviteMember = (workspaceId, email) => {
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
      id: `member-${workspaceId}-${Date.now()}`,
      name,
      initials,
      handle: `@${email.split("@")[0]}`,
      role: "Thành viên",
      lastActive: "Mới mời",
    };

    setWorkspaces((prev) =>
      prev.map((workspace) =>
        workspace.id === workspaceId
          ? {
              ...workspace,
              members: [...(Array.isArray(workspace.members) ? workspace.members : []), newMember],
            }
          : workspace
      )
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
    inviteMember,
    removeBoardFromWorkspace,
    removeWorkspace,
    resolvedUser,
    setActiveWorkspaceId,
    toggleWorkspace,
    updateBoardInWorkspace,
    upsertWorkspace,
    workspaces,
  };
}
