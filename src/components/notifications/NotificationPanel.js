import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";

function formatTimeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${Math.max(1, s)} giây trước`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  return `${d} ngày trước`;
}

/**
 * Dropdown danh sách thông báo (đọc từ NotificationContext).
 * boundaryRef: vùng được coi là “trong” panel khi đóng bằng click ngoài (thường là div bọc chuông + panel).
 */
function NotificationPanel({ open, onClose, boundaryRef }) {
  const panelRef = useRef(null);
  const {
    items,
    onlyUnread,
    setOnlyUnread,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      const wrap = boundaryRef?.current;
      if (wrap && wrap.contains(e.target)) return;
      if (!wrap && panelRef.current?.contains(e.target)) return;
      onClose();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, onClose, boundaryRef]);

  const visible = onlyUnread ? items.filter((n) => !n.read) : items;

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full z-[60] mt-3 w-[min(420px,calc(100vw-24px))] overflow-hidden rounded-xl border border-[#dfe1e6] bg-white text-[#172b4d] shadow-[0_8px_32px_rgba(0,0,0,0.18)]"
      role="dialog"
      aria-label="Thông báo"
    >
      <div className="flex items-start justify-between gap-3 border-b border-[#dfe1e6] px-4 py-3">
        <div>
          <h2 className="text-base font-semibold text-[#172b4d]">Thông báo</h2>
          <button
            type="button"
            className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-[#5e6c84]"
            onClick={() => setOnlyUnread((v) => !v)}
          >
            <span
              role="switch"
              aria-checked={onlyUnread}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
                onlyUnread ? "bg-[#61bd4f]" : "bg-[#c1c7d0]"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[left] ${
                  onlyUnread ? "left-[22px]" : "left-0.5"
                }`}
              />
            </span>
            <span>Chỉ hiển thị chưa đọc</span>
          </button>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            className="text-sm font-medium text-[#0c66e4] hover:underline"
            onClick={() => markAllAsRead()}
          >
            Đánh dấu tất cả đã đọc
          </button>
          {unreadCount > 0 && (
            <span className="text-xs text-[#5e6c84]">{unreadCount} chưa đọc</span>
          )}
        </div>
      </div>

      <div className="max-h-[min(480px,70vh)] overflow-y-auto px-3 py-3">
        {visible.length === 0 && (
          <div className="rounded-lg border border-dashed border-[#dfe1e6] px-4 py-8 text-center text-sm text-[#5e6c84]">
            {onlyUnread
              ? "Không có thông báo chưa đọc."
              : "Chưa có thông báo nào trong phiên này."}
          </div>
        )}

        {visible.map((n) => (
          <article
            key={n.id}
            className="relative mb-3 rounded-lg border border-[#dfe1e6] bg-[#f4f5f7] p-3 last:mb-0"
          >
            {!n.read && (
              <span
                className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[#0c66e4]"
                title="Chưa đọc"
              />
            )}
            <div className="pr-4">
              {n.metaLine && (
                <div className="mb-2 rounded border border-[#dfe1e6] bg-white px-2 py-1.5 text-xs text-[#172b4d]">
                  {n.metaLine}
                </div>
              )}
              <div className="flex items-start gap-2">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: "#579dff" }}
                >
                  {n.actorInitials}
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <span className="font-semibold text-[#172b4d]">{n.actorName}</span>{" "}
                  <span className="text-[#172b4d]">{n.actionLine}</span>{" "}
                  {n.targetHref ? (
                    <Link
                      to={n.targetHref}
                      className="font-medium text-[#0c66e4] hover:underline"
                      onClick={() => {
                        markAsRead(n.id);
                        onClose();
                      }}
                    >
                      {n.targetLabel}
                    </Link>
                  ) : (
                    <span className="font-medium text-[#0c66e4]">{n.targetLabel}</span>
                  )}
                  <div className="mt-1 text-xs text-[#5e6c84]">
                    {formatTimeAgo(n.createdAt)}
                  </div>
                </div>
              </div>
              {!n.read && (
                <button
                  type="button"
                  className="mt-2 text-xs font-medium text-[#0c66e4] hover:underline"
                  onClick={() => markAsRead(n.id)}
                >
                  Đánh dấu đã đọc
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default NotificationPanel;
