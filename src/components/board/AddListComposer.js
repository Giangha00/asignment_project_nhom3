import React from "react";
import { Plus, X } from "lucide-react";


/**
 * Nút "Thêm danh sách khác" và form nhập tên list mới.
 */
function AddListComposer({ open, value, error, onChange, onSubmit, onOpen, onClose }) {
  if (open) {
    return (
      <div className="flex h-fit w-[272px] shrink-0 flex-col rounded-xl border border-[#3c444d] bg-[#121212] p-3 shadow-lg">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onSubmit(); } }}
          placeholder="Nhập tên danh sách..."
          autoFocus
          className="w-full rounded-lg border-2 border-[#579dff] bg-[#22272b] px-3 py-2.5 text-sm text-[#d1d7e0] placeholder:text-[#6b7785] outline-none focus:ring-1 focus:ring-[#579dff]"
        />
        {error && <p className="mt-2 text-xs text-[#f87474]" role="alert">{error}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" onClick={onSubmit} className="rounded-lg bg-[#579dff] px-3 py-2 text-sm font-semibold text-[#0c1f3d] hover:bg-[#6cabff]">
            Thêm danh sách
          </button>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-[#c8d1db] hover:bg-white/10" aria-label="Hủy">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex h-fit min-w-[272px] shrink-0 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/15"
    >
      <Plus className="h-4 w-4" />
      Thêm danh sách khác
    </button>
  );
}

export default AddListComposer;
