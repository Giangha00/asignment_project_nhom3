import React, { useState } from "react";

function CardModalHeader({ title, listName, onSave, onCancelTitle }) {
  const [isEditing, setIsEditing] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);

  const handleCommit = () => {
    setIsEditing(false);
    const trimmed = localTitle.trim();
    if (!trimmed || trimmed === title) {
      setLocalTitle(title);
      return;
    }
    onSave({ title: trimmed });
  };

  return (
    <div className="px-6 pt-6 pb-2">
      {isEditing ? (
        <textarea
          autoFocus
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          onBlur={handleCommit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleCommit();
            }
            if (e.key === "Escape") {
              setLocalTitle(title);
              setIsEditing(false);
            }
          }}
          rows={2}
          className="w-full resize-none rounded-lg bg-[#1d2125] px-3 py-2 text-xl font-semibold text-white outline-none focus:ring-2 focus:ring-[#579dff]"
        />
      ) : (
        <h2
          className="cursor-text rounded-lg px-3 py-2 text-xl font-semibold text-white hover:bg-white/5 transition-colors"
          onClick={() => setIsEditing(true)}
        >
          {title}
        </h2>
      )}
      <p className="mt-1 px-3 text-xs text-[#8c9bab]">
        trong danh sách <span className="font-medium text-[#9fadbc]">{listName}</span>
      </p>
    </div>
  );
}

export default CardModalHeader;
