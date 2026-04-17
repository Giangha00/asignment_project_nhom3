import React from "react";
import { Users } from "lucide-react";

function getInitials(fullName) {
  if (!fullName) return "?";
  return fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function CardMembers({ members = [], onOpenModal }) {
  if (!members || members.length === 0) {
    return (
      <button
        type="button"
        onClick={onOpenModal}
        className="flex items-center gap-1.5 rounded-md bg-[#3d454c] px-3 py-1.5 text-sm text-[#dee4ea] hover:bg-[#4a535c] transition-colors"
      >
        <Users className="h-3.5 w-3.5" />
        <span>Thêm thành viên</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {members.slice(0, 3).map((member) => {
          const user = member.userId || {};
          const userId = user.id || user._id;
          return (
            <div
              key={userId}
              className="h-6 w-6 rounded-full bg-[#579dff] flex items-center justify-center text-[10px] font-semibold text-white"
              title={user.fullName || user.name || user.username || "Unknown"}
            >
              {getInitials(user.fullName || user.name || user.username || "?")}
            </div>
          );
        })}
        {members.length > 3 && (
          <div className="h-6 w-6 rounded-full bg-[#6b7785] flex items-center justify-center text-[10px] font-semibold text-white">
            +{members.length - 3}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onOpenModal}
        className="rounded p-1 text-[#9fadbc] hover:bg-white/10"
        aria-label="Quản lý thành viên"
      >
        <Users className="h-4 w-4" />
      </button>
    </div>
  );
}

export default CardMembers;
