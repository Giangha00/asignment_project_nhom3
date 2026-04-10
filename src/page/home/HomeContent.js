import React, { useMemo, useState } from "react";

function HomeContent({
  workspace,
  user,
  workspaces = [],
  onCreateWorkspace,
  onCreateBoard,
  onOpenWorkspaceBoards,
  onInviteMember,
}) {
  const [workspaceName, setWorkspaceName] = useState("");
  const [inviteByWorkspace, setInviteByWorkspace] = useState({});
  const [boardByWorkspace, setBoardByWorkspace] = useState({});

  const workspaceCount = workspaces.length;
  const totalBoards = useMemo(
    () => workspaces.reduce((sum, item) => sum + (item?.boards?.length || 0), 0),
    [workspaces]
  );

  const getVisibilityLabel = (visibility) => {
    if (visibility === "public") return "Công khai";
    if (visibility === "workspace") return "Nội bộ workspace";
    return "Riêng tư";
  };

  const handleCreateWorkspaceSubmit = (event) => {
    event.preventDefault();
    const name = workspaceName.trim();
    if (!name) return;

    Promise.resolve(
      onCreateWorkspace({
        name,
        type: "default",
        description: "",
        visibility: "private",
      })
    ).then(() => {
      setWorkspaceName("");
    });
  };

  const handleCreateBoardSubmit = (event, workspaceId) => {
    event.preventDefault();
    const title = (boardByWorkspace[workspaceId] || "").trim();
    if (!title) return;

    onCreateBoard({
      title,
      workspaceId,
      visibility: "workspace",
    });

    setBoardByWorkspace((prev) => ({ ...prev, [workspaceId]: "" }));
  };

  const handleInviteSubmit = (event, workspaceId) => {
    event.preventDefault();
    const email = (inviteByWorkspace[workspaceId] || "").trim();
    if (!email) return;

    onInviteMember(workspaceId, email);
    setInviteByWorkspace((prev) => ({ ...prev, [workspaceId]: "" }));
  };

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
                    {item.description || "Workspace nay chua co mo ta. Ban co the them bang va moi thanh vien de bat dau."}
                  </p>

                  <div className="flex flex-wrap gap-3 text-sm text-[#9fadbc]">
                    <span className="rounded-full border border-[#2d3640] bg-[#10161b] px-3 py-1">
                      {members.length} thanh vien
                    </span>
                    <span className="rounded-full border border-[#2d3640] bg-[#10161b] px-3 py-1">
                      {boards.length} bang
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:w-[520px]">
                  <form
                    onSubmit={(event) => handleCreateBoardSubmit(event, item.id)}
                    className="rounded-xl border border-[#2d3640] bg-[#10161b] p-3"
                  >
                    <label className="text-xs uppercase tracking-wider text-[#8c9bab]">
                      Tao bang trong workspace
                    </label>
                    <input
                      value={boardByWorkspace[item.id] || ""}
                      onChange={(event) =>
                        setBoardByWorkspace((prev) => ({
                          ...prev,
                          [item.id]: event.target.value,
                        }))
                      }
                      placeholder="Ten bang moi"
                      className="mt-2 w-full rounded-lg border border-[#2d3640] bg-[#0f1720] px-3 py-2 text-sm text-white outline-none"
                    />
                    <button
                      type="submit"
                      className="mt-2 w-full rounded-lg bg-[#579dff] px-3 py-2 text-sm font-semibold text-[#1d2125] hover:bg-[#7fbfff]"
                    >
                      Tao bang
                    </button>
                  </form>

                  <form
                    onSubmit={(event) => handleInviteSubmit(event, item.id)}
                    className="rounded-xl border border-[#2d3640] bg-[#10161b] p-3"
                  >
                    <label className="text-xs uppercase tracking-wider text-[#8c9bab]">
                      Moi thanh vien
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
                      className="mt-2 w-full rounded-lg border border-[#2d3640] bg-[#0f1720] px-3 py-2 text-sm text-white outline-none"
                    />
                    <button
                      type="submit"
                      className="mt-2 w-full rounded-lg border border-[#3c444d] bg-[#151b21] px-3 py-2 text-sm font-semibold text-[#d1d7e0] hover:border-[#579dff] hover:text-white"
                    >
                      Gui loi moi
                    </button>
                  </form>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Danh sach bang</h3>
                  <span className="text-sm text-[#8c9bab]">Mo nhanh bang ngay tu man home</span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {boards.length > 0 ? (
                    boards.map((board) => (
                      <button
                        type="button"
                        key={board.id}
                        onClick={() => {
                          if (typeof onOpenWorkspaceBoards === "function") {
                            onOpenWorkspaceBoards(item.id);
                          }
                        }}
                        className="group rounded-xl border border-[#2d3640] bg-[#10161b] p-4 transition hover:border-[#579dff]"
                      >
                        <div className="text-sm font-semibold text-white group-hover:text-[#a7d0ff]">
                          {board.name}
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-[#8c9bab]">
                          {board.description || "Chua co mo ta cho bang nay."}
                        </p>
                        <div className="mt-3 text-xs font-medium text-[#579dff]">Mo danh sach board</div>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#3c444d] bg-[#10161b] p-4 text-sm text-[#8c9bab]">
                      Workspace nay chua co bang nao. Hay tao bang moi de no xuat hien tai day.
                    </div>
                  )}
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
