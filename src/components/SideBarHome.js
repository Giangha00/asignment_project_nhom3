import React from 'react';

const Sidebar = ({ workspaces, onSelectSection, activeWorkspace, activeSection, onToggleWorkspace }) => {
  return (
    <aside className="w-[260px] h-[calc(100vh-48px)] bg-[#1d2125] border-r border-[#3c444d] text-[#9fadbc] flex flex-col font-sans select-none">
      <div className="p-3 flex-1 overflow-y-auto custom-scrollbar">
        {/* 1. Top Navigation */}
        <nav className="space-y-1 mb-4 border-b border-[#3c444d] pb-4">
          <button
            onClick={() => onSelectSection('board', activeWorkspace.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-[3px] transition text-sm ${activeSection === 'board' ? 'bg-[#3c444d] text-white' : 'hover:bg-[#3c444d] text-[#dee4ea]'}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            Bảng
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#3c444d] rounded-[3px] transition text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Mẫu
          </button>
          <button
            onClick={() => onSelectSection('home', activeWorkspace.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-[3px] transition text-sm font-medium ${activeSection === 'home' ? 'bg-[#3c444d] text-white' : 'hover:bg-[#3c444d] text-[#579dff]'}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            Trang chủ
          </button>
        </nav>

        {/* 2. Workspace List */}
        <div className="mt-4">
          <p className="px-3 text-xs font-bold text-[#8c9bab] uppercase mb-3">Các không gian làm việc</p>

          <div className="space-y-2">
            {workspaces.map(ws => (
              <div key={ws.id} className="workspace-container">
                <button
                  onClick={() => {
                    onToggleWorkspace(ws.id);
                    onSelectSection('board', ws.id);
                  }}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-[3px] transition ${activeWorkspace?.id === ws.id ? 'bg-[#3c444d] text-white' : 'hover:bg-[#3c444d] text-[#dee4ea]'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 ${ws.color} rounded-[3px] flex items-center justify-center text-xs font-bold text-white`}>
                      {ws.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold truncate w-36 text-left">{ws.name}</span>
                  </div>
                  <svg className={`transition-transform duration-200 ${ws.isOpen ? 'rotate-180' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                </button>

                {ws.isOpen && (
                  <div className="ml-8 mt-2 space-y-1 rounded-[3px] border border-[#2f3740] bg-[#151b21] p-2">
                    <button
                      onClick={() => onSelectSection('board', ws.id)}
                      className={`w-full flex items-center gap-3 p-2 text-sm rounded-[3px] transition ${activeWorkspace?.id === ws.id && activeSection === 'board' ? 'bg-[#3c444d] text-white' : 'hover:bg-[#3c444d] text-[#dee4ea]'}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                      Bảng
                    </button>
                    <button
                      onClick={() => onSelectSection('members', ws.id)}
                      className={`w-full flex items-center justify-between gap-3 p-2 text-sm rounded-[3px] transition ${activeWorkspace?.id === ws.id && activeSection === 'members' ? 'bg-[#3c444d] text-white' : 'hover:bg-[#3c444d] text-[#dee4ea]'}`}
                    >
                      <div className="flex items-center gap-3">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                        Thành viên
                      </div>
                      <span className="text-lg font-light pr-1 opacity-0 group-hover:opacity-100">+</span>
                    </button>
                    <button
                      onClick={() => onSelectSection('settings', ws.id)}
                      className={`w-full flex items-center gap-3 p-2 text-sm rounded-[3px] transition ${activeWorkspace?.id === ws.id && activeSection === 'settings' ? 'bg-[#3c444d] text-white' : 'hover:bg-[#3c444d] text-[#dee4ea]'}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06"/></svg>
                      Cài đặt
                    </button>
                    {ws.hasBilling && (
                      <button className="w-full flex items-center gap-3 p-2 text-sm hover:bg-[#3c444d] rounded-[3px] transition text-[#dee4ea]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                        Thanh toán
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
