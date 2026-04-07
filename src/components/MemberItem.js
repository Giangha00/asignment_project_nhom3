import React from 'react';

const MemberItem = ({ member }) => {
  if (!member) {
    return null; // Hoặc có thể hiển thị một placeholder hoặc thông báo lỗi
  }

  return (
    <div key={member.id} className="grid gap-4 rounded-[22px] border border-[#242b33] bg-[#181f25] p-4 text-sm sm:grid-cols-[1fr_1fr_1fr_1fr]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2f67ff] text-sm font-bold text-white">{member.initials}</div>
        <div>
          <div className="font-semibold text-white">{member.name}</div>
          <div className="text-xs text-[#7b8b9a]">{member.handle}</div>
        </div>
      </div>
      <div className="text-[#9fadbc]">{member.role}</div>
      <div className="text-[#9fadbc]">Lần hoạt động gần nhất {member.lastActive}</div>
      <div className="flex items-center justify-end gap-2">
        <button className="rounded-full border border-[#3c444d] bg-[#0f1720] px-3 py-2 text-xs text-[#9fadbc] hover:border-[#579dff] hover:text-white transition">Bảng (1)</button>
        <button className="rounded-full border border-[#3c444d] bg-[#0f1720] px-3 py-2 text-xs text-[#9fadbc] hover:border-[#579dff] hover:text-white transition">Rời đi</button>
      </div>
    </div>
  );
};

export default MemberItem;