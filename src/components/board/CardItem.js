import React from "react";

/**
 * Một thẻ (card) trong list với drag-and-drop support.
 */
function CardItem({ card, listId, draggingCardId, dragOverCardId, onDragStart, onDragEnd, onDragOver, onDrop, onClick }) {
  const isDragging = draggingCardId === card.id;
  const isDragOver = dragOverCardId === card.id;

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
    </div>
  );
}

export default CardItem;
