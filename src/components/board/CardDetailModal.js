import React from "react";
import { X } from "lucide-react";
import CardModalHeader from "./CardModalHeader";
import CardDescription from "./CardDescription";
import CardActivity from "./CardActivity";
import CardSideActions from "./CardSideActions";

/**
 * Modal chi tiết thẻ - Đã được bóc tách thành các module nhỏ:
 * - CardModalHeader: Tiêu đề và danh sách
 * - CardDescription: Phần mô tả
 * - CardActivity: Bình luận và hoạt động
 * - CardSideActions: Các nút chức năng và xóa
 */
function CardDetailModal({ card, listName, onClose, onSave, onDelete }) {
  if (!card) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-8 backdrop-blur-sm animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl rounded-2xl bg-[#323940] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 flex flex-col sm:block" 
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

        {/* 2. Main Content & Sidebar */}
        <div className="flex flex-col sm:flex-row gap-8 px-6 pb-10 pt-4">
          
          {/* Main Body (Description & Activity) */}
          <div className="min-w-0 flex-1 space-y-10">
            
            <CardDescription 
              initialDescription={card.description} 
              onSave={onSave} 
            />

            <div className="border-t border-white/5 pt-8">
              <CardActivity cardId={card.id} />
            </div>

          </div>

          {/* Sidebar Actions */}
          <CardSideActions onDelete={onDelete} />

        </div>
      </div>
    </div>
  );
}

export default CardDetailModal;
