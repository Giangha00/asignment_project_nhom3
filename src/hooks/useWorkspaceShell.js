import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { mapWorkspaceToUi } from "../lib/workspaceUi";

function extractUserId(value) {
  if (!value) return "";
  if (typeof value === "object") {
    return String(value._id || value.id || "");
  }
  return String(value);
}

/**
 * Tải bảng + danh sách thành viên của một workspace qua API.
 * Gắn thêm boardsCount (số bảng user tham gia) để UI hiển thị giống lúc load trang.
 * Dùng lại cho: load danh sách workspace, sau khi mời thành viên, và khi socket báo đổi thành viên.
 */
async function loadWorkspaceBoardsAndMembers(wid) {
  const [boardsRes, membersRes] = await Promise.all([
    api.get("/api/boards", {
      params: { workspaceId: String(wid), t: Date.now() },
    }),
    api.get(`/api/workspaces/${String(wid)}/members`),
  ]);

  const boards = Array.isArray(boardsRes.data) ? boardsRes.data : [];
  const members = Array.isArray(membersRes.data) ? membersRes.data : [];

  const boardCountsByUserId = new Map();
  await Promise.all(
    boards.map(async (board) => {
      const boardId = String(board?._id || board?.id || board?.boardId || "");
      if (!boardId) return;

      try {
        const boardMembersRes = await api.get(`/api/boards/${boardId}/members`);
        const boardMembers = Array.isArray(boardMembersRes.data) ? boardMembersRes.data : [];
        boardMembers.forEach((item) => {
          const userId = extractUserId(item?.userId);
          if (!userId) return;
          boardCountsByUserId.set(userId, (boardCountsByUserId.get(userId) || 0) + 1);
        });
      } catch {
        // Ignore board-level member read errors to avoid breaking workspace load.
      }
    })
  );

  const membersWithBoardCount = members.map((member) => {
    const userId = extractUserId(member?.userId);
    return {
      ...member,
      boardsCount: userId ? boardCountsByUserId.get(userId) || 0 : 0,
    };
  });

  return { boards, members: membersWithBoardCount };
}

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
        const { boards, members } = await loadWorkspaceBoardsAndMembers(wid);
        return {
          ...ws,
          boards,
          members,
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

        if (!cancelled) {
          setWorkspaces(nextWorkspaces);
          setActiveWorkspaceId((prev) => prev || initialActiveWorkspaceId || nextWorkspaces[0]?.id || null);
        }
      } catch (error) {
        console.error("Failed to load workspaces:", error);
        if (!cancelled) {
          setWorkspaces([]);
          setActiveWorkspaceId(null);
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
      const source = prev.filter((workspace) => workspace.apiId);
      const existingIndex = source.findIndex((workspace) => workspace.id === mappedWorkspace.id);
      if (existingIndex === -1) {
        return [...source, mappedWorkspace];
      }

      const next = [...source];
      next[existingIndex] = { ...next[existingIndex], ...mappedWorkspace };
      return next;
    });

    setActiveWorkspaceId(mappedWorkspace.id);
    return mappedWorkspace;
  };

  const removeWorkspace = (workspaceId) => {
    let nextActiveId = activeWorkspaceId;

    setWorkspaces((prev) => {
      const remainingWorkspaces = prev.filter(
        (workspace) =>
          workspace.id !== workspaceId && workspace.apiId !== workspaceId
      );

      if (activeWorkspaceId === workspaceId) {
        nextActiveId = remainingWorkspaces[0]?.id || null;
      }

      return remainingWorkspaces;
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

  // Gọi API lấy lại thành viên (và boardsCount) cho đúng workspace — dùng khi socket báo có người khác thay đổi thành viên.
  const refreshWorkspaceMembers = useCallback(
    async (workspaceId) => {
      if (!workspaceId || workspaceId === "default-workspace") return;
      try {
        const { boards, members } = await loadWorkspaceBoardsAndMembers(workspaceId);
        setWorkspaces((prev) =>
          prev.map((workspace) => {
            if (workspace.id !== workspaceId) return workspace;
            const mappedWorkspace = mapWorkspaceToUi(
              { ...workspace, boards, members },
              resolvedUser
            );
            return mappedWorkspace || workspace;
          })
        );
      } catch (error) {
        console.error("Failed to refresh workspace members:", error);
      }
    },
    [resolvedUser]
  );

  /**
   * Mời thành viên: email → tra userId (GET /api/users) → POST /api/workspaces/:id/members.
   * Trả về { ok, message } để UI hiển thị lỗi/thành công; không dùng alert trong hook.
   */
  const inviteMember = useCallback(
    async (workspaceId, email) => {
      if (!workspaceId || !email) {
        return { ok: false, message: "Vui lòng nhập email." };
      }
      if (workspaceId === "default-workspace") {
        return { ok: false, message: "Không thể mời thành viên vào workspace mặc định." };
      }

      const normalizedEmail = String(email).trim().toLowerCase();
      if (!normalizedEmail) {
        return { ok: false, message: "Vui lòng nhập email." };
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return { ok: false, message: "Email không hợp lệ." };
      }

      const workspace = workspaces.find((w) => w.id === workspaceId);

      try {
        const usersResponse = await api.get("/api/users");
        const users = Array.isArray(usersResponse.data) ? usersResponse.data : [];
        const targetUser = users.find(
          (u) => String(u?.email || "").toLowerCase() === normalizedEmail
        );

        if (!targetUser) {
          return { ok: false, message: "Không tìm thấy tài khoản với email này." };
        }

        const targetUserId = String(targetUser?._id || targetUser?.id || "");
        if (!targetUserId) {
          return { ok: false, message: "Không xác định được người dùng để mời." };
        }

        const rawMembers = Array.isArray(workspace?.members) ? workspace.members : [];
        // Trùng userId với thành viên hiện có → báo sớm, khỏi gọi API.
        const alreadyMember = rawMembers.some((m) => {
          const uid = String(m.userId?._id ?? m.userId?.id ?? m.userId ?? "");
          return uid === targetUserId;
        });
        if (alreadyMember) {
          return { ok: false, message: "Người dùng này đã là thành viên workspace." };
        }

        await api.post(`/api/workspaces/${workspaceId}/members`, {
          userId: targetUserId,
          role: "member",
        });

        // Sau POST thành công: tải lại members (+ boardsCount) để danh sách khớp backend.
        const { boards, members } = await loadWorkspaceBoardsAndMembers(workspaceId);

        setWorkspaces((prev) =>
          prev.map((w) => {
            if (w.id !== workspaceId) return w;
            const mappedWorkspace = mapWorkspaceToUi({ ...w, boards, members }, resolvedUser);
            return mappedWorkspace || w;
          })
        );

        return { ok: true, message: "Đã mời thành viên thành công." };
      } catch (error) {
        const status = error?.response?.status;
        const apiMessage = error?.response?.data?.message || error?.response?.data?.error;
        if (status === 403) {
          return {
            ok: false,
            message: apiMessage || "Bạn không có quyền mời thành viên vào workspace này.",
          };
        }
        if (status === 404) {
          return {
            ok: false,
            message: apiMessage || "Không tìm thấy workspace hoặc người dùng.",
          };
        }
        return {
          ok: false,
          message: apiMessage || "Không thể mời thành viên vào workspace. Vui lòng thử lại.",
        };
      }
    },
    [resolvedUser, workspaces]
  );

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
    refreshWorkspaceMembers,
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
