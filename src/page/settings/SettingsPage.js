import React from "react";
import { useOutletContext } from "react-router-dom";
import SettingContent from "../../components/SettingContent";

const SettingsPage = () => {
  const { activeWorkspace } = useOutletContext();

  return <SettingContent workspace={activeWorkspace} />;
};

export default SettingsPage;