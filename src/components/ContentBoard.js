import React, { useState } from 'react';
import { User } from 'lucide-react';
import CreateBoard from './CreateBoard';
import { BoardFormModal } from './BoardFormModal';

/** Bộ gradient xen kẽ cho nền thẻ bảng (giống phong cách Trello). */
const BOARD_COVER_CLASSES = [
  'bg-gradient-to-br from-fuchsia-600 via-violet-900 to-cyan-400',
  'bg-gradient-to-b from-purple-500 via-purple-600 to-pink-500',
  'bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600',
  'bg-gradient-to-br from-sky-600 via-indigo-700 to-violet-800',
  'bg-gradient-to-tr from-emerald-600 to-teal-900',
  'bg-gradient-to-bl from-slate-700 via-slate-900 to-blue-900',
];

function coverClassForBoard(boardId, index) {
  const key = typeof boardId === 'string' ? boardId : String(boardId);
  let hash = index;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash + key.charCodeAt(i)) % 997;
  }
  return BOARD_COVER_CLASSES[hash % BOARD_COVER_CLASSES.length];
}

function BoardCard({ board, index, onClick, onEdit, onDelete }) {
  const cover = coverClassForBoard(board.id, index);

  const handleEdit = (event) => {
    event.stopPropagation();
    if (typeof onEdit !== 'function') return;
    onEdit(board);
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    if (typeof onDelete !== 'function') return;
    const ok = window.confirm(`Xóa bảng "${board.name}"?`);
    if (!ok) return;
    onDelete();
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="group block h-full w-full rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#579dff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1d2125]"
    >
      <div className="flex h-full min-h-[120px] w-full flex-col overflow-hidden rounded-xl border border-[#3c444d] bg-[#22272d] shadow-sm transition group-hover:border-[#579dff]/50 group-hover:shadow-md">
        <div className={`min-h-0 flex-[3] ${cover}`} aria-hidden />
        <div className="flex flex-[1] shrink-0 items-center justify-between gap-2 bg-[#0d1114] px-3 py-2.5">
          <h3 className="truncate text-sm font-semibold text-white">{board.name}</h3>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleEdit}
              className="rounded px-1.5 py-0.5 text-[11px] font-medium text-[#9fbbe0] hover:bg-[#24303e] hover:text-white"
            >
              Sửa
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded px-1.5 py-0.5 text-[11px] font-medium text-[#ffb4b4] hover:bg-[#3d1f24] hover:text-white"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </button>
  );
}

const ContentBoard = ({ workspace, workspaces, onCreateBoard, onDeleteBoard, onSelectBoard, onUpdateBoard }) => {
  const boards = workspace?.boards ?? [];
  const [editBoard, setEditBoard] = useState(null);

  return (
    <section className="rounded-xl bg-[#1d2125] px-4 py-6 sm:px-6">
      <header className="mb-5 flex items-center gap-3">
        <User
          className="h-7 w-7 shrink-0 text-white"
          strokeWidth={1.75}
          aria-hidden
        />
        <h2 className="text-lg font-semibold tracking-tight text-white">Các bảng của bạn</h2>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {boards.map((board, index) => (
          <div key={board.id} className="aspect-[16/10] min-h-[120px]">
            <BoardCard
              board={board}
              index={index}
              onDelete={() => {
                if (typeof onDeleteBoard === 'function') {
                  onDeleteBoard(workspace?.id, board.id);
                }
              }}
              onEdit={() => setEditBoard(board)}
              onClick={() => {
                if (typeof onSelectBoard === 'function') {
                  onSelectBoard(board);
                }
              }}
            />
          </div>
        ))}
        <div className="aspect-[16/10] min-h-[120px]">
          <CreateBoard
            workspaces={workspaces}
            defaultWorkspaceId={workspace?.id}
            onCreateBoard={onCreateBoard}
          />
        </div>
      </div>

      <BoardFormModal
        open={Boolean(editBoard)}
        onClose={() => setEditBoard(null)}
        mode="edit"
        initialTitle={editBoard?.name || ''}
        initialVisibility={editBoard?.visibility || 'workspace'}
        initialCoverUrl={editBoard?.coverUrl || ''}
        onSubmit={({ title, visibility, coverUrl }) => {
          if (editBoard && typeof onUpdateBoard === 'function') {
            onUpdateBoard(workspace?.id, editBoard.id, {
              name: title,
              visibility,
              coverUrl,
            });
          }
        }}
      />
    </section>
  );
};

export default ContentBoard;
