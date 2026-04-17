import React from "react";
import { Users } from "lucide-react";
import MemberAvatar from "../members/MemberAvatar";

const INLINE_AVATAR = 24;

function assigneeToUser(member) {
  const u = member?.userId;
  if (u && typeof u === "object") {
    return {
      name: u.fullName || u.name || u.username || "Thành viên",
      username: u.email || "",
      avatarUrl: u.avatarUrl || "",
      key: String(member._id || member.id || u._id || u.id || ""),
    };
  }
  return {
    name: "Thành viên",
    username: "",
    avatarUrl: "",
    key: String(member?._id || member?.id || u || ""),
  };
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
        {members.slice(0, 3).map((member, idx) => {
          const u = assigneeToUser(member);
          return (
            <div key={u.key || `card-member-${idx}`} title={u.name}>
              <MemberAvatar
                name={u.name}
                username={u.username}
                avatarUrl={u.avatarUrl}
                size={INLINE_AVATAR}
                className="ring-2 ring-[#323940]"
              />
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
