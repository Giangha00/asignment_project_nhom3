import api from "./api";
import { extractUserId, idsEqual } from "./ids";

/** Tránh trùng cùng bản ghi workspace member (socket user room + workspace room + bootstrap). */
const deliveredWorkspaceMemberKeys = new Set();

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
 * Thông báo chuông: được thêm vào workspace (có invitedBy từ API).
 */
export async function deliverWorkspaceInviteNotification({
  addNotification,
  myUserId,
  myEmail,
  wid,
  memberRowId,
  invitedById,
  targetUserId,
  workspaces,
}) {
  if (!myUserId || !targetUserId || !idsEqual(targetUserId, myUserId)) return;
  /** Không hiện nếu chính mình là người mời (self-add edge case). */
  if (invitedById && idsEqual(invitedById, myUserId)) return;

  const rowKey = String(memberRowId || `${wid}:${myUserId}`);
  const persistKey = `ws_member:${rowKey}`;
  if (deliveredWorkspaceMemberKeys.has(persistKey)) return;
  deliveredWorkspaceMemberKeys.add(persistKey);

  let workspaceName =
    (Array.isArray(workspaces) ? workspaces : []).find((w) => w.id === wid)
      ?.name || "";
  if (!workspaceName) {
    try {
      const wsRes = await api.get(`/api/workspaces/${wid}`);
      workspaceName = wsRes.data?.name || "Workspace";
    } catch {
      workspaceName = "Workspace";
    }
  }

  let inviterName = "Một thành viên";
  let inviterInitials = "?";
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

  addNotification({
    kind: "workspace_invite",
    persistKey,
    actorName: inviterName,
    actorInitials: inviterInitials,
    actionLine: "đã thêm bạn vào workspace",
    targetLabel: workspaceName,
    targetHref: `/workspace/${encodeURIComponent(wid)}/home`,
    metaLine: myEmail
      ? `Tài khoản ${myEmail} vừa được thêm vào không gian làm việc.`
      : undefined,
  });
}

export async function deliverWorkspaceInviteFromPayload(payload, ctx) {
  await deliverWorkspaceInviteNotification({
    ...ctx,
    wid: String(payload?.workspaceId || ""),
    memberRowId: String(payload?._id || payload?.id || ""),
    invitedById: extractUserId(payload?.invitedBy),
    targetUserId: extractUserId(payload?.userId),
  });
}
