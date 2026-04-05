import React, { useState, useRef, useEffect } from 'react';

const ContentBoard = ({ workspace, workspaces, onCreateBoard }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [boardTitle, setBoardTitle] = useState('');
  const [viewPermission, setViewPermission] = useState('workspace');
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(workspace.id);
  const menuRef = useRef(null);

  const visibilityOptions = [
    { value: 'workspace', label: 'Không gian làm việc' },
    { value: 'private', label: 'Riêng tư' },
    { value: 'public', label: 'Công khai' }
  ];

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleCreateClick = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleWorkspaceToggle = () => {
    setWorkspaceOpen((prev) => !prev);
  };

  const handleWorkspaceSelect = (workspaceId) => {
    setSelectedWorkspaceId(workspaceId);
    setWorkspaceOpen(false);
  };

  const handleCancel = () => {
    setMenuOpen(false);
    setWorkspaceOpen(false);
    setBoardTitle('');
    setViewPermission('workspace');
  };

  const handleCreateSubmit = (event) => {
    event.preventDefault();
    if (!boardTitle.trim()) {
      return;
    }

    const selectedWorkspace = workspaces?.find(ws => ws.id === selectedWorkspaceId) || workspace;

    if (typeof onCreateBoard === 'function') {
      onCreateBoard({
        title: boardTitle.trim(),
        workspaceId: selectedWorkspace.id,
        visibility: viewPermission
      });
    }

    handleCancel();
  };

  useEffect(() => {
    setSelectedWorkspaceId(workspace.id);
  }, [workspace.id]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="rounded-[28px] border border-[#30363f] bg-[#181f25] p-8 shadow-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#a16eff] to-[#5f8bff] text-3xl font-bold text-white">T</div>
              <div>
                <div className="text-3xl font-bold text-white">{workspace.name}</div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[#9fadbc]">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[#d3dce4]">Premium</span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[#d3dce4]">Riêng tư</span>
                </div>
              </div>
            </div>
            
          </div>

          <div className="border-t border-[#30363f] pt-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xl font-semibold text-white">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#3b82f6]">
                    <path d="M4 5h16" />
                    <path d="M4 12h16" />
                    <path d="M4 19h16" />
                  </svg>
                  Jira
                </div>
                <p className="max-w-2xl text-sm text-[#9fadbc]">Bắt đầu với một mẫu và để Jira xử lý các mẫu còn lại bằng quy trình làm việc có thể tùy chỉnh</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { title: 'Quản lý Dự án', bg: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' },
                { title: 'Scrum', bg: 'linear-gradient(135deg, #0f766e 0%, #34d399 100%)' },
                { title: 'Theo dõi Lỗi', bg: 'linear-gradient(135deg, #c2410c 0%, #fb923c 100%)' },
                { title: 'Quy trình Thiết kế Web', bg: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)' }
              ].map(item => (
                <div
                  key={item.title}
                  className="group overflow-hidden rounded-[30px] p-5 text-white shadow-[0_20px_45px_rgba(15,23,42,0.35)] transition-transform duration-300 hover:-translate-y-1"
                  style={{ background: item.bg }}
                >
                  <div className="text-sm font-bold uppercase tracking-[0.28em] opacity-95">{item.title}</div>
                  <div className="relative mt-4 h-28 overflow-hidden rounded-[24px] bg-white/10">
                    <div className="absolute -left-5 top-2 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute right-4 top-4 h-14 w-14 rounded-full bg-white/20" />
                    <div className="absolute left-4 bottom-4 h-12 w-28 rounded-[20px] bg-white/10" />
                    <div className="absolute right-4 bottom-5 h-5 w-16 rounded-full bg-white/15" />
                  </div>
                  <div className="mt-5 flex items-center justify-between text-sm text-white/90">
                    <span className="font-medium">Xem</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#30363f] bg-[#181f25] p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#8c9bab]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12h18" />
            <path d="M12 3v18" />
          </svg>
          Các bảng của bạn
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {workspace.boards.map(boardItem => (
            <button key={boardItem.id} className="group rounded-[28px] border border-[#30363f] bg-[#141b21] p-6 text-left transition hover:-translate-y-1">
              <div className="mb-4 h-32 rounded-3xl bg-gradient-to-br from-[#8b5cf6] to-[#ec4899]" />
              <div className="text-sm font-semibold text-white">{boardItem.name}</div>
              <p className="mt-2 text-sm text-[#9fadbc]">{boardItem.description}</p>
            </button>
          ))}
          <div className="relative" ref={menuRef}>
            <button
              onClick={handleCreateClick}
              className="flex w-full flex-col items-center justify-center rounded-[28px] border border-dashed border-[#3c444d] bg-[#10161b] p-6 text-[#9fadbc] transition hover:border-[#579dff] hover:text-white"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#0e1b27] text-2xl">+</div>
              <div className="text-sm font-semibold">Tạo bảng mới</div>
            </button>
            {menuOpen && (
              <form onSubmit={handleCreateSubmit} className="absolute left-1/2 bottom-full z-20 mb-3 w-80 -translate-x-1/2 rounded-[18px] border border-[#3c444d] bg-[#141b21] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                <div className="mb-4 text-lg font-semibold text-white">Tạo bảng</div>

                <label className="mb-1 block text-sm text-[#9fadbc]">Tiêu đề bảng</label>
                <input
                  value={boardTitle}
                  onChange={(e) => setBoardTitle(e.target.value)}
                  placeholder="Nhập tên bảng"
                  required
                  className="mb-4 w-full rounded-xl border border-[#3c444d] bg-[#0f1720] px-3 py-2 text-white outline-none transition focus:border-[#579dff]"
                />

                <label className="mb-1 block text-sm text-[#9fadbc]">Không gian làm việc</label>
                <div className="relative mb-4">
                  <button
                    type="button"
                    onClick={handleWorkspaceToggle}
                    className="w-full rounded-xl border border-[#3c444d] bg-[#0f1720] px-3 py-2 text-left text-[#e4edf4] outline-none transition hover:border-[#579dff]"
                  >
                    {workspaces?.find(ws => ws.id === selectedWorkspaceId)?.name || workspace.name}
                  </button>
                  {workspaceOpen && (
                    <div className="absolute left-0 top-full z-30 mt-2 w-full overflow-hidden rounded-xl border border-[#3c444d] bg-[#0f1720] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                      {workspaces?.map(ws => (
                        <button
                          key={ws.id}
                          type="button"
                          onClick={() => handleWorkspaceSelect(ws.id)}
                          className="w-full px-3 py-2 text-left text-sm text-[#e4edf4] transition hover:bg-[#1f2834]"
                        >
                          <div className="font-medium">{ws.name}</div>
                          <div className="text-xs text-[#8c9bab]">{ws.boards.length} bảng</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <label className="mb-1 block text-sm text-[#9fadbc]">Quyền xem</label>
                <select
                  value={viewPermission}
                  onChange={(e) => setViewPermission(e.target.value)}
                  className="mb-4 w-full rounded-xl border border-[#3c444d] bg-[#0f1720] px-3 py-2 text-white outline-none"
                >
                  {visibilityOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>

                <div className="flex justify-end gap-2">
                  <button type="button" onClick={handleCancel} className="rounded-xl border border-[#3c444d] px-4 py-2 text-sm text-[#9fadbc] transition hover:bg-[#161f28]">
                    Hủy
                  </button>
                  <button type="submit" className="rounded-xl bg-[#579dff] px-4 py-2 text-sm font-semibold text-[#1d2125] transition hover:bg-[#7fbfff]">
                    Tạo mới
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default ContentBoard;
