/**
 * Thông báo trong app (dropdown chuông Header): chỉ lưu trong state React, mất khi F5.
 * persistKey: khóa ổn định (vd. ws_member:…) để gộp bản ghi trùng khi socket + đồng bộ API
 * cùng đẩy một sự kiện trong một phiên; giữ read khi merge.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

function newId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `n-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * @typedef {{
 *   id: string;
 *   kind: "workspace_invite" | "board_invite" | "info";
 *   actorName: string;
 *   actorInitials: string;
 *   actionLine: string;
 *   targetLabel: string;
 *   targetHref?: string;
 *   metaLine?: string;
 *   read: boolean;
 *   createdAt: number;
 *   persistKey?: string;
 * }} AppNotification
 */

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [items, setItems] = useState(/** @type {AppNotification[]} */ ([]));
  const [onlyUnread, setOnlyUnread] = useState(true);

  /** Thêm hoặc cập nhật (nếu trùng persistKey) một mục trong danh sách. */
  const addNotification = useCallback((partial) => {
    const persistKey = partial.persistKey ? String(partial.persistKey) : "";

    const id = newId();
    const entry = {
      kind: partial.kind || "info",
      actorName: partial.actorName ?? "Hệ thống",
      actorInitials: partial.actorInitials ?? "?",
      actionLine: partial.actionLine ?? "",
      targetLabel: partial.targetLabel ?? "",
      targetHref: partial.targetHref,
      metaLine: partial.metaLine,
      persistKey: persistKey || undefined,
      createdAt: partial.createdAt ?? Date.now(),
      ...partial,
      id,
      read: Boolean(partial.read),
    };

    setItems((prev) => {
      if (persistKey) {
        const ix = prev.findIndex((n) => n.persistKey === persistKey);
        if (ix !== -1) {
          const next = [...prev];
          next[ix] = {
            ...next[ix],
            ...entry,
            id: next[ix].id,
            read: next[ix].read,
          };
          return next;
        }
      }
      return [entry, ...prev].slice(0, 80);
    });
    return id;
  }, []);

  const markAsRead = useCallback((id) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = useMemo(
    () => items.filter((n) => !n.read).length,
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      onlyUnread,
      setOnlyUnread,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
    }),
    [
      items,
      onlyUnread,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return ctx;
}
