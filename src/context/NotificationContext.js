/**
 * Thông báo chuông: state React + localStorage chỉ cho khóa "đã đọc" (persistKey).
 * Sau F5, socket/bootstrap có thể đẩy lại cùng mục — vẫn hiển thị đã đọc nhờ persistKey.
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

const READ_KEYS_STORAGE = "assignment_notifications_read_persist_keys";

function readStoredReadKeys() {
  try {
    const raw = localStorage.getItem(READ_KEYS_STORAGE);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.filter(Boolean) : []);
  } catch {
    return new Set();
  }
}

function writeStoredReadKeys(set) {
  try {
    localStorage.setItem(READ_KEYS_STORAGE, JSON.stringify([...set]));
  } catch {
    // private mode / quota
  }
}

function isPersistKeyMarkedRead(persistKey) {
  if (!persistKey) return false;
  return readStoredReadKeys().has(String(persistKey));
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

  const addNotification = useCallback((partial) => {
    const persistKey = partial.persistKey ? String(partial.persistKey) : "";

    const id = newId();
    const storedRead = persistKey ? isPersistKeyMarkedRead(persistKey) : false;
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
      read: Boolean(partial.read) || storedRead,
    };

    setItems((prev) => {
      if (persistKey) {
        const ix = prev.findIndex((n) => n.persistKey === persistKey);
        if (ix !== -1) {
          const next = [...prev];
          const mergedRead =
            next[ix].read ||
            entry.read ||
            isPersistKeyMarkedRead(persistKey);
          next[ix] = {
            ...next[ix],
            ...entry,
            id: next[ix].id,
            read: mergedRead,
          };
          return next;
        }
      }
      return [entry, ...prev].slice(0, 80);
    });
    return id;
  }, []);

  const markAsRead = useCallback((id) => {
    setItems((prev) => {
      const target = prev.find((n) => n.id === id);
      if (target?.persistKey) {
        const keySet = readStoredReadKeys();
        keySet.add(String(target.persistKey));
        writeStoredReadKeys(keySet);
      }
      return prev.map((n) => (n.id === id ? { ...n, read: true } : n));
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setItems((prev) => {
      const keySet = readStoredReadKeys();
      for (const n of prev) {
        if (n.persistKey) {
          keySet.add(String(n.persistKey));
        }
      }
      writeStoredReadKeys(keySet);
      return prev.map((n) => ({ ...n, read: true }));
    });
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
