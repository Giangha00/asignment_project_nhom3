import { backgroundStyle } from "../boardBackgrounds";

export function BoardCard({ board, onToggleStar, onOpen }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen?.(board)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen?.(board);
        }
      }}
      className="group relative h-[96px] w-full cursor-pointer overflow-hidden rounded-[3px] shadow-sm ring-1 ring-black/8 transition hover:brightness-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0c66e4]"
      style={backgroundStyle(board.background)}
    >
      <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
      <div className="relative flex h-full flex-col justify-between p-3">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar(board._id);
            }}
            className={`rounded p-0.5 text-white/90 transition hover:bg-black/15 ${
              board.starred ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
            aria-label={board.starred ? "Unstar board" : "Star board"}
          >
            <StarIcon filled={board.starred} />
          </button>
        </div>
        <h3 className="text-[15px] font-semibold leading-tight text-white drop-shadow-sm">
          {board.title || board.name}
        </h3>
      </div>
    </div>
  );
}

function StarIcon({ filled }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.5l2.4 5.5 6 .6-4.5 4 1.4 6-5.3-3.2L6.9 20l1.4-6L3.8 9.6l6-.6L12 3.5z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        className={filled ? "text-amber-300" : "text-white"}
      />
    </svg>
  );
}
