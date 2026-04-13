import React from "react";

const getVisibilityLabel = (visibility) =>
  visibility === "public" ? "Công khai" : "Riêng tư";

/**
 * Một workspace row trong sidebar: tên, toggle collapse, edit/delete buttons + sub-menu links.
 */
function WorkspaceItem({
  ws,
  activeWorkspaceId,
  activeSection,
  onToggle,
  onEdit,
  onDelete,
  onNavigate,
}) {
  const isActive = activeWorkspaceId === ws.id;

  return (
    <div className="workspace-container">
      <div className="flex items-center justify-between gap-2">
        {/* Toggle button */}
        <button
          onClick={() => onToggle(ws.id)}
          className={`flex-1 flex items-center justify-between px-2 py-1.5 rounded-[3px] transition ${
            isActive ? "bg-[#3c444d] text-white" : "hover:bg-[#3c444d] text-[#dee4ea]"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-[3px] flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: ws.color || "#2f67ff" }}
            >
              {ws.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-sm font-semibold truncate w-36 text-left">{ws.name}</span>
              <span className="text-[11px] text-[#9fadbc]">{getVisibilityLabel(ws.visibility)}</span>
            </div>
          </div>
          <svg
            className={`transition-transform duration-200 ${ws.isOpen ? "rotate-180" : ""}`}
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {/* Edit / Delete */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(ws)}
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
                onDelete(ws.id);
              }
            }}
            className="rounded-[3px] p-2 text-[#9fadbc] hover:text-white hover:bg-[#7f1d1d] transition"
            aria-label={`Xóa ${ws.name}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6" /><path d="M14 11v6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Sub-menu */}
      {ws.isOpen && (
        <div className="ml-8 mt-2 space-y-1 rounded-[3px] border border-[#2f3740] bg-[#151b21] p-2">
          {[
            {
              section: "board",
              label: "Bảng",
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M3 9h18" /><path d="M9 21V9" />
                </svg>
              ),
            },
            {
              section: "members",
              label: "Thành viên",
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              ),
            },
          ].map(({ section, label, icon }) => (
            <button
              key={section}
              onClick={() => onNavigate(ws.id, section)}
              className={`w-full flex items-center gap-3 p-2 text-sm rounded-[3px] transition ${
                isActive && activeSection === section
                  ? "bg-[#3c444d] text-white"
                  : "hover:bg-[#3c444d] text-[#dee4ea]"
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default WorkspaceItem;
