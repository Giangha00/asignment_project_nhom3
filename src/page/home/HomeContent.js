import React from "react";
import CreateBoard from "../../components/CreateBoard";
import { useHomeContent } from "../../hooks/useHomeContent";

function HomeContent({
  workspace,
  user,
  workspaces = [],
  onCreateWorkspace,
  onCreateBoard,
  onOpenWorkspaceBoards,
  onOpenBoardDetail,
  onInviteMember,
}) {
  const {
    inviteByWorkspace,
    setInviteByWorkspace,
    getVisibilityLabel,
    handleInviteSubmit,
  } = useHomeContent({ workspaces, onCreateWorkspace, onCreateBoard, onInviteMember });

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="space-y-4">
        {workspaces.map((item) => {
          const boards = Array.isArray(item.boards) ? item.boards : [];
          const members = Array.isArray(item.members) ? item.members : [];

          return (
            <article
              key={item.id}
              className="rounded-[24px] border border-[#30363f] bg-[#181f25] p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className="h-7 w-7 rounded-md border border-white/10"
                      style={{ backgroundColor: item.color?.replace("bg-[", "").replace("]", "") || "#2f67ff" }}
                      aria-hidden
                    />
                    <h2 className="text-2xl font-bold text-white">{item.name}</h2>
                    <span className="inline-flex items-center rounded-full border border-[#3c444d] bg-[#10161b] px-2.5 py-1 text-xs text-[#9fadbc]">
                      {getVisibilityLabel(item.visibility)}
                    </span>
                  </div>

                  <p className="max-w-2xl text-sm text-[#8c9bab]">
                    {item.description || "Workspace này chưa có mô tả."}
                  </p>

                  <div className="flex flex-wrap gap-3 text-sm text-[#9fadbc]">
                    <span className="rounded-full border border-[#2d3640] bg-[#10161b] px-3 py-1">
                      {members.length} thành viên
                    </span>
                    <span className="rounded-full border border-[#2d3640] bg-[#10161b] px-3 py-1">
                      {boards.length} bảng
                    </span>
                  </div>
                </div>

                {/* Invite member form */}
                <form
                  onSubmit={(event) => handleInviteSubmit(event, item.id)}
                  className="rounded-xl border border-[#2d3640] bg-[#10161b] p-3 lg:w-64"
                >
                  <label className="text-xs uppercase tracking-wider text-[#8c9bab]">
                    Mời thành viên
                  </label>
                  <input
                    value={inviteByWorkspace[item.id] || ""}
                    onChange={(event) =>
                      setInviteByWorkspace((prev) => ({
                        ...prev,
                        [item.id]: event.target.value,
                      }))
                    }
                    placeholder="email@example.com"
                    type="email"
                    className="mt-2 w-full rounded-lg border border-[#2d3640] bg-[#0f1720] px-3 py-2 text-sm text-white outline-none"
                  />
                  <button
                    type="submit"
                    className="mt-2 w-full rounded-lg border border-[#3c444d] bg-[#151b21] px-3 py-2 text-sm font-semibold text-[#d1d7e0] hover:border-[#579dff] hover:text-white"
                  >
                    Gửi lời mời
                  </button>
                </form>
              </div>

              {/* Board list */}
              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Danh sách bảng</h3>
                  <span className="text-sm text-[#8c9bab]">Mở nhanh bảng ngay từ màn home</span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {boards.map((board) => (
                    <button
                      type="button"
                      key={board.id}
                      onClick={() => {
                        if (typeof onOpenBoardDetail === "function") {
                          onOpenBoardDetail(item.id, board);
                        } else if (typeof onOpenWorkspaceBoards === "function") {
                          onOpenWorkspaceBoards(item.id);
                        }
                      }}
                      className="group rounded-xl border border-[#2d3640] bg-[#10161b] p-4 transition hover:border-[#579dff] text-left"
                    >
                      <div className="text-sm font-semibold text-white group-hover:text-[#a7d0ff]">
                        {board.name}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-[#8c9bab]">
                        {board.description || "Chưa có mô tả cho bảng này."}
                      </p>
                      <div className="mt-3 text-xs font-medium text-[#579dff]">Mở board</div>
                    </button>
                  ))}

                  {/* Dùng lại component CreateBoard thay cho inline button tạo bảng */}
                  <div className="min-h-[100px]">
                    <CreateBoard
                      workspaces={workspaces}
                      defaultWorkspaceId={item.id}
                      onCreateBoard={onCreateBoard}
                    />
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

export default HomeContent;
