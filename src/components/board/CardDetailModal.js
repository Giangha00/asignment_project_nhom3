import React, { useEffect, useState } from "react";
import { X, Plus, Tag, CheckSquare, Paperclip, Users } from "lucide-react";
import CardModalHeader from "./CardModalHeader";
import CardDescription from "./CardDescription";
import CardActivity from "./CardActivity";
import CardSideActions from "./CardSideActions";
import QuickTaskDateRangeField from "./QuickTaskDateRangeField";
import CardMembersModal from "./CardMembersModal";
import CardMembers from "./CardMembers";
import api from "../../lib/api";

const QUICK_ACTIONS = [
  { icon: <Users className="h-3.5 w-3.5" />, label: "Thành viên", action: "members" },
  { icon: <Plus className="h-3.5 w-3.5" />, label: "Thêm" },
  { icon: <Tag className="h-3.5 w-3.5" />, label: "Nhãn" },
  { icon: <CheckSquare className="h-3.5 w-3.5" />, label: "Việc cần làm" },
  { icon: <Paperclip className="h-3.5 w-3.5" />, label: "Đính kèm" },
];

function CardDetailModal({ card, listName, boardMembers = [], onClose, onSave, onDelete }) {
  const [rangeDraft, setRangeDraft] = useState({
    startAt: card?.startAt || null,
    dueAt: card?.dueAt || null,
    isValid: true,
    error: "",
  });
  const [timeSaveLoading, setTimeSaveLoading] = useState(false);
  const [timeSaveError, setTimeSaveError] = useState("");
  const [cardMembers, setCardMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);

  useEffect(() => {
    setRangeDraft({
      startAt: card?.startAt || null,
      dueAt: card?.dueAt || null,
      isValid: true,
      error: "",
    });
    setTimeSaveError("");
  }, [card?.id, card?.startAt, card?.dueAt]);

  useEffect(() => {
    if (!card?.id) return;
    const loadMembers = async () => {
      setLoadingMembers(true);
      try {
        const response = await api.get(`/api/cards/${card.id}/assignees`);
        setCardMembers(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Failed to load card members:", err);
        setCardMembers([]);
      } finally {
        setLoadingMembers(false);
      }
    };
    loadMembers();
  }, [card?.id]);

  if (!card) return null;

  const hasRangeChanged = (card.startAt || null) !== (rangeDraft.startAt || null)
    || (card.dueAt || null) !== (rangeDraft.dueAt || null);

  const handleSaveRange = async () => {
    setTimeSaveError("");
    if (!rangeDraft.isValid) {
      setTimeSaveError(rangeDraft.error || "Khoảng thời gian không hợp lệ.");
      return;
    }
    if (!hasRangeChanged) return;

    setTimeSaveLoading(true);
    try {
      await onSave(
        { startAt: rangeDraft.startAt, dueAt: rangeDraft.dueAt },
        { silent: true }
      );
    } catch (error) {
      setTimeSaveError(error?.message || "Không thể cập nhật thời gian. Vui lòng thử lại.");
    } finally {
      setTimeSaveLoading(false);
    }
  };

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
        <div className="space-y-3 px-6 py-3 border-b border-white/5">
          <div className="flex flex-wrap items-center gap-2">
            {QUICK_ACTIONS.map(({ icon, label, action }) => (
              <button
                key={label}
                type="button"
                onClick={() => action === "members" && setMembersModalOpen(true)}
                className="flex items-center gap-1.5 rounded-md bg-[#3d454c] px-3 py-1.5 text-sm text-[#dee4ea] hover:bg-[#4a535c] transition-colors"
              >
                <span className="text-[#9fadbc]">{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Inline Members Display */}
          {!loadingMembers && cardMembers.length > 0 && (
            <div className="flex items-center gap-2">
              <CardMembers
                members={cardMembers}
                onOpenModal={() => setMembersModalOpen(true)}
              />
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1">
              <QuickTaskDateRangeField
                startAt={rangeDraft.startAt}
                dueAt={rangeDraft.dueAt}
                error={timeSaveError}
                compact
                onChange={(next) => {
                  setRangeDraft(next);
                  setTimeSaveError("");
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleSaveRange}
              disabled={timeSaveLoading || !rangeDraft.isValid || !hasRangeChanged}
              className="h-9 shrink-0 rounded-md bg-[#579dff] px-3 text-sm font-semibold text-white hover:bg-[#6cabff] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {timeSaveLoading ? "Đang lưu..." : "Lưu ngày"}
            </button>
          </div>

          {(timeSaveError || rangeDraft.error) && (
            <p className="rounded-md bg-red-500/10 px-2 py-1.5 text-xs text-red-300">
              {timeSaveError || rangeDraft.error}
            </p>
          )}
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

      {/* Card Members Modal */}
      {membersModalOpen && (
        <CardMembersModal
          cardId={card.id}
          boardMembers={boardMembers}
          assignedMembers={cardMembers}
          onClose={() => setMembersModalOpen(false)}
          onMemberAdded={(newMember) => {
            setCardMembers((prev) => [...prev, newMember]);
          }}
          onMemberRemoved={(memberId) => {
            setCardMembers((prev) => prev.filter((m) => m.id !== memberId && m._id !== memberId));
          }}
        />
      )}
    </div>
  );
}

export default CardDetailModal;
