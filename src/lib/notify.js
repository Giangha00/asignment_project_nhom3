/**
 * Toastify-JS: toast lỗi/cảnh báo (vd. mời thành viên thất bại).
 * Chống spam: cùng một dedupeKey / cùng nội dung trong ~5s chỉ hiện một lần.
 */
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

const dedupeKeys = new Map();
const DEDUPE_MS = 5000;
const MAX_KEYS = 200;

function pruneDedupe(now) {
  if (dedupeKeys.size <= MAX_KEYS) return;
  for (const [k, t] of dedupeKeys) {
    if (now - t > 60000) dedupeKeys.delete(k);
  }
}

/**
 * Trả về true nếu nên bỏ qua (trùng trong cửa sổ thời gian).
 * Dùng cho toast và có thể tái sử dụng cho sự kiện realtime.
 */
export function shouldDedupe(key) {
  const now = Date.now();
  const last = dedupeKeys.get(key);
  if (last != null && now - last < DEDUPE_MS) return true;
  dedupeKeys.set(key, now);
  pruneDedupe(now);
  return false;
}

const baseOptions = {
  gravity: "top",
  position: "right",
  close: true,
  stopOnFocus: true,
  style: {
    borderRadius: "10px",
    maxWidth: "min(420px, 92vw)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
    fontSize: "14px",
    lineHeight: 1.45,
  },
};

const durations = {
  success: 3800,
  error: 6000,
  warning: 5000,
  info: 4500,
};

function showToast(kind, message, opts = {}) {
  const text = String(message ?? "").trim();
  if (!text) return;

  const dedupeId = opts.dedupeKey ?? `${kind}:${text}`;
  if (shouldDedupe(dedupeId)) return;

  const colors = {
    success: { bg: "linear-gradient(135deg,#0f5132,#198754)", color: "#f4fff9" },
    error: { bg: "linear-gradient(135deg,#58151c,#b02a37)", color: "#fff5f5" },
    warning: { bg: "linear-gradient(135deg,#664d03,#ffc107)", color: "#1a1400" },
    info: { bg: "linear-gradient(135deg,#084298,#0d6efd)", color: "#f0f7ff" },
  };

  const c = colors[kind] || colors.info;

  Toastify({
    text,
    duration: opts.duration ?? durations[kind] ?? 4000,
    ...baseOptions,
    style: {
      ...baseOptions.style,
      background: c.bg,
      color: c.color,
      ...opts.style,
    },
  }).showToast();
}

export const notify = {
  success: (message, opts) => showToast("success", message, opts),
  error: (message, opts) => showToast("error", message, opts),
  warning: (message, opts) => showToast("warning", message, opts),
  info: (message, opts) => showToast("info", message, opts),
};
