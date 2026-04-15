import React from "react";
import { Globe, LayoutGrid, MoreHorizontal, Star, UserPlus } from "lucide-react";

function BoardHeader({ boardName, workspaceName, onInviteClick }) {
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-4">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <h1 className="truncate text-lg font-bold text-white sm:text-xl">{boardName}</h1>
        <button type="button" className="rounded-md p-1.5 text-[#9fadbc] hover:bg-white/10" aria-label="Đánh dấu sao">
          <Star className="h-4 w-4" />
        </button>
        <button type="button" className="rounded-md p-1.5 text-[#9fadbc] hover:bg-white/10" aria-label="Lọc">
          <LayoutGrid className="h-4 w-4" />
        </button>
        <span className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[#9fadbc]">
          <Globe className="h-3.5 w-3.5" /> Hiển thị
        </span>
        {workspaceName && (
          <span className="ml-2 border-l border-[#3c444d] pl-3 text-xs text-[#6b7785]">
            Không gian: {workspaceName}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          title="Mời thành viên"
          onClick={onInviteClick}
          className="flex items-center gap-1.5 rounded-md border border-[#3c444d] bg-[#2c333a] px-3 py-1.5 text-sm font-medium text-[#9fadbc] hover:border-[#579dff] hover:text-white transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Chia sẻ</span>
        </button>
        <button type="button" className="rounded-md p-1.5 text-[#9fadbc] hover:bg-white/10">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default BoardHeader;
