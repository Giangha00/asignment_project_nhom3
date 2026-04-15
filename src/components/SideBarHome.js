import React from "react";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "../hooks/useSidebar";
import WorkspaceForm from "./sidebar/WorkspaceForm";
import WorkspaceItem from "./sidebar/WorkspaceItem";

const Sidebar = ({
  workspaces,
  activeWorkspaceId,
  activeSection,
  onToggleWorkspace,
  onCreateWorkspace,
  onDeleteWorkspace,
  onUpdateWorkspace,
  onSelectSection,
  onLogout,
}) => {
  const navigate = useNavigate();

  const {
    showCreateWorkspace,
    editingWorkspace,
    submitting,
    form,
    setField,
    openCreateForm,
    openEditModal,
    closeForm,
    handleCreateWorkspace,
    handleUpdateWorkspace,
    handleDeleteWorkspace,
  } = useSidebar({ workspaces, onCreateWorkspace, onDeleteWorkspace, onUpdateWorkspace, onLogout });

  const navigateToSection = (workspaceId, section) => {
    if (!workspaceId) return;
    const normalizedSection = section === "boards" ? "board" : section;
    if (typeof onSelectSection === "function") {
      onSelectSection({ workspaceId, section: normalizedSection });
    }
    if (section === "home") { navigate("/home"); return; }
    const pathSection = normalizedSection === "board" ? "boards" : normalizedSection;
    navigate(`/workspace/${workspaceId}/${pathSection}`);
  };

  return (
    <aside className="w-[300px] h-[calc(100vh-48px)] bg-[#1d2125] border-r border-[#3c444d] text-[#9fadbc] flex flex-col font-sans select-none fixed left-0 top-[48px] z-30 overflow-hidden">
      <div className="p-3 flex-1 overflow-y-auto custom-scrollbar">
        {/* Top Navigation */}
        <nav className="space-y-1 mb-4 border-b border-[#3c444d] pb-4">
          <div className="w-full flex items-center gap-3 px-3 py-2 rounded-[3px] text-sm text-[#dee4ea]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" />
            </svg>
            Bảng
          </div>
          <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#3c444d] rounded-[3px] transition text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Mẫu
          </button>
          <button
            onClick={() => {
              if (typeof onSelectSection === "function") {
                onSelectSection({ workspaceId: activeWorkspaceId, section: "home" });
              }
              navigate("/home");
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-[3px] transition text-sm font-medium ${
              activeSection === "home" ? "bg-[#3c444d] text-white" : "hover:bg-[#3c444d] text-[#579dff]"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            Trang chủ
          </button>
          <button
            onClick={openCreateForm}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#3c444d] rounded-[3px] transition text-sm text-[#dee4ea]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Tạo workspace mới
          </button>
        </nav>

        {/* Workspace List */}
        <div className="mt-4">
          <p className="px-3 text-xs font-bold text-[#8c9bab] uppercase mb-3">
            Các không gian làm việc
          </p>
          <div className="space-y-2">
            {workspaces.length === 0 ? (
              <p className="px-3 py-4 text-sm text-[#6b7785] text-center italic">
                Chưa có không gian làm việc
              </p>
            ) : (
              workspaces.map((ws) => (
                <WorkspaceItem
                  key={ws.id}
                  ws={ws}
                  activeWorkspaceId={activeWorkspaceId}
                  activeSection={activeSection}
                  onToggle={onToggleWorkspace}
                  onEdit={openEditModal}
                  onDelete={handleDeleteWorkspace}
                  onNavigate={navigateToSection}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal tạo / sửa workspace */}
      {(showCreateWorkspace || editingWorkspace) && (
        <WorkspaceForm
          mode={editingWorkspace ? "edit" : "create"}
          form={form}
          setField={setField}
          submitting={submitting}
          onSubmit={editingWorkspace ? handleUpdateWorkspace : handleCreateWorkspace}
          onClose={closeForm}
        />
      )}
    </aside>
  );
};

export default Sidebar;
