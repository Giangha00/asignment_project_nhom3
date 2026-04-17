import React from "react";
import { getPriorityMeta } from "../../lib/cardPriority";

/**
 * Một thẻ (card) trong list với drag-and-drop support.
 */
function CardItem({ card, listId, draggingCardId, dragOverCardId, onDragStart, onDragEnd, onDragOver, onDrop, onClick }) {
  const isDragging = draggingCardId === card.id;
  const isDragOver = dragOverCardId === card.id;
  const priorityMeta = getPriorityMeta(card.priority);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, listId, card)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "move";
        onDragOver(card.id, listId);
      }}
      onDrop={(e) => onDrop(e, listId, card)}
      aria-grabbed={isDragging}
      onClick={() => onClick(card)}
      className={`cursor-pointer rounded-lg bg-[#22272b] px-3 py-2.5 text-sm text-[#d1d7e0] shadow-sm transition-colors ${
        isDragging
          ? "cursor-grabbing opacity-40"
          : isDragOver
          ? "ring-2 ring-[#579dff] ring-inset bg-[#2c333a]"
          : "hover:bg-[#2c333a]"
      }`}
    >
      <div className="mb-2 flex items-center">
        <span
          className={`inline-flex max-w-full items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${priorityMeta.cardClass}`}
          title={`Ưu tiên ${priorityMeta.label}: ${priorityMeta.description}`}
        >
          <span className="truncate">{priorityMeta.label}</span>
        </span>
      </div>
      <span className="block font-medium">{card.title}</span>
    </div>
  );
}

export default CardItem;
