import React, { useState, useCallback } from "react";
import { BoardFormModal } from "./BoardFormModal";

/**
 * Nút "Tạo bảng mới" + modal form (dùng BoardFormModal).
 * onCreateBoard({ title, workspaceId, visibility, coverUrl? }) hoặc onCreateBoard('template')
 */
const CreateBoard = ({ workspaces = [], defaultWorkspaceId, onCreateBoard }) => {
  const [open, setOpen] = useState(false);

  const resolveDefaultWorkspace = useCallback(() => {
    if (defaultWorkspaceId != null && workspaces.some((w) => w.id === defaultWorkspaceId)) {
      return defaultWorkspaceId;
    }
    return workspaces[0]?.id ?? null;
  }, [defaultWorkspaceId, workspaces]);

  const [workspaceId, setWorkspaceId] = useState(null);

  const openModal = () => {
    setWorkspaceId(resolveDefaultWorkspace());
    setOpen(true);
  };

  const closeModal = () => setOpen(false);

  return (
    <div className="relative h-full w-full">
      <button
        type="button"
        onClick={openModal}
        className="flex h-full min-h-[120px] w-full items-center justify-center rounded-xl border border-[#3c444d] bg-[#2c333a] px-4 text-center text-sm font-medium text-[#b6c2cf] transition hover:bg-[#363d45] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#579dff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1d2125]"
      >
        Tạo bảng mới
      </button>

      <BoardFormModal
        open={open}
        onClose={closeModal}
        mode="create"
        workspaceId={workspaceId}
        initialTitle=""
        initialVisibility="workspace"
        initialCoverUrl=""
        showTemplateButton
        onTemplate={() => {
          if (typeof onCreateBoard === "function") onCreateBoard("template");
        }}
        onSubmit={({ title, visibility, coverUrl }) => {
          if (typeof onCreateBoard === "function" && workspaceId != null) {
            onCreateBoard({
              title,
              workspaceId,
              visibility,
              ...(coverUrl ? { coverUrl } : {}),
            });
          }
        }}
      />
    </div>
  );
};

export default CreateBoard;
