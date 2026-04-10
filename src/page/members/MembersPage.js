import React from "react";
import { useOutletContext } from "react-router-dom";
import MemberContent from "../../components/MemberContent";

const MembersPage = () => {
  const { activeWorkspace, handleInviteMember } = useOutletContext();

  return (
    <MemberContent
      workspace={activeWorkspace}
      onInviteMember={handleInviteMember}
    />
  );
};

export default MembersPage;