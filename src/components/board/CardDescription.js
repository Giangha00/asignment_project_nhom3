import React, { useState, useEffect } from "react";
import { AlignLeft, X } from "lucide-react";

function CardDescription({ initialDescription, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(initialDescription || "");

  useEffect(() => {
    setDescription(initialDescription || "");
  }, [initialDescription]);

  const handleSave = () => {
    setIsEditing(false);
    if (description !== (initialDescription || "")) {
      onSave({ description });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setDescription(initialDescription || "");
  };

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-3 flex items-center gap-2">
        <AlignLeft className="h-4 w-4 shrink-0 text-[#9fadbc]" />
        <h3 className="text-sm font-semibold text-[#d1d7e0]">Mô tả</h3>
      </div>
      
      {isEditing ? (
        <div className="animate-in fade-in duration-200">
          <textarea
            autoFocus
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Thêm mô tả chi tiết hơn..."
            className="w-full resize-none rounded-lg bg-[#22272b] px-3 py-2 text-sm text-[#d1d7e0] placeholder:text-[#6b7785] outline-none focus:ring-2 focus:ring-[#579dff] transition-all"
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-md bg-[#579dff] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#6cabff] transition-colors"
            >
              Lưu
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-md p-1.5 text-[#9fadbc] hover:bg-white/10 transition-colors"
              aria-label="Hủy"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="group min-h-[80px] cursor-text rounded-lg bg-[#22272b]/80 px-3 py-2.5 text-sm hover:bg-[#22272b] transition-all border border-transparent hover:border-white/5"
        >
          {description ? (
            <span className="whitespace-pre-wrap text-[#d1d7e0]">{description}</span>
          ) : (
            <span className="text-[#6b7785] group-hover:text-[#9fadbc] transition-colors">
              Thêm mô tả chi tiết hơn...
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default CardDescription;
