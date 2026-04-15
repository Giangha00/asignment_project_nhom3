import React from "react";
import { CheckSquare, Clock, Plus, Tag, User2, Trash2 } from "lucide-react";

function CardSideActions({ onDelete }) {
  const QUICK_ACTIONS = [
    { icon: <Plus className="h-3.5 w-3.5" />, label: "Thêm" },
    { icon: <Tag className="h-3.5 w-3.5" />, label: "Nhãn" },
    { icon: <Clock className="h-3.5 w-3.5" />, label: "Ngày" },
    { icon: <CheckSquare className="h-3.5 w-3.5" />, label: "Việc cần làm" },
    { icon: <User2 className="h-3.5 w-3.5" />, label: "Thành viên" },
  ];

  return (
    <div className="w-full sm:w-[180px] shrink-0 space-y-4">
      <div className="space-y-2">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#9fadbc] px-1">Tác vụ nhanh</h3>
        <div className="flex flex-col gap-1.5 focus:ring-0">
          {QUICK_ACTIONS.map(({ icon, label }) => (
            <button
              key={label}
              type="button"
              className="flex items-center gap-2.5 rounded-md bg-[#3d454c] px-3 py-2 text-sm text-[#dee4ea] hover:bg-[#4a535c] transition-all hover:translate-x-1"
            >
              <span className="text-[#9fadbc]">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 space-y-2">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#9fadbc] px-1">Nguy hiểm</h3>
        <button
          type="button"
          onClick={onDelete}
          className="flex w-full items-center gap-2.5 rounded-md bg-[#4f1515]/60 px-3 py-2 text-sm font-medium text-[#ff8f8f] hover:bg-[#6d1f1f] transition-all hover:translate-x-1"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Xóa thẻ</span>
        </button>
      </div>
    </div>
  );
}

export default CardSideActions;
