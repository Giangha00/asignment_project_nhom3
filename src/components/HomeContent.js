import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const HomeContent = ({ workspace, user, workspaces, onCreateWorkspace, onCreateBoard, onInviteMember }) => {
  const [workspaceName, setWorkspaceName] = useState('');
  const [inviteByWorkspace, setInviteByWorkspace] = useState({});
  const [boardByWorkspace, setBoardByWorkspace] = useState({});

  const workspaceCount = workspaces?.length || 0;
  const totalBoards = useMemo(
    () => workspaces?.reduce((sum, ws) => sum + (ws.boards?.length || 0), 0) || 0,
    [workspaces]
  );

  const getVisibilityMeta = (visibility) => {
    if (visibility === 'public') {
      return { label: 'Công khai', icon: '🌐' };
    }
    return { label: 'Riêng tư', icon: '🔒' };
  };

  const handleCreateWorkspaceSubmit = (event) => {
    event.preventDefault();
    const name = workspaceName.trim();
    if (!name) return;
    Promise.resolve(
      onCreateWorkspace({ name, type: 'default', description: '', visibility: 'private' })
    ).then(() => {
      setWorkspaceName('');
    });
  };

  const handleCreateBoardSubmit = (event, workspaceId) => {
    event.preventDefault();
    const title = (boardByWorkspace[workspaceId] || '').trim();
    if (!title) return;
    onCreateBoard({
      title,
      workspaceId,
      visibility: 'workspace',
    });
    setBoardByWorkspace((prev) => ({ ...prev, [workspaceId]: '' }));
  };

  const handleInviteSubmit = (event, workspaceId) => {
    event.preventDefault();
    const email = (inviteByWorkspace[workspaceId] || '').trim();
    if (!email) return;
    onInviteMember(workspaceId, email);
    setInviteByWorkspace((prev) => ({ ...prev, [workspaceId]: '' }));
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="rounded-[28px] border border-[#30363f] bg-[#181f25] p-8 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#8c9bab]">Trang chủ</p>
              <h1 className="mt-3 text-4xl font-bold text-white">Xin chào, {user?.name || 'Người dùng'}</h1>
              <p className="mt-2 max-w-2xl text-sm text-[#9fadbc]">
                Mỗi người dùng có thể tạo nhiều workspace. Trong mỗi workspace, bạn tạo nhiều bảng,
                bấm vào bảng để mở BoardDetail với các cột Todo, Doing, Review và Done.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[20px] border border-[#232b34] bg-[#10161b] p-5">
                <div className="text-sm text-[#8c9bab]">Số workspace</div>
                <div className="mt-2 text-2xl font-semibold text-white">{workspaceCount}</div>
              </div>
              <div className="rounded-[20px] border border-[#232b34] bg-[#10161b] p-5">
                <div className="text-sm text-[#8c9bab]">Tổng số bảng</div>
                <div className="mt-2 text-2xl font-semibold text-white">{totalBoards}</div>
              </div>
              <div className="rounded-[20px] border border-[#232b34] bg-[#10161b] p-5">
                <div className="text-sm text-[#8c9bab]">Workspace hiện tại</div>
                <div className="mt-2 truncate text-2xl font-semibold text-white">{workspace?.name || '-'}</div>
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-[#232b34] bg-[#10161b] p-6">
            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#2f67ff] text-2xl font-bold text-white">
                {user?.initials || 'ND'}
              </div>
              <div>
                <div className="text-sm text-[#8c9bab]">Tài khoản</div>
                <div className="mt-1 text-xl font-semibold text-white">{user?.name || 'Người dùng'}</div>
                <div className="text-sm text-[#9fadbc]">{user?.email || 'user@example.com'}</div>
              </div>
            </div>

            <form onSubmit={handleCreateWorkspaceSubmit} className="space-y-3 rounded-2xl border border-[#3c444d] bg-[#141b21] p-4">
              <label className="text-sm text-[#9fadbc]">Tạo workspace mới</label>
              <input
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="Nhập tên workspace"
                className="w-full rounded-xl border border-[#2d3640] bg-[#0f1720] px-3 py-2 text-white outline-none"
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-[#579dff] px-4 py-2.5 text-sm font-semibold text-[#1d2125] transition hover:bg-[#7fbfff]"
              >
                Tạo workspace
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {workspaces.map((ws) => {
          const boards = ws.boards || [];
          const visibility = getVisibilityMeta(ws.visibility);

          return (
            <article key={ws.id} className="rounded-[24px] border border-[#30363f] bg-[#181f25] p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`h-7 w-7 rounded-md ${ws.color || 'bg-[#2f67ff]'}`} aria-hidden />
                    <h2 className="text-2xl font-bold text-white">{ws.name}</h2>
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#3c444d] bg-[#10161b] px-2.5 py-1 text-xs text-[#9fadbc]">
                      <span aria-hidden>{visibility.icon}</span>
                      {visibility.label}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#8c9bab]">
                    Thành viên: {ws.members?.length || 0} • Bảng: {boards.length}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:w-[520px]">
                  <form onSubmit={(e) => handleCreateBoardSubmit(e, ws.id)} className="rounded-xl border border-[#2d3640] bg-[#10161b] p-3">
                    <label className="text-xs uppercase tracking-wider text-[#8c9bab]">Tạo bảng trong workspace</label>
                    <input
                      value={boardByWorkspace[ws.id] || ''}
                      onChange={(e) =>
                        setBoardByWorkspace((prev) => ({ ...prev, [ws.id]: e.target.value }))
                      }
                      placeholder="Tên bảng mới"
                      className="mt-2 w-full rounded-lg border border-[#2d3640] bg-[#0f1720] px-3 py-2 text-sm text-white outline-none"
                    />
                    <button type="submit" className="mt-2 w-full rounded-lg bg-[#579dff] px-3 py-2 text-sm font-semibold text-[#1d2125] hover:bg-[#7fbfff]">
                      Tạo bảng
                    </button>
                  </form>

                  <form onSubmit={(e) => handleInviteSubmit(e, ws.id)} className="rounded-xl border border-[#2d3640] bg-[#10161b] p-3">
                    <label className="text-xs uppercase tracking-wider text-[#8c9bab]">Mời thành viên</label>
                    <input
                      value={inviteByWorkspace[ws.id] || ''}
                      onChange={(e) =>
                        setInviteByWorkspace((prev) => ({ ...prev, [ws.id]: e.target.value }))
                      }
                      placeholder="email@example.com"
                      className="mt-2 w-full rounded-lg border border-[#2d3640] bg-[#0f1720] px-3 py-2 text-sm text-white outline-none"
                    />
                    <button type="submit" className="mt-2 w-full rounded-lg border border-[#3c444d] bg-[#151b21] px-3 py-2 text-sm font-semibold text-[#d1d7e0] hover:border-[#579dff] hover:text-white">
                      Gửi lời mời
                    </button>
                  </form>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {boards.map((board) => (
                  <Link
                    key={board.id}
                    to={`/workspace/${ws.id}/board/${encodeURIComponent(board.id)}`}
                    className="group rounded-xl border border-[#2d3640] bg-[#10161b] p-4 transition hover:border-[#579dff]"
                  >
                    <div className="text-sm font-semibold text-white group-hover:text-[#a7d0ff]">{board.name}</div>
                    <p className="mt-1 line-clamp-2 text-xs text-[#8c9bab]">{board.description || 'Chưa có mô tả'}</p>
                    <div className="mt-3 text-xs font-medium text-[#579dff]">Mở board</div>
                  </Link>
                ))}

                {boards.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#3c444d] bg-[#10161b] p-4 text-sm text-[#8c9bab]">
                    Workspace này chưa có bảng. Tạo bảng mới ở khung bên trên.
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
};

export default HomeContent;
