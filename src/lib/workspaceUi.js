/** Hiển thị "tháng m/Y" từ ISO/Date (dùng lastLoginAt từ user đã populate). */
function formatLastLoginMonthYear(value) {
  if (value == null || value === "") return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return `tháng ${month}/${year}`;
}

function getInitials(name = "") {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "ND";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function mapMemberToUi(member, currentUser) {
  if (!member) return null;

  const nestedUser =
    member.userId && typeof member.userId === "object" && !Array.isArray(member.userId)
      ? member.userId
      : null;

  const id = String(member.id || member._id || member.memberId || "");
  if (!id) return null;

  const currentUserId = String(currentUser?._id || currentUser?.id || "");
  const memberUserId = String(member.userId?._id || member.userId?.id || member.userId || "");

  const resolvedEmail = member.email || nestedUser?.email || "";
  const name =
    member.name ||
    member.fullName ||
    nestedUser?.fullName ||
    nestedUser?.name ||
    "Người dùng";
  const username =
    member.username ||
    String(member.handle || "")
      .replace(/^@/, "")
      .trim() ||
    String(resolvedEmail || "user").split("@")[0];

  const resolvedBoardsCount =
    typeof member.boardsCount === "number"
      ? member.boardsCount
      : Array.isArray(member.boards)
        ? member.boards.length
        : null;

  const resolvedRole = String(member.role || "").toLowerCase();
  const roleKey =
    resolvedRole === "admin"
      ? "admin"
      : resolvedRole === "guest"
        ? "guest"
        : resolvedRole === "observer"
          ? "observer"
          : "member";
  const uiRole =
    resolvedRole === "admin"
      ? "Quản trị viên"
      : resolvedRole === "member"
        ? "Thành viên"
        : resolvedRole === "observer"
          ? "Quan sát viên"
          : member.role || "Thành viên";

  const rawLastLogin =
    nestedUser?.lastLoginAt ??
    member.lastLoginAt ??
    (typeof member.userId === "object" && member.userId && !Array.isArray(member.userId)
      ? member.userId.lastLoginAt
      : undefined);

  const lastLoginMonthYear = formatLastLoginMonthYear(rawLastLogin);

  return {
    ...member,
    id,
    name,
    username,
    handle: member.handle || `@${username}`,
    initials: member.initials || getInitials(name),
    avatarUrl: member.avatarUrl || nestedUser?.avatarUrl || "",
    roleKey,
    role: uiRole,
    lastLoginMonthYear,
    lastActive: member.lastActive || "Mới tham gia",
    boardsCount: resolvedBoardsCount,
    isCurrentUser:
      member.isCurrentUser !== undefined
        ? Boolean(member.isCurrentUser)
        : Boolean(currentUserId && memberUserId && currentUserId === memberUserId),
  };
}

function buildDefaultMembers(currentUser) {
  if (!currentUser) return [];
  const username = String(currentUser.email || "user").split("@")[0];
  return [
    {
      id: `member-${currentUser._id || currentUser.id || "me"}`,
      name: currentUser.name || currentUser.fullName || "Người dùng",
      username,
      initials: currentUser.initials || getInitials(currentUser.name || currentUser.fullName || ""),
      handle: `@${username}`,
      avatarUrl: currentUser.avatarUrl || "",
      roleKey: "admin",
      role: currentUser.role || "Quản trị viên",
      lastLoginMonthYear: formatLastLoginMonthYear(currentUser?.lastLoginAt),
      lastActive: "Mới tham gia",
      boardsCount: 1,
      isCurrentUser: true,
    },
  ];
}

function mapBoardToUi(board) {
  if (!board) return null;
  const apiId = String(board.apiId || board._id || board.boardId || board.id || "");
  const resolvedId = apiId || String(board.id || "");
  if (!resolvedId) return null;

  return {
    ...board,
    id: resolvedId,
    apiId,
    name: board.name || "Bảng",
    description: board.description || "",
  };
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
    boards: Array.isArray(workspace.boards)
      ? workspace.boards.map(mapBoardToUi).filter(Boolean)
      : [],
    members:
      Array.isArray(workspace.members) && workspace.members.length > 0
        ? workspace.members.map((member) => mapMemberToUi(member, currentUser)).filter(Boolean)
        : buildDefaultMembers(currentUser),
  };
}
