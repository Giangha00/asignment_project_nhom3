import api from "./api";
import { extractUserId } from "./ids";

/** Tránh đẩy trùng cùng một bản ghi board member trong phiên (socket + bootstrap + màn BoardDetail). */
const deliveredBoardMemberKeys = new Set();

function initialsFromName(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
}

/**
 * Thông báo chuông khi user hiện tại được thêm vào bảng (chia sẻ bảng).
 * Giống mời workspace: chỉ state React + socket + GET API — không đổi backend, không localStorage.
 * API BoardMember không có invitedBy: nếu sau này payload/socket có thêm field thì mới hiện tên người mời.
 */
export async function deliverBoardShareNotification({
  addNotification,
  myUserId,
  myEmail,
  boardId,
  memberRowId,
  invitedById,
  targetUserId,
  workspaces,
}) {
  if (!myUserId || !targetUserId || targetUserId !== myUserId) return;

  const rowKey = String(memberRowId || `${boardId}:${myUserId}`);
  const persistKey = `board_member:${rowKey}`;
  if (deliveredBoardMemberKeys.has(persistKey)) return;
  deliveredBoardMemberKeys.add(persistKey);

  let boardName = "";
  let workspaceIdForLink = "";
  const list = Array.isArray(workspaces) ? workspaces : [];
  for (const w of list) {
    const boards = Array.isArray(w?.boards) ? w.boards : [];
    const brd = boards.find(
      (b) =>
        String(b?.apiId || b?._id || b?.boardId || b?.id || "") ===
        String(boardId),
    );
    if (brd) {
      workspaceIdForLink = String(w.id || "");
      boardName = brd.name || brd.title || "";
      break;
    }
  }

  if (!boardName || !workspaceIdForLink) {
    try {
      const br = await api.get(`/api/boards/${boardId}`);
      const d = br.data || {};
      if (!boardName) boardName = d.name || "Bảng";
      if (!workspaceIdForLink && d.workspaceId) {
        workspaceIdForLink = String(d.workspaceId);
      }
    } catch {
      if (!boardName) boardName = "Bảng";
    }
  }

  let inviterName = "Một thành viên";
  let inviterInitials = "MT";
  if (invitedById && invitedById !== myUserId) {
    try {
      const usersRes = await api.get("/api/users");
      const users = Array.isArray(usersRes.data) ? usersRes.data : [];
      const inviter = users.find(
        (u) => String(u?._id || u?.id || "") === invitedById,
      );
      if (inviter) {
        inviterName =
          inviter.fullName ||
          inviter.name ||
          inviter.username ||
          inviterName;
        inviterInitials = initialsFromName(inviterName);
      }
    } catch {
      // giữ mặc định
    }
  }

  const wsEnc = workspaceIdForLink
    ? encodeURIComponent(workspaceIdForLink)
    : "";
  const bidEnc = encodeURIComponent(String(boardId));

  addNotification({
    kind: "board_invite",
    persistKey,
    actorName: inviterName,
    actorInitials: inviterInitials,
    actionLine: "đã chia sẻ bảng với bạn",
    targetLabel: boardName,
    targetHref: workspaceIdForLink
      ? `/workspace/${wsEnc}/board/${bidEnc}`
      : undefined,
    metaLine: myEmail
      ? `Tài khoản ${myEmail} có quyền truy cập bảng này.`
      : undefined,
  });
}

/**
 * Parse payload socket boardMember:upserted hoặc bản ghi member từ GET /boards/:id/members.
 */
export async function deliverBoardShareFromPayload(payload, ctx) {
  await deliverBoardShareNotification({
    ...ctx,
    boardId: String(payload?.boardId || ""),
    memberRowId: String(payload?._id || payload?.id || ""),
    invitedById: extractUserId(payload?.invitedBy),
    targetUserId: extractUserId(payload?.userId),
  });
}
