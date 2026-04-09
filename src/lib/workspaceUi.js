function buildDefaultMembers(currentUser) {
  if (!currentUser) return [];
  return [
    {
      id: `member-${currentUser._id || currentUser.id || "me"}`,
      name: currentUser.name || currentUser.fullName || "Người dùng",
      initials: currentUser.initials || "ND",
      handle: `@${String(currentUser.email || "user").split("@")[0]}`,
      role: currentUser.role || "Quản trị viên",
      lastActive: "Mới tham gia",
    },
  ];
}

export function buildDefaultWorkspace(currentUser) {
  return {
    id: "default-workspace",
    apiId: "",
    name: "Trello Không gian làm việc",
    type: "default",
    visibility: "private",
    description: "Workspace mặc định để bạn bắt đầu quản lý công việc.",
    logoUrl: "",
    color: "bg-[#a548bf]",
    isOpen: true,
    hasBilling: true,
    boards: [
      {
        id: "board-1",
        name: "Bảng",
        description: "Bảng khởi đầu để quản lý công việc trực quan",
      },
    ],
    members: buildDefaultMembers(currentUser),
  };
}

export function mapWorkspaceToUi(workspace, currentUser) {
  if (!workspace) return null;

  const apiId = String(workspace.apiId || workspace._id || workspace.workspaceId || workspace.id || "");
  const resolvedId = apiId || String(workspace.id || "");
  const colorValue = workspace.color || "#2f67ff";

  return {
    id: resolvedId,
    apiId,
    name: workspace.name || "Workspace",
    type: workspace.type || "default",
    visibility: workspace.visibility || "private",
    description: workspace.description || "",
    logoUrl: workspace.logoUrl || "",
    color: String(colorValue).startsWith("bg-[") ? colorValue : `bg-[${colorValue}]`,
    isOpen: workspace.isOpen ?? false,
    hasBilling: workspace.hasBilling || false,
    boards: Array.isArray(workspace.boards) ? workspace.boards : [],
    members:
      Array.isArray(workspace.members) && workspace.members.length > 0
        ? workspace.members
        : buildDefaultMembers(currentUser),
  };
}
