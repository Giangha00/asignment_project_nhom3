import React from "react";
import { CalendarClock } from "lucide-react";
import { formatDateRangeCompact, formatDateRangeFull, validateDateRange } from "../../lib/dateRange";

/**
 * Một thẻ (card) trong list với drag-and-drop support.
 */
function CardItem({ card, listId, draggingCardId, dragOverCardId, onDragStart, onDragEnd, onDragOver, onDrop, onClick }) {
  const isDragging = draggingCardId === card.id;
  const isDragOver = dragOverCardId === card.id;
  const rangeStatus = validateDateRange(card.startAt, card.dueAt);
  const hasAnyDate = rangeStatus.status !== "empty";
  const dateText = formatDateRangeCompact(card.startAt, card.dueAt);
  const dateTooltip = formatDateRangeFull(card.startAt, card.dueAt);

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
      <span className="block font-medium">{card.title}</span>
      {hasAnyDate && (
        <div
          className={`mt-2 inline-flex max-w-full items-center gap-1 rounded-md px-2 py-1 text-[11px] ${
            rangeStatus.isValid ? "bg-[#2f3b4a] text-[#b8cbdf]" : "bg-red-500/15 text-red-300"
          }`}
          title={dateTooltip}
        >
          <CalendarClock className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{dateText}</span>
        </div>
      )}
    </div>
  );
}

export default CardItem;
