import React, { useState } from 'react';

const HomeContent = ({ workspace, user, workspaces, onCreateWorkspace, onCreateBoard, onInviteMember }) => {
  const [workspaceName, setWorkspaceName] = useState('');
  const [boardName, setBoardName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [showWorkspaceForm, setShowWorkspaceForm] = useState(false);
  const [showBoardForm, setShowBoardForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);

  const recentBoards = workspace.boards || [];
  const workspaceCount = workspaces?.length || 0;
  const totalBoards = workspaces?.reduce((sum, ws) => sum + (ws.boards?.length || 0), 0) || 0;
  const nextItems = [
    {
      title: 'Tiếp theo',
      description: 'Theo dõi ngày hết hạn, để cập và nhiệm vụ sắp tới.',
      button: 'Đã hiểu! Bỏ qua điều này.'
    }
  ];

  const handleCreateWorkspaceSubmit = (event) => {
    event.preventDefault();
    if (!workspaceName.trim()) return;
    onCreateWorkspace(workspaceName.trim());
    setWorkspaceName('');
    setShowWorkspaceForm(false);
  };

  const handleCreateBoardSubmit = (event) => {
    event.preventDefault();
    if (!boardName.trim()) return;
    onCreateBoard({
      title: boardName.trim(),
      workspaceId: workspace.id,
      visibility: 'workspace'
    });
    setBoardName('');
    setShowBoardForm(false);
  };

  const handleInviteSubmit = (event) => {
    event.preventDefault();
    if (!inviteEmail.trim()) return;
    onInviteMember(workspace.id, inviteEmail.trim());
    setInviteEmail('');
    setShowInviteForm(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="rounded-[28px] border border-[#30363f] bg-[#181f25] p-8 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#8c9bab]">Trang chủ</p>
              <h1 className="mt-3 text-4xl font-bold text-white">Xin chào, {user?.name || 'Người dùng'}</h1>
              <p className="max-w-2xl text-sm text-[#9fadbc]">Quản lý workspace, bảng và mời thành viên mới ngay từ trang home.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-[#232b34] bg-[#10161b] p-5">
                <div className="text-sm text-[#8c9bab]">Workspace</div>
                <div className="mt-3 text-2xl font-semibold text-white">{workspaceCount}</div>
              </div>
              <div className="rounded-[24px] border border-[#232b34] bg-[#10161b] p-5">
                <div className="text-sm text-[#8c9bab]">Tổng số bảng</div>
                <div className="mt-3 text-2xl font-semibold text-white">{totalBoards}</div>
              </div>
              <div className="rounded-[24px] border border-[#232b34] bg-[#10161b] p-5">
                <div className="text-sm text-[#8c9bab]">Workspace hiện tại</div>
                <div className="mt-3 text-2xl font-semibold text-white">{workspace.name}</div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#232b34] bg-[#10161b] p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#2f67ff] text-2xl font-bold text-white">{user?.initials || 'ND'}</div>
              <div>
                <div className="text-sm text-[#8c9bab]">Tài khoản</div>
                <div className="mt-1 text-xl font-semibold text-white">{user?.name || 'Người dùng'}</div>
                <div className="text-sm text-[#9fadbc]">{user?.email || 'user@example.com'}</div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button onClick={() => { setShowWorkspaceForm(prev => !prev); setShowBoardForm(false); setShowInviteForm(false); }} className="w-full rounded-xl bg-[#2f67ff] px-4 py-3 text-sm font-semibold text-[#1d2125] transition hover:bg-[#4b82ff]">Tạo workspace mới</button>
              {showWorkspaceForm && (
                <form onSubmit={handleCreateWorkspaceSubmit} className="space-y-3 rounded-[24px] border border-[#3c444d] bg-[#141b21] p-4">
                  <label className="text-sm text-[#9fadbc]">Tên workspace</label>
                  <input
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="Nhập tên workspace"
                    className="w-full rounded-xl border border-[#2d3640] bg-[#0f1720] px-3 py-2 text-white outline-none"
                  />
                  <div className="flex justify-between gap-2">
                    <button type="button" onClick={() => setShowWorkspaceForm(false)} className="rounded-xl border border-[#3c444d] px-4 py-2 text-sm text-[#9fadbc] hover:bg-[#161f28]">Hủy</button>
                    <button type="submit" className="rounded-xl bg-[#579dff] px-4 py-2 text-sm font-semibold text-[#1d2125] hover:bg-[#7fbfff]">Tạo</button>
                  </div>
                </form>
              )}

              <button onClick={() => { setShowBoardForm(prev => !prev); setShowWorkspaceForm(false); setShowInviteForm(false); }} className="w-full rounded-xl border border-[#3c444d] bg-[#10161b] px-4 py-3 text-sm font-semibold text-[#e4edf4] transition hover:border-[#579dff]">Tạo bảng mới</button>
              {showBoardForm && (
                <form onSubmit={handleCreateBoardSubmit} className="space-y-3 rounded-[24px] border border-[#3c444d] bg-[#141b21] p-4">
                  <label className="text-sm text-[#9fadbc]">Tên bảng</label>
                  <input
                    value={boardName}
                    onChange={(e) => setBoardName(e.target.value)}
                    placeholder="Nhập tên bảng"
                    className="w-full rounded-xl border border-[#2d3640] bg-[#0f1720] px-3 py-2 text-white outline-none"
                  />
                  <div className="flex justify-between gap-2">
                    <button type="button" onClick={() => setShowBoardForm(false)} className="rounded-xl border border-[#3c444d] px-4 py-2 text-sm text-[#9fadbac] hover:bg-[#161f28]">Hủy</button>
                    <button type="submit" className="rounded-xl bg-[#579dff] px-4 py-2 text-sm font-semibold text-[#1d2125] hover:bg-[#7fbfff]">Tạo</button>
                  </div>
                </form>
              )}

              <button onClick={() => { setShowInviteForm(prev => !prev); setShowWorkspaceForm(false); setShowBoardForm(false); }} className="w-full rounded-xl border border-[#3c444d] bg-[#10161b] px-4 py-3 text-sm font-semibold text-[#e4edf4] transition hover:border-[#579dff]">Mời người dùng</button>
              {showInviteForm && (
                <form onSubmit={handleInviteSubmit} className="space-y-3 rounded-[24px] border border-[#3c444d] bg-[#141b21] p-4">
                  <label className="text-sm text-[#9fadbc]">Email mời</label>
                  <input
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Nhập email người dùng"
                    className="w-full rounded-xl border border-[#2d3640] bg-[#0f1720] px-3 py-2 text-white outline-none"
                  />
                  <div className="flex justify-between gap-2">
                    <button type="button" onClick={() => setShowInviteForm(false)} className="rounded-xl border border-[#3c444d] px-4 py-2 text-sm text-[#9fadbc] hover:bg-[#161f28]">Hủy</button>
                    <button type="submit" className="rounded-xl bg-[#579dff] px-4 py-2 text-sm font-semibold text-[#1d2125] hover:bg-[#7fbfff]">Gửi</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-[28px] border border-[#30363f] bg-[#181f25] p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm uppercase tracking-[0.3em] text-[#8c9bab]">Tiếp theo</div>
              <h2 className="mt-3 text-2xl font-semibold text-white">Giữ mọi thứ đúng tiến độ</h2>
            </div>
            <div className="rounded-full border border-[#3c444d] bg-[#0f1720] px-4 py-2 text-sm text-[#9fadbc]">Lưu ý</div>
          </div>
          <div className="mt-6 space-y-4">
            {nextItems.map(item => (
              <div key={item.title} className="rounded-[24px] border border-[#232b34] bg-[#141b21] p-6">
                <div className="text-xl font-semibold text-white">{item.title}</div>
                <p className="mt-3 text-sm text-[#9fadbc]">{item.description}</p>
                <button className="mt-6 rounded-lg bg-[#2f67ff] px-4 py-3 text-sm font-semibold text-[#1d2125] transition hover:bg-[#4b82ff]">
                  {item.button}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-[#30363f] bg-[#181f25] p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm uppercase tracking-[0.3em] text-[#8c9bab]">Đã xem gần đây</div>
                <div className="mt-2 text-2xl font-semibold text-white">Bảng gần đây</div>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {recentBoards.map(board => (
                <div key={board.id} className="rounded-[24px] border border-[#232b34] bg-[#141b21] p-4 transition hover:border-[#3c66ff]">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-white">{board.name}</div>
                      <div className="text-xs text-[#8c9bab]">{board.description}</div>
                    </div>
                    <span className="rounded-full bg-[#2f67ff] px-3 py-1 text-xs font-semibold text-[#e6f0ff]">Mới</span>
                  </div>
                </div>
              ))}
              {recentBoards.length === 0 && (
                <div className="rounded-[24px] border border-[#232b34] bg-[#141b21] p-4 text-sm text-[#9fadbc]">Chưa có mục nào được xem gần đây.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeContent;
