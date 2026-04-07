import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import CreateBoard from './CreateBoard';

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

function BoardCard({ workspaceId, board, index }) {
  const cover = coverClassForBoard(board.id, index);
  const to = `/workspace/${encodeURIComponent(workspaceId)}/board/${encodeURIComponent(board.id)}`;

  return (
    <Link
      to={to}
      className="group block h-full w-full rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#579dff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1d2125]"
    >
      <div className="flex h-full min-h-[120px] w-full flex-col overflow-hidden rounded-xl border border-[#3c444d] bg-[#22272d] shadow-sm transition group-hover:border-[#579dff]/50 group-hover:shadow-md">
        <div className={`min-h-0 flex-[3] ${cover}`} aria-hidden />
        <div className="flex flex-[1] shrink-0 items-center bg-[#0d1114] px-3 py-2.5">
          <h3 className="truncate text-sm font-semibold text-white">{board.name}</h3>
        </div>
      </div>
    </Link>
  );
}

const ContentBoard = ({ workspace, workspaces, onCreateBoard }) => {
  const boards = workspace?.boards ?? [];

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
            <BoardCard workspaceId={workspace?.id} board={board} index={index} />
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
    </section>
  );
};

export default ContentBoard;
