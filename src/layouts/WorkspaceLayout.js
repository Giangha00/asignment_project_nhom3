import React from "react";
import Header from "../components/Header";
import Sidebar from "../components/SideBarHome";

function WorkspaceLayout({
  activeSection,
  activeWorkspaceId,
  children,
  onCreateBoard,
  onCreateWorkspace,
  onDeleteWorkspace,
  onLogout,
  onToggleWorkspace,
  onUpdateWorkspace,
  user,
  workspaces,
}) {
  return (
    <div className="min-h-screen bg-[#121517] text-[#9fadbc]">
      <Header onCreateBoard={onCreateBoard} user={user} onLogout={onLogout} />
      <div className="flex">
        <Sidebar
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          activeSection={activeSection}
          onToggleWorkspace={onToggleWorkspace}
          onCreateWorkspace={onCreateWorkspace}
          onDeleteWorkspace={onDeleteWorkspace}
          onUpdateWorkspace={onUpdateWorkspace}
          onLogout={onLogout}
        />
        <main
          className="ml-[300px] flex-1 overflow-y-auto p-6"
          style={{ minHeight: "calc(100vh - 48px)" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default WorkspaceLayout;
