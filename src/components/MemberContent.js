import React, { useState, useRef, useEffect } from 'react';

const MemberContent = ({ workspace, onInviteMember }) => {
  const members = workspace.members || [];
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState('');
  const inviteRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (inviteRef.current && !inviteRef.current.contains(event.target)) {
        setInviteOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleInviteClick = () => {
    setInviteOpen((prev) => !prev);
  };

  const handleInviteSubmit = (event) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      return;
    }

    if (typeof onInviteMember === 'function') {
      onInviteMember(workspace.id, trimmedEmail);
    }

    setEmail('');
    setInviteOpen(false);
  };

  const handleCancel = () => {
    setInviteOpen(false);
    setEmail('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="rounded-[28px] border border-[#30363f] bg-[#181f25] p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-[0.28em] text-[#8c9bab]">Người cộng tác</div>
            <div className="text-3xl font-bold text-white">{workspace.name}</div>
            <p className="max-w-2xl text-sm text-[#9fadbc]">Các thành viên trong không gian làm việc có thể xem và tham gia tất cả các bảng hiện có trong không gian này.</p>
          </div>
          <div className="relative">
            <button
              onClick={handleInviteClick}
              className="rounded-lg bg-[#2f67ff] px-5 py-3 text-sm font-semibold text-[#1d2125] transition hover:bg-[#4b82ff]"
            >
              Mời các thành viên Không gian làm việc
            </button>
            {inviteOpen && (
              <div ref={inviteRef} className="absolute right-0 top-full z-20 mt-3 w-96 rounded-[18px] border border-[#3c444d] bg-[#141b21] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                <div className="mb-4 text-lg font-semibold text-white">Mời thành viên</div>
                <form onSubmit={handleInviteSubmit}>
                  <label className="mb-1 block text-sm text-[#9fadbc]">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email để mời"
                    required
                    className="mb-4 w-full rounded-xl border border-[#3c444d] bg-[#0f1720] px-3 py-2 text-white outline-none transition focus:border-[#579dff]"
                  />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={handleCancel} className="rounded-xl border border-[#3c444d] px-4 py-2 text-sm text-[#9fadbc] transition hover:bg-[#161f28]">
                      Hủy
                    </button>
                    <button type="submit" className="rounded-xl bg-[#579dff] px-4 py-2 text-sm font-semibold text-[#1d2125] transition hover:bg-[#7fbfff]">
                      Gửi lời mời
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#30363f] bg-[#181f25] p-8 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-2xl font-semibold text-white">Thành viên ( {members.length} )</div>
            <div className="text-sm text-[#9fadbc]">Các thành viên hiện có trong không gian làm việc này.</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="rounded-full border border-[#3c444d] bg-[#161b21] px-4 py-2 text-sm text-[#9fadbc] hover:border-[#579dff] hover:text-white transition">Thành viên</button>
            <button className="rounded-full border border-[#3c444d] bg-[#161b21] px-4 py-2 text-sm text-[#9fadbc] hover:border-[#579dff] hover:text-white transition">Khách một bảng thông tin</button>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[28px] border border-[#242b33] bg-[#11161c] text-[#dee4ea] shadow-sm">
          <div className="grid gap-4 border-b border-[#242b33] bg-[#151b21] px-6 py-4 text-sm font-semibold text-[#9fadbc] sm:grid-cols-[1fr_1fr_1fr_1fr]">
            <span>Tên</span>
            <span>Vai trò</span>
            <span>Hoạt động gần nhất</span>
            <span className="text-right">Tùy chọn</span>
          </div>
          <div className="space-y-2 p-6">
            {members.map(member => (
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
            ))}
            {members.length === 0 && (
              <div className="rounded-[22px] border border-[#242b33] bg-[#181f25] p-6 text-center text-sm text-[#9fadbc]">Chưa có thành viên nào trong không gian làm việc này.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberContent;
