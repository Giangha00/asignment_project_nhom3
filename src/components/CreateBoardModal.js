import { useState } from "react";
import { backgroundOptions, boardBackgrounds } from "../boardBackgrounds";

export function CreateBoardModal({ open, onClose, onCreate, busy, variant = "dark" }) {
  const [title, setTitle] = useState("");
  const [background, setBackground] = useState("gradient-blue");

  if (!open) return null;

  const isDark = variant === "dark";
  const panel = isDark
    ? "border border-[#38414a] bg-[#282e33] text-[#b6c2cf]"
    : "bg-[#f1f2f4] text-[#172b4d]";
  const label = isDark ? "text-[#9fadbc]" : "text-[#44546f]";
  const input = isDark
    ? "border-[#738496] bg-[#22272b] text-white placeholder:text-[#738496] focus:border-[#579dff] focus:ring-[#579dff]/40"
    : "border-[#8590a2] bg-white text-[#172b4d] placeholder:text-[#8590a2] focus:border-[#0c66e4] focus:ring-[#0c66e4]/40";
  const ringOffset = isDark ? "ring-offset-[#282e33]" : "ring-offset-[#f1f2f4]";
  const titleColor = isDark ? "text-white" : "text-[#172b4d]";

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || busy) return;
    try {
      await onCreate({ title: title.trim(), background });
      setTitle("");
      setBackground("gradient-blue");
      onClose();
    } catch {
      /* error surfaced in parent */
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[10vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-board-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`w-full max-w-md rounded-xl p-6 shadow-xl ${panel}`}>
        <h2 id="create-board-title" className={`text-lg font-semibold ${titleColor}`}>
          Tạo bảng mới
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${label}`}>
              Tiêu đề bảng
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Lộ trình Q4"
              className={`w-full rounded-[3px] border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${input}`}
            />
          </div>
          <div>
            <span className={`mb-2 block text-xs font-semibold uppercase tracking-wide ${label}`}>
              Nền
            </span>
            <div className="grid grid-cols-4 gap-2">
              {backgroundOptions.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setBackground(key)}
                  className={`h-10 rounded-[3px] ring-2 ring-offset-2 ${ringOffset} transition ${
                    background === key ? "ring-[#579dff]" : "ring-transparent"
                  }`}
                  style={{ backgroundImage: boardBackgrounds[key] }}
                  aria-label={`Chọn ${key}`}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`rounded-[3px] px-4 py-2 text-sm font-medium ${
                isDark ? "text-[#b6c2cf] hover:bg-white/10" : "text-[#172b4d] hover:bg-black/8"
              }`}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!title.trim() || busy}
              className="rounded-[3px] bg-[#0c66e4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0055cc] disabled:opacity-50"
            >
              Tạo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
