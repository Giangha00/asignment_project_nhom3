import { useEffect } from "react";
import { useNotifications } from "../context/NotificationContext";
import { deliverBoardShareFromPayload } from "../lib/boardInviteNotification";
import { extractUserId } from "../lib/ids";
import {
  ensureSocketConnected,
  getSocket,
  setSocketAuthToken,
} from "../lib/socket";
import { deliverWorkspaceInviteFromPayload } from "../lib/workspaceInviteNotification";

/**
 * Thông báo realtime (phòng user:{id}). Handler cố định để off đúng, không xóa listener của useHome.
 */
export function UserSocketNotificationBridge({ currentUser, sessionToken }) {
  const { addNotification } = useNotifications();
  const myUserId = extractUserId(currentUser);
  const myEmail = String(currentUser?.email || "").toLowerCase();

  useEffect(() => {
    if (!myUserId) return;

    if (sessionToken) {
      setSocketAuthToken(sessionToken);
    }

    const onWorkspaceMember = (payload) => {
      void deliverWorkspaceInviteFromPayload(payload, {
        addNotification,
        myUserId,
        myEmail,
        workspaces: [],
      });
    };

    const onBoardMember = (payload) => {
      void deliverBoardShareFromPayload(payload, {
        addNotification,
        myUserId,
        myEmail,
        workspaces: [],
      });
    };

    let cancelled = false;

    (async () => {
      const socket = await ensureSocketConnected();
      if (cancelled || !socket) return;
      socket.on("workspaceMember:upserted", onWorkspaceMember);
      socket.on("boardMember:upserted", onBoardMember);
    })();

    return () => {
      cancelled = true;
      const socket = getSocket();
      if (socket) {
        socket.off("workspaceMember:upserted", onWorkspaceMember);
        socket.off("boardMember:upserted", onBoardMember);
      }
    };
  }, [addNotification, myEmail, myUserId, sessionToken]);

  return null;
}
