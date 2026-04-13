import React from "react";
import { X } from "lucide-react";

function BoardBanner({ onHeaderClose }) {
  return (
    <div className="mx-3 mb-3 flex items-start gap-2 rounded-md border border-emerald-800/60 bg-emerald-950/50 px-3 py-2 text-sm text-emerald-100 sm:mx-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <span className="mt-0.5 shrink-0 text-emerald-400">●</span>
      <p className="min-w-0 flex-1 leading-snug">
        Bảng này có thể được đặt chế độ công khai hoặc riêng tư tùy cài đặt khi tạo. Chỉ thành viên được mời mới chỉnh sửa.
      </p>
      <button 
        type="button" 
        onClick={onHeaderClose} 
        className="shrink-0 rounded p-1 text-emerald-200 hover:bg-emerald-900/50 transition-colors" 
        aria-label="Đóng"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default BoardBanner;
