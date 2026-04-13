import React from "react";
import HomeContent from "./HomeContent";
import WorkspaceLayout from "../../layouts/WorkspaceLayout";
import ContentBoard from "../../components/ContentBoard";
import ContentMembers from "../../components/ContentMembers";
import { useHome } from "../../hooks/useHome";

function Home({ currentUser, onLogout }) {
  const {
    activeSection,
    activeWorkspace,
    activeWorkspaceId,
    resolvedUser,
    workspaces,
    inviteMember,
    removeWorkspace,
    toggleWorkspace,
    handleSelectSection,
    handleWorkspaceCreated,
    handleCreateWorkspace,
    handleUpdateWorkspace,
    handleCreateBoard,
    handleUpdateBoard,
    openBoardDetailPage,
    handleDeleteBoard,
  } = useHome(currentUser);

  return (
    <WorkspaceLayout
      activeSection={activeSection}
      activeWorkspaceId={activeWorkspaceId}
      onCreateBoard={handleCreateBoard}
      onCreateWorkspace={handleWorkspaceCreated}
      onDeleteWorkspace={removeWorkspace}
      onLogout={onLogout}
      onSelectSection={handleSelectSection}
      onToggleWorkspace={toggleWorkspace}
      onUpdateWorkspace={handleUpdateWorkspace}
      user={resolvedUser}
      workspaces={workspaces}
    >
      {activeSection === "board" ? (
        <ContentBoard
          workspace={activeWorkspace}
          workspaces={workspaces}
          onCreateBoard={handleCreateBoard}
          onUpdateBoard={handleUpdateBoard}
          onDeleteBoard={handleDeleteBoard}
          onSelectBoard={(board) => openBoardDetailPage(activeWorkspace?.id, board)}
        />
      ) : activeSection === "members" ? (
        <ContentMembers
          workspace={activeWorkspace}
          user={resolvedUser}
          onInviteMember={inviteMember}
          onBack={() => handleSelectSection({ workspaceId: activeWorkspaceId, section: "home" })}
        />
      ) : (
        <HomeContent
          workspace={activeWorkspace}
          user={resolvedUser}
          workspaces={workspaces}
          onCreateWorkspace={handleCreateWorkspace}
          onCreateBoard={handleCreateBoard}
          onInviteMember={inviteMember}
          onOpenWorkspaceBoards={(workspaceId) => handleSelectSection({ workspaceId, section: "board" })}
          onOpenBoardDetail={openBoardDetailPage}
        />
      )}
    </WorkspaceLayout>
  );
}

export default Home;
