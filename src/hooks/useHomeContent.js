import { useState } from "react";
import { notify } from "../lib/notify";

/** Form trang chủ: mời nhanh — chỉ Toastify khi lỗi; thành công không toast (theo yêu cầu UX). */
export function useHomeContent({ workspaces = [], onCreateWorkspace, onCreateBoard, onInviteMember }) {
  const [workspaceName, setWorkspaceName] = useState("");
  const [inviteByWorkspace, setInviteByWorkspace] = useState({});
  const [boardByWorkspace, setBoardByWorkspace] = useState({});

  const getVisibilityLabel = (visibility) => {
    if (visibility === "public") return "Công khai";
    if (visibility === "workspace") return "Nội bộ workspace";
    return "Riêng tư";
  };

  const handleCreateWorkspaceSubmit = (event) => {
    event.preventDefault();
    const name = workspaceName.trim();
    if (!name) return;

    Promise.resolve(
      onCreateWorkspace({
        name,
        type: "default",
        description: "",
        visibility: "private",
      })
    ).then(() => {
      setWorkspaceName("");
    });
  };

  const handleCreateBoardSubmit = (event, workspaceId) => {
    event.preventDefault();
    const title = (boardByWorkspace[workspaceId] || "").trim();
    if (!title) return;

    onCreateBoard({
      title,
      workspaceId,
      visibility: "workspace",
    });

    setBoardByWorkspace((prev) => ({ ...prev, [workspaceId]: "" }));
  };

  // Mời nhanh từ trang chủ (không có UI loading riêng): lỗi báo bằng alert, thành công thì xóa ô email.
  const handleInviteSubmit = (event, workspaceId) => {
    event.preventDefault();
    const email = (inviteByWorkspace[workspaceId] || "").trim();
    if (!email) return;

    Promise.resolve(onInviteMember(workspaceId, email)).then((result) => {
      if (result?.ok === false && result.message) {
        notify.error(result.message);
        return;
      }
      setInviteByWorkspace((prev) => ({ ...prev, [workspaceId]: "" }));
    });
  };

  return {
    workspaceName,
    setWorkspaceName,
    inviteByWorkspace,
    setInviteByWorkspace,
    boardByWorkspace,
    setBoardByWorkspace,
    getVisibilityLabel,
    handleCreateWorkspaceSubmit,
    handleCreateBoardSubmit,
    handleInviteSubmit,
  };
}
