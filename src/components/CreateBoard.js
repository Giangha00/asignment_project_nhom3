import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  AlignLeft,
  Calendar,
  CheckSquare,
  ChevronDown,
  Eye,
  Image as ImageIcon,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Plus,
  Tag,
  X,
  Zap,
} from 'lucide-react';

const VISIBILITY_OPTIONS = [
  { value: 'private', label: 'Riêng tư', short: 'Riêng tư' },
  { value: 'workspace', label: 'Không gian làm việc', short: 'Không gian' },
  { value: 'public', label: 'Công khai', short: 'Công khai' },
];

const TOOLBAR_DECOR = [
  { icon: Plus, label: 'Thêm' },
  { icon: Tag, label: 'Nhãn' },
  { icon: Calendar, label: 'Ngày' },
  { icon: CheckSquare, label: 'Việc cần làm' },
  { icon: Paperclip, label: 'Đính kèm' },
];

function IconHeaderButton({ children, label }) {
  return (
    <button
      type="button"
      className="rounded-md p-2 text-[#9fadbc] transition hover:bg-[#3d454c] hover:text-white"
      aria-label={label}
    >
      {children}
    </button>
  );
}

/**
 * Thẻ "Tạo bảng mới" + modal 2 cột phong cách Trello (tiêu đề lớn, không gian ở header, quyền xem dạng nút, mô tả, cột hoạt động).
 * onCreateBoard({ title, workspaceId, visibility, description? })
 */
