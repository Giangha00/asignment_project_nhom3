import React from "react";
import { Trash2 } from "lucide-react";

function CardSideActions({ onDelete }) {
  return (
    <div className="space-y-2">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#9fadbc] px-1">Nguy hiểm</h3>
      <button
        type="button"
        onClick={onDelete}
        className="flex w-full items-center gap-2.5 rounded-md bg-[#4f1515]/60 px-3 py-2 text-sm font-medium text-[#ff8f8f] hover:bg-[#6d1f1f] transition-all"
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span>Xóa thẻ</span>
      </button>
    </div>
  );
}

export default CardSideActions;
