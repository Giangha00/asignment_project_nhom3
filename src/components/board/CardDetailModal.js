import React from "react";
import { X, Plus, Tag, Clock, CheckSquare, Paperclip } from "lucide-react";
import CardModalHeader from "./CardModalHeader";
import CardDescription from "./CardDescription";
import CardActivity from "./CardActivity";
import CardSideActions from "./CardSideActions";

const QUICK_ACTIONS = [
  { icon: <Plus className="h-3.5 w-3.5" />, label: "Thêm" },
  { icon: <Tag className="h-3.5 w-3.5" />, label: "Nhãn" },
  { icon: <Clock className="h-3.5 w-3.5" />, label: "Ngày" },
  { icon: <CheckSquare className="h-3.5 w-3.5" />, label: "Việc cần làm" },
  { icon: <Paperclip className="h-3.5 w-3.5" />, label: "Đính kèm" },
];

function CardDetailModal({ card, listName, onClose, onSave, onDelete }) {
  if (!card) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-8 backdrop-blur-sm animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl rounded-2xl bg-[#323940] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          type="button" 
          onClick={onClose} 
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-[#9fadbc] hover:bg-white/10 hover:text-white transition-all" 
          aria-label="Đóng"
        >
          <X className="h-5 w-5" />
        </button>

        {/* 1. Header Section */}
        <CardModalHeader 
          title={card.title} 
          listName={listName} 
          onSave={onSave} 
        />

        {/* 2. Inline Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-b border-white/5">
          {QUICK_ACTIONS.map(({ icon, label }) => (
            <button
              key={label}
              type="button"
              className="flex items-center gap-1.5 rounded-md bg-[#3d454c] px-3 py-1.5 text-sm text-[#dee4ea] hover:bg-[#4a535c] transition-colors"
            >
              <span className="text-[#9fadbc]">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* 3. Two-column: Description (left) + Activity (right) */}
        <div className="flex flex-col sm:flex-row gap-6 px-6 pb-10 pt-5">
          
          {/* Left Column: Description */}
          <div className="min-w-0 flex-1">
            <CardDescription 
              initialDescription={card.description} 
              onSave={onSave} 
            />
          </div>

          {/* Right Column: Activity/Comments only */}
          <div className="flex flex-col gap-4 sm:w-80 shrink-0">
            <CardActivity cardId={card.id} />
            <CardSideActions onDelete={onDelete} />
          </div>

        </div>
      </div>
    </div>
  );
}

export default CardDetailModal;