const CreateBoard = ({ workspaces = [], defaultWorkspaceId, onCreateBoard }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [workspaceId, setWorkspaceId] = useState(null);
  const [visibility, setVisibility] = useState('workspace');
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [error, setError] = useState('');

  const panelRef = useRef(null);
  const workspaceMenuRef = useRef(null);

  const resolveDefaultWorkspace = useCallback(() => {
    if (defaultWorkspaceId != null && workspaces.some((w) => w.id === defaultWorkspaceId)) {
      return defaultWorkspaceId;
    }
    return workspaces[0]?.id ?? null;
  }, [defaultWorkspaceId, workspaces]);

  const openModal = () => {
    setTitle('');
    setDescription('');
    setVisibility('workspace');
    setError('');
    setWorkspaceMenuOpen(false);
    setWorkspaceId(resolveDefaultWorkspace());
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setWorkspaceMenuOpen(false);
    setError('');
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (workspaceMenuRef.current?.contains(e.target)) return;
      setWorkspaceMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Vui lòng nhập tên bảng.');
      return;
    }
    if (workspaceId == null) {
      setError('Chưa có không gian làm việc để gán bảng.');
      return;
    }
    if (typeof onCreateBoard === 'function') {
      const desc = description.trim();
      onCreateBoard({
        title: trimmed,
        workspaceId,
        visibility,
        ...(desc ? { description: desc } : {}),
      });
    }
    closeModal();
  };

  const selectedWorkspace = workspaces.find((w) => w.id === workspaceId);
  const members = selectedWorkspace?.members ?? [];

  return (
    <div className="relative h-full w-full">
      <button
        type="button"
        onClick={openModal}
        className="flex h-full min-h-[120px] w-full items-center justify-center rounded-xl border border-[#3c444d] bg-[#2c333a] px-4 text-center text-sm font-medium text-[#b6c2cf] transition hover:bg-[#363d45] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#579dff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1d2125]"
      >
        Tạo bảng mới
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Đóng"
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-[2px]"
            onClick={closeModal}
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-board-heading"
            className="fixed left-1/2 top-1/2 z-[110] flex max-h-[min(92vh,720px)] w-[min(100vw-1rem,56rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-[#3d454c] bg-[#282e33] shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
          >
            <h2 id="create-board-heading" className="sr-only">
              Tạo bảng mới
            </h2>
            {/* Header: không gian + icon */}
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#3d454c] bg-[#2c3339] px-3 py-2 sm:px-4">
              <div ref={workspaceMenuRef} className="relative min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => setWorkspaceMenuOpen((v) => !v)}
                  className="flex max-w-full items-center gap-2 rounded-md bg-[#3d454c] px-3 py-1.5 text-left text-sm font-medium text-white transition hover:bg-[#4a535c]"
                >
                  <span
                    className={`h-6 w-6 shrink-0 rounded ${selectedWorkspace?.color || 'bg-[#579dff]'}`}
                    aria-hidden
                  />
                  <span className="truncate">
                    {selectedWorkspace?.name ?? 'Chọn không gian'}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                </button>
                {workspaceMenuOpen && workspaces.length > 0 && (
                  <ul className="absolute left-0 top-full z-20 mt-1 max-h-56 min-w-[240px] overflow-auto rounded-lg border border-[#3d454c] bg-[#323940] py-1 shadow-xl">
                    {workspaces.map((ws) => (
                      <li key={ws.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setWorkspaceId(ws.id);
                            setWorkspaceMenuOpen(false);
                            if (error) setError('');
                          }}
                          className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-[#3d454c] ${
                            ws.id === workspaceId ? 'bg-[#3d454c] text-white' : 'text-[#d1d7e0]'
                          }`}
                        >
                          <span className={`h-6 w-6 shrink-0 rounded ${ws.color || 'bg-[#579dff]'}`} aria-hidden />
                          <span className="truncate">{ws.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <IconHeaderButton label="Ảnh bìa">
                  <ImageIcon className="h-4 w-4" />
                </IconHeaderButton>
                <IconHeaderButton label="Theo dõi">
                  <Eye className="h-4 w-4" />
                </IconHeaderButton>
                <IconHeaderButton label="Thêm tùy chọn">
                  <MoreHorizontal className="h-4 w-4" />
                </IconHeaderButton>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md p-2 text-[#9fadbc] transition hover:bg-[#3d454c] hover:text-white"
                  aria-label="Đóng"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            <div className="flex min-h-0 flex-1 flex-col md:flex-row">
              {/* Cột trái — form */}
              <form
                onSubmit={handleSubmit}
                className="flex min-h-0 min-w-0 flex-[2] flex-col overflow-y-auto border-[#3d454c] md:border-r"
              >
                <div className="p-4 sm:p-5">
                  <label htmlFor="create-board-title-input" className="sr-only">
                    Tên bảng
                  </label>
                  <textarea
                    id="create-board-title-input"
                    value={title}
                    onChange={(ev) => {
                      setTitle(ev.target.value);
                      if (error) setError('');
                    }}
                    rows={2}
                    placeholder="Tên bảng mới…"
                    className="w-full resize-none rounded-md border border-transparent bg-transparent px-1 py-0.5 text-xl font-semibold leading-snug text-white placeholder:text-[#6b7785] focus:border-[#579dff] focus:outline-none focus:ring-1 focus:ring-[#579dff] sm:text-2xl"
                  />

                  {/* Hàng nút giống thẻ Trello + quyền xem */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {TOOLBAR_DECOR.map(({ icon: Icon, label }) => (
                      <button
                        key={label}
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-md bg-[#3d454c] px-2.5 py-1.5 text-xs font-medium text-[#d1d7e0] transition hover:bg-[#4a535c]"
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-[#8b9bab]">
                    Quyền xem
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {VISIBILITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setVisibility(opt.value)}
                        className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                          visibility === opt.value
                            ? 'bg-[#579dff] text-[#0c1f3d]'
                            : 'bg-[#3d454c] text-[#d1d7e0] hover:bg-[#4a535c]'
                        }`}
                      >
                        {opt.short}
                      </button>
                    ))}
                  </div>

                  {/* Thành viên */}
                  <div className="mt-6">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-[#8b9bab]">
                      Thành viên
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {members.slice(0, 6).map((m) => (
                        <span
                          key={m.id}
                          title={m.name}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4b9e7a] text-xs font-bold text-white ring-2 ring-[#282e33]"
                        >
                          {m.initials || m.name?.charAt(0) || '?'}
                        </span>
                      ))}
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3d454c] text-[#9fadbc] transition hover:bg-[#4a535c]"
                        aria-label="Thêm thành viên"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Mô tả */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#d1d7e0]">
                        <AlignLeft className="h-4 w-4 text-[#8b9bab]" aria-hidden />
                        Mô tả
                      </div>
                      <span className="text-xs text-[#6b7785]">Chỉnh sửa</span>
                    </div>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      placeholder="Thêm mô tả chi tiết cho bảng…"
                      className="mt-2 w-full resize-y rounded-md border border-[#3d454c] bg-[#22272b] px-3 py-2.5 text-sm leading-relaxed text-[#e6edf3] placeholder:text-[#6b7785] focus:border-[#579dff] focus:outline-none focus:ring-1 focus:ring-[#579dff]"
                    />
                  </div>

                  {error ? (
                    <p className="mt-3 text-sm text-[#f87474]" role="alert">
                      {error}
                    </p>
                  ) : null}

                  <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-[#3d454c] pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="rounded-md px-4 py-2 text-sm font-medium text-[#c8d1db] transition hover:bg-[#3d454c]"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="rounded-md bg-[#579dff] px-4 py-2 text-sm font-semibold text-[#0c1f3d] transition hover:bg-[#6cabff] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#579dff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#282e33]"
                    >
                      Tạo bảng
                    </button>
                  </div>
                </div>
              </form>

              {/* Cột phải — nhận xét & hoạt động */}
              <aside className="flex max-h-[40vh] min-h-[200px] w-full shrink-0 flex-col border-t border-[#3d454c] bg-[#262b30] md:max-h-none md:w-[min(100%,280px)] md:border-t-0 md:border-l">
                <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#3d454c] px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#d1d7e0]">
                    <MessageSquare className="h-4 w-4 text-[#8b9bab]" aria-hidden />
                    Nhận xét và hoạt động
                  </div>
                  <button type="button" className="text-xs text-[#579dff] hover:underline">
                    Hiện chi tiết
                  </button>
                </div>
                <div className="p-4">
                  <input
                    type="text"
                    readOnly
                    placeholder="Viết bình luận…"
                    className="w-full cursor-default rounded-md border border-[#3d454c] bg-[#22272b] px-3 py-2 text-sm text-[#9fadbc] placeholder:text-[#6b7785]"
                  />
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
                  <p className="text-xs leading-relaxed text-[#8b9bab]">
                    <span className="font-semibold text-[#c8d1db]">Gợi ý:</span> Sau khi tạo bảng, bạn có thể mời
                    thành viên và theo dõi hoạt động tại đây.
                  </p>
                  <div className="mt-4 flex gap-2 text-xs text-[#9fadbc]">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#4b9e7a] text-[10px] font-bold text-white">
                      NH
                    </span>
                    <div>
                      <span className="font-semibold text-[#d1d7e0]">Bạn</span>
                      <span className="text-[#6b7785]"> đang tạo bảng mới trong không gian </span>
                      <span className="font-medium text-[#c8d1db]">
                        {selectedWorkspace?.name ?? '…'}
                      </span>
                      <span className="block mt-1 text-[#6b7785]">Vừa xong</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>

            {/* Thanh hành động nổi dưới cùng */}
            <div className="pointer-events-none flex shrink-0 justify-center border-t border-[#3d454c] bg-[#282e33]/95 px-3 py-3">
              <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-[#3d454c] bg-[#1d2125] px-2 py-1.5 shadow-lg">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-[#c8d1db] transition hover:bg-[#3d454c]"
                >
                  <Zap className="h-3.5 w-3.5" aria-hidden />
                  Power-up
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-[#c8d1db] transition hover:bg-[#3d454c]"
                >
                  <Zap className="h-3.5 w-3.5 opacity-70" aria-hidden />
                  Tự động hóa
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#0c2a4a] px-3 py-1.5 text-xs font-medium text-[#579dff] transition hover:bg-[#143a5c]"
                >
                  <MessageSquare className="h-3.5 w-3.5" aria-hidden />
                  Nhận xét
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CreateBoard;
