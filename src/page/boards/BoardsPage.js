import React from "react";
import { useOutletContext } from "react-router-dom";
import ContentBoard from "../../components/ContentBoard";

const BoardsPage = () => {
  const { workspaces, activeWorkspace, handleCreateBoard } = useOutletContext();

  return (
    <ContentBoard
      workspace={activeWorkspace}
      workspaces={workspaces}
      onCreateBoard={handleCreateBoard}
    />
  );
};

export default BoardsPage;