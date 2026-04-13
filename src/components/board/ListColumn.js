import React from "react";
import { ArrowLeftRight, MoreHorizontal, Plus, SquareArrowOutUpRight, X } from "lucide-react";
import CardItem from "./CardItem";

/**
 * Một cột list với header, danh sách cards và composer thêm thẻ.
 */
function ListColumn({
  list,
  draggingCardId,
  dragOverCardId,
  dragOverListId,
  addingForListId,
  composerTitle,
  setComposerTitle,
  onCardDragStart,
  onCardDragEnd,
  onCardDragOver,
  onCardDrop,
  onListDragOver,
  onListDragLeave,
  onListDrop,
  onCardClick,
  onOpenComposer,
  onCloseComposer,
  onSubmitCard,
}) {
  const isComposing = addingForListId === list.id;
  const listCards = list.cards || [];
  const showEmptyHint = listCards.length === 0 && !isComposing;

  return (
    <div className="flex w-[272px] shrink-0 flex-col max-h-[calc(100vh-220px)] rounded-xl bg-[#101204]/85 backdrop-blur-sm">
      {/* List header */}
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <h2 className="truncate text-sm font-semibold text-[#d1d7e0]">{list.name}</h2>
        <div className="flex shrink-0 items-center gap-0.5">
          <button type="button" className="rounded p-1 text-[#9fadbc] hover:bg-white/10" aria-label="Di chuyển danh sách">
            <ArrowLeftRight className="h-4 w-4" />
          </button>
          <button type="button" className="rounded p-1 text-[#9fadbc] hover:bg-white/10">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Cards area */}
      <div
        className={`min-h-0 flex-1 space-y-2 overflow-y-auto px-2 pb-2 transition-colors ${
          dragOverListId === list.id && draggingCardId
            ? "rounded-lg bg-[#1a3a5c]/40 ring-2 ring-[#579dff] ring-inset"
            : ""
        }`}
        onDragOver={(e) => onListDragOver(e, list.id)}
        onDragLeave={onListDragLeave}
        onDrop={(e) => onListDrop(e, list.id)}
      >
        {listCards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            listId={list.id}
            draggingCardId={draggingCardId}
            dragOverCardId={dragOverCardId}
            onDragStart={onCardDragStart}
            onDragEnd={onCardDragEnd}
            onDragOver={(cardId, listId) => onCardDragOver(cardId, listId)}
            onDrop={onCardDrop}
            onClick={onCardClick}
          />
        ))}

        {showEmptyHint && (
          <p className={`min-h-[72px] rounded-lg border border-dashed px-2 py-6 text-center text-xs ${
            dragOverListId === list.id && draggingCardId
              ? "border-[#579dff]/60 bg-[#1a3a5c]/25 text-[#9fadbc]"
              : "border-white/10 text-[#6b7785]"
          }`}>
            Kéo thẻ vào đây hoặc thêm thẻ mới
          </p>
        )}
      </div>

      {/* Add card composer */}
      {isComposing ? (
        <div className="mx-2 mb-2 space-y-2">
          <textarea
            value={composerTitle}
            onChange={(e) => setComposerTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmitCard(list.id); }
            }}
            rows={3}
            placeholder="Nhập tiêu đề thẻ..."
            autoFocus
            className="w-full resize-none rounded-lg border border-[#3c444d] bg-[#22272b] px-3 py-2 text-sm text-[#d1d7e0] placeholder:text-[#6b7785] shadow-sm outline-none focus:border-[#579dff] focus:ring-1 focus:ring-[#579dff]"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => onSubmitCard(list.id)} className="rounded-md bg-[#579dff] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#6cabff]">
              Thêm thẻ
            </button>
            <button type="button" onClick={onCloseComposer} className="rounded-md p-1.5 text-[#c8d1db] hover:bg-white/10" aria-label="Hủy">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-2 mb-2 flex items-center gap-1">
          <button type="button" onClick={() => onOpenComposer(list.id)} className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-[#9fadbc] hover:bg-white/10">
            <Plus className="h-4 w-4 shrink-0" />
            Thêm thẻ
          </button>
          <button type="button" className="shrink-0 rounded-lg p-2 text-[#9fadbc] hover:bg-white/10" aria-label="Mẫu thẻ">
            <SquareArrowOutUpRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default ListColumn;
