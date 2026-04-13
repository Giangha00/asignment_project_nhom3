import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../lib/api";

const Sidebar = ({ workspaces, activeWorkspaceId, activeSection, onToggleWorkspace, onCreateWorkspace, onDeleteWorkspace, onUpdateWorkspace, onSelectSection, onLogout }) => {
  const navigate = useNavigate();
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceType, setWorkspaceType] = useState('');
  const [workspaceDescription, setWorkspaceDescription] = useState('');
  const [workspaceVisibility, setWorkspaceVisibility] = useState('private');
  const [workspaceColor, setWorkspaceColor] = useState('#2f67ff');
  const [editingWorkspace, setEditingWorkspace] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const getWorkspaceApiId = (ws) => ws?.apiId || ws?._id || ws?.workspaceId || null;

  const normalizeColorForApi = (color) => {
    if (!color) return '#2f67ff';
    if (typeof color !== 'string') return color;
    const match = color.match(/#([0-9a-fA-F]{3,8})/);
    if (match) return `#${match[1]}`;
    return color;
  };

  const getVisibilityLabel = (visibility) =>
    visibility === 'public' ? 'Công khai' : 'Riêng tư';

  const navigateToSection = (workspaceId, section) => {
    if (!workspaceId) return;

    const normalizedSection = section === 'boards' ? 'board' : section;
    if (typeof onSelectSection === 'function') {
      onSelectSection({ workspaceId, section: normalizedSection });
    }

    if (section === 'home') {
      navigate('/home');
      return;
    }

    const pathSection = normalizedSection === 'board' ? 'boards' : normalizedSection;
    navigate(`/workspace/${workspaceId}/${pathSection}`);
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!workspaceName.trim() || submitting) return;

    // Backend chỉ nhận: name, description, visibility, logoUrl
    const apiPayload = {
      name: workspaceName.trim(),
      description: workspaceDescription.trim(),
      visibility: workspaceVisibility,
    };

    try {
      setSubmitting(true);
      const response = await api.post("/api/workspaces", apiPayload);
      const createdWorkspace = response.data;

      if (onCreateWorkspace) {
        onCreateWorkspace({
          ...createdWorkspace,
          // Giữ cơ chế id số hiện có để không ảnh hưởng routing/view khác.
          // Lưu id backend vào apiId để sửa/xóa qua API.
          name: createdWorkspace?.name || apiPayload.name,
          description: createdWorkspace?.description || apiPayload.description,
          visibility: createdWorkspace?.visibility,
          logoUrl: createdWorkspace?.logoUrl,
          apiId: getWorkspaceApiId(createdWorkspace),
          // Giữ các field UI hiện có
          type: workspaceType || 'default',
          color: normalizeColorForApi(workspaceColor),
          isOpen: true,
          boards: createdWorkspace.boards || [],
        });
      }

      setWorkspaceName('');
      setWorkspaceType('');
      setWorkspaceDescription('');
      setWorkspaceVisibility('private');
      setWorkspaceColor('#2f67ff');
      setShowCreateWorkspace(false);
    } catch (error) {
      console.error('Failed to create workspace:', error);
      const status = error.response?.status;
      const apiMessage = error.response?.data?.message || error.response?.data?.error;
      if (status === 401) {
        alert('Bạn chưa đăng nhập hoặc token hết hạn. Vui lòng đăng nhập lại.');
        if (typeof onLogout === 'function') onLogout();
      } else {
        alert(apiMessage || 'Không thể tạo workspace. Vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWorkspace = async (wsId) => {
    if (submitting) return;
    const ws = workspaces.find((w) => w.id === wsId);
    const apiId = getWorkspaceApiId(ws);
    if (!apiId) {
      alert('Workspace này đang là dữ liệu local (chưa có trên backend) nên không thể xóa qua API.');
      return;
    }
    try {
      setSubmitting(true);
      await api.delete(`/api/workspaces/${apiId}`);
      if (onDeleteWorkspace) {
        onDeleteWorkspace(apiId);
      }
    } catch (error) {
      console.error('Failed to delete workspace:', error);
      const status = error.response?.status;
      const apiMessage = error.response?.data?.message || error.response?.data?.error;
      if (status === 401) {
        alert('Bạn chưa đăng nhập hoặc token hết hạn. Vui lòng đăng nhập lại.');
        if (typeof onLogout === 'function') onLogout();
      } else {
        alert(apiMessage || 'Không thể xóa workspace. Vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (workspace) => {
    setEditingWorkspace(workspace);
    setWorkspaceName(workspace.name || '');
    setWorkspaceType(workspace.type === 'default' ? '' : (workspace.type || ''));
    setWorkspaceDescription(workspace.description || '');
    setWorkspaceVisibility(workspace.visibility || 'private');
    setWorkspaceColor(normalizeColorForApi(workspace.color) || '#2f67ff');
    setShowCreateWorkspace(false);
  };

  const handleUpdateWorkspace = async (e) => {
    e.preventDefault();
    if (!editingWorkspace || !workspaceName.trim() || submitting) return;

    const desiredName = workspaceName.trim();
    const desiredDescription = workspaceDescription.trim();
    const apiId = getWorkspaceApiId(editingWorkspace);

    // Backend chỉ nhận: name, description, visibility, logoUrl
    const apiPayload = {
      name: desiredName,
      description: desiredDescription,
      visibility: workspaceVisibility,
    };

    try {
      setSubmitting(true);
      let updatedWorkspace = null;
      if (apiId) {
        const response = await api.patch(`/api/workspaces/${apiId}`, apiPayload);
        updatedWorkspace = response.data;
      }

      if (typeof onUpdateWorkspace === 'function') {
        onUpdateWorkspace({
          ...editingWorkspace,
          ...updatedWorkspace,
          name: desiredName,
          description: desiredDescription,
          type: workspaceType || editingWorkspace.type || 'default',
          visibility: workspaceVisibility,
          color: normalizeColorForApi(workspaceColor),
          isOpen: editingWorkspace.isOpen,
        });
      }

      setEditingWorkspace(null);
    } catch (error) {
      console.error('Failed to update workspace:', error);
      const status = error.response?.status;
      const apiMessage = error.response?.data?.message || error.response?.data?.error;
      if (status === 401) {
        alert('Bạn chưa đăng nhập hoặc token hết hạn. Vui lòng đăng nhập lại.');
        if (typeof onLogout === 'function') onLogout();
      } else {
        alert(apiMessage || error.message || 'Không thể cập nhật workspace. Vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside className="w-[300px] h-[calc(100vh-48px)] bg-[#1d2125] border-r border-[#3c444d] text-[#9fadbc] flex flex-col font-sans select-none fixed left-0 top-[48px] z-30 overflow-hidden">
      <div className="p-3 flex-1 overflow-y-auto custom-scrollbar">
        {/* 1. Top Navigation */}
        <nav className="space-y-1 mb-4 border-b border-[#3c444d] pb-4">
          <div className="w-full flex items-center gap-3 px-3 py-2 rounded-[3px] text-sm text-[#dee4ea]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            Bảng
          </div>
          <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#3c444d] rounded-[3px] transition text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Mẫu
          </button>
          <button
            onClick={() => {
              if (typeof onSelectSection === 'function') {
                onSelectSection({ workspaceId: activeWorkspaceId, section: 'home' });
              }
              navigate('/home');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-[3px] transition text-sm font-medium ${activeSection === 'home' ? 'bg-[#3c444d] text-white' : 'hover:bg-[#3c444d] text-[#579dff]'}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            Trang chủ
          </button>
          <button
            onClick={() => setShowCreateWorkspace(true)}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#3c444d] rounded-[3px] transition text-sm text-[#dee4ea]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            Tạo workspace mới
          </button>
        </nav>

        {/* 2. Workspace List */}
        <div className="mt-4">
          <p className="px-3 text-xs font-bold text-[#8c9bab] uppercase mb-3">Các không gian làm việc</p>

          <div className="space-y-2">
            {workspaces.map(ws => (
              <div key={ws.id} className="workspace-container">
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      onToggleWorkspace(ws.id);
                    }}
                    className={`flex-1 flex items-center justify-between px-2 py-1.5 rounded-[3px] transition ${activeWorkspaceId === ws.id ? 'bg-[#3c444d] text-white' : 'hover:bg-[#3c444d] text-[#dee4ea]'}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 ${ws.color} rounded-[3px] flex items-center justify-center text-xs font-bold text-white`}>
                        {ws.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className="text-sm font-semibold truncate w-36 text-left">{ws.name}</span>
                        <span className="text-[11px] text-[#9fadbc]">{getVisibilityLabel(ws.visibility)}</span>
                      </div>
                    </div>
                    <svg className={`transition-transform duration-200 ${ws.isOpen ? 'rotate-180' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(ws)}
                      className="rounded-[3px] p-2 text-[#9fadbc] hover:text-white hover:bg-[#3c444d] transition"
                      aria-label={`Sửa ${ws.name}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Xác nhận xóa workspace "${ws.name}"?`)) {
                          handleDeleteWorkspace(ws.id);
                        }
                      }}
                      className="rounded-[3px] p-2 text-[#9fadbc] hover:text-white hover:bg-[#7f1d1d] transition"
                      aria-label={`Xóa ${ws.name}`}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                    </button>
                  </div>
                </div>

                {ws.isOpen && (
                  <div className="ml-8 mt-2 space-y-1 rounded-[3px] border border-[#2f3740] bg-[#151b21] p-2">
                    <button
                      onClick={() => navigateToSection(ws.id, 'board')}
                      className={`w-full flex items-center gap-3 p-2 text-sm rounded-[3px] transition ${activeWorkspaceId === ws.id && activeSection === 'board' ? 'bg-[#3c444d] text-white' : 'hover:bg-[#3c444d] text-[#dee4ea]'}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                      Bảng
                    </button>
                    <button
                      onClick={() => navigateToSection(ws.id, 'members')}
                      className={`w-full flex items-center justify-between gap-3 p-2 text-sm rounded-[3px] transition ${activeWorkspaceId === ws.id && activeSection === 'members' ? 'bg-[#3c444d] text-white' : 'hover:bg-[#3c444d] text-[#dee4ea]'}`}
                    >
                      <div className="flex items-center gap-3">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                        Thành viên
                      </div>
                      <span className="text-lg font-light pr-1 opacity-0 group-hover:opacity-100">+</span>
                    </button>
                    <button
                      onClick={() => navigateToSection(ws.id, 'settings')}
                      className={`w-full flex items-center gap-3 p-2 text-sm rounded-[3px] transition ${activeWorkspaceId === ws.id && activeSection === 'settings' ? 'bg-[#3c444d] text-white' : 'hover:bg-[#3c444d] text-[#dee4ea]'}`}
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

      {/* Modal Tạo / Sửa Workspace */}
      {(showCreateWorkspace || editingWorkspace) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg p-0 w-full max-w-4xl max-h-[90vh] overflow-auto flex">
            {/* Left Section - Form */}
            <div className="flex-1 p-8">
              <button
                onClick={() => {
                  setShowCreateWorkspace(false);
                  setEditingWorkspace(null);
                  setWorkspaceVisibility('private');
                }}
                type="button"
                className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-700 text-2xl"
                aria-label="Đóng form"
              >
                ✕
              </button>

              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {editingWorkspace ? 'Chỉnh sửa Không gian làm việc' : 'Hãy xây dựng một Không gian làm việc'}
              </h2>
              <p className="text-gray-600 mb-6 text-sm">
                {editingWorkspace
                  ? 'Cập nhật thông tin cho Không gian làm việc của bạn.'
                  : 'Tăng năng suất của bạn bằng cách giúp mọi người dễ dàng truy cập bảng ở một vị trí.'}
              </p>

              <form onSubmit={editingWorkspace ? handleUpdateWorkspace : handleCreateWorkspace} className="space-y-5">
                {/* Tên Không gian làm việc */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2"></label>
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="Công ty của Taco"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Đây là tên của công ty, nhóm hoặc tổ chức của bạn.</p>
                </div>

                {/* Loại Không gian làm việc */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Loại Không gian làm việc</label>
                  <select
                    value={workspaceType}
                    onChange={(e) => setWorkspaceType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Chọn...</option>
                    <option value="sales">Kinh doanh - Bán hàng</option>
                    <option value="marketing">Tiếp thị</option>
                    <option value="hr">Nhân sự</option>
                    <option value="operations">Vận hành</option>
                    <option value="engineering">Kỹ thuật</option>
                    <option value="education">Giáo dục</option>
                    <option value="personal">Cá nhân</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                {/* Chế độ xem */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Chế độ xem</label>
                  <select
                    value={workspaceVisibility}
                    onChange={(e) => setWorkspaceVisibility(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="private">Riêng tư</option>
                    <option value="public">Công khai</option>
                  </select>
                </div>

                {/* Mô tả Không gian làm việc */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Mô tả Không gian làm việc <span className="font-normal text-gray-500">Tùy chọn</span>
                  </label>
                  <textarea
                    value={workspaceDescription}
                    onChange={(e) => setWorkspaceDescription(e.target.value)}
                    placeholder="Nhóm của chúng tôi tổ chức mọi thứ ở đây."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="4"
                  />
                  <p className="text-xs text-gray-500 mt-1">Đưa các thành viên của bạn vào bảng với mô tả Không gian làm việc của bạn.</p>
                </div>

                {/* Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition mt-8 disabled:opacity-60"
                >
                  {submitting
                    ? (editingWorkspace ? 'Đang lưu...' : 'Đang tạo...')
                    : (editingWorkspace ? 'Lưu thay đổi' : 'Tiếp tục')}
                </button>
              </form>
            </div>

            {/* Right Section - Illustration */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-cyan-300 to-green-400 items-center justify-center p-8 rounded-r-lg">
              <div className="text-center">
                <div className="inline-block bg-white bg-opacity-90 rounded-lg p-6 shadow-lg">
                  <svg width="200" height="160" viewBox="0 0 200 160" className="mx-auto">
                    {/* Workspace Illustration */}
                    <rect x="20" y="20" width="160" height="120" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" rx="8"/>
                    <rect x="35" y="35" width="40" height="35" fill="#fbbf24" stroke="#b45309" strokeWidth="1" rx="2"/>
                    <rect x="80" y="35" width="40" height="35" fill="#86efac" stroke="#16a34a" strokeWidth="1" rx="2"/>
                    <rect x="125" y="35" width="25" height="35" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="1" rx="2"/>
                    <circle cx="160" cy="100" r="8" fill="#60a5fa" opacity="0.7"/>
                    <circle cx="170" cy="85" r="6" fill="#34d399" opacity="0.5"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
