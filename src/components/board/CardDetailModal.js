import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, Plus, Tag, CheckSquare, Users } from "lucide-react";
import CardModalHeader from "./CardModalHeader";
import CardDescription from "./CardDescription";
import CardActivity from "./CardActivity";
import CardSideActions from "./CardSideActions";
import QuickTaskDateRangeField from "./QuickTaskDateRangeField";
import CardMembersModal from "./CardMembersModal";
import CardMembers from "./CardMembers";
import api from "../../lib/api";
import { getPriorityMeta, normalizePriority, PRIORITY_OPTIONS } from "../../lib/cardPriority";

const QUICK_ACTIONS = [
  { icon: <Users className="h-3.5 w-3.5" />, label: "Thành viên", action: "members" },
  { icon: <Tag className="h-3.5 w-3.5" />, label: "Nhãn", action: "labels" },
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
  const [labelsPanelOpen, setLabelsPanelOpen] = useState(false);
  const [labelSearch, setLabelSearch] = useState("");
  const [priorityDraft, setPriorityDraft] = useState(normalizePriority(card?.priority));
  const [prioritySaveLoading, setPrioritySaveLoading] = useState(false);
  const [prioritySaveError, setPrioritySaveError] = useState("");
  const [prioritySaveSuccess, setPrioritySaveSuccess] = useState("");
  const labelsPanelRef = useRef(null);

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
    setPriorityDraft(normalizePriority(card?.priority));
    setPrioritySaveError("");
    setPrioritySaveSuccess("");
    setLabelsPanelOpen(false);
    setLabelSearch("");
  }, [card?.id, card?.priority]);

  useEffect(() => {
    if (!labelsPanelOpen) return undefined;
    const handleOutsideClick = (event) => {
      if (labelsPanelRef.current && !labelsPanelRef.current.contains(event.target)) {
        setLabelsPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [labelsPanelOpen]);

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

  const filteredPriorityOptions = useMemo(() => {
    const keyword = labelSearch.trim().toLowerCase();
    if (!keyword) return PRIORITY_OPTIONS;
    return PRIORITY_OPTIONS.filter((option) => {
      const haystack = `${option.label} ${option.vietnamese}`.toLowerCase();
      return haystack.includes(keyword);
    });
  }, [labelSearch]);

  if (!card) return null;

  const hasRangeChanged = (card.startAt || null) !== (rangeDraft.startAt || null)
    || (card.dueAt || null) !== (rangeDraft.dueAt || null);
  const normalizedPriority = normalizePriority(card.priority);
  const priorityMeta = getPriorityMeta(priorityDraft);

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

  const handleSavePriority = async (nextPriority) => {
    setPrioritySaveError("");
    setPrioritySaveSuccess("");
    const normalizedNextPriority = normalizePriority(nextPriority);
    setPriorityDraft(normalizedNextPriority);

    if (normalizedPriority === normalizedNextPriority) return;

    setPrioritySaveLoading(true);
    try {
      await onSave({ priority: normalizedNextPriority }, { silent: true });
      setPrioritySaveSuccess("Cập nhật priority thành công.");
    } catch (error) {
      setPriorityDraft(normalizedPriority);
      setPrioritySaveError(error?.message || "Không thể cập nhật priority. Vui lòng thử lại.");
    } finally {
      setPrioritySaveLoading(false);
    }
  };

  const handleQuickActionClick = (action) => {
    if (action === "members") {
      setMembersModalOpen(true);
      return;
    }
    if (action === "labels") {
      setLabelsPanelOpen((prev) => !prev);
      setLabelSearch("");
    }
  };

  const getOptionRowClass = (value) => {
    if (value === "low") return "bg-emerald-700 text-emerald-100";
    if (value === "medium") return "bg-blue-700 text-blue-100";
    if (value === "high") return "bg-amber-700 text-amber-100";
    if (value === "urgent") return "bg-red-700 text-red-100";
    return "bg-slate-700 text-slate-100";
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-8 backdrop-blur-sm animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <div 
        className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col rounded-2xl border border-white/5 bg-[#323940] shadow-[0_20px_50px_rgba(0,0,0,0.5)]" 
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
          <div className="relative flex flex-wrap items-center gap-2" ref={labelsPanelRef}>
            {QUICK_ACTIONS.map(({ icon, label, action }) => (
              <button
                key={label}
                type="button"
                onClick={() => handleQuickActionClick(action)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
                  action === "labels" && labelsPanelOpen
                    ? "bg-[#1e4d88] text-[#dbe9ff]"
                    : "bg-[#3d454c] text-[#dee4ea] hover:bg-[#4a535c]"
                }`}
              >
                <span className="text-[#9fadbc]">{icon}</span>
                <span>{label}</span>
              </button>
            ))}

            {labelsPanelOpen && (
              <div className="absolute left-0 top-full z-30 mt-2 w-[360px] max-w-[92vw] rounded-xl border border-white/10 bg-[#2c3138] p-3 shadow-2xl">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-[#dfe7ef]">Nhãn</h4>
                  <button
                    type="button"
                    onClick={() => setLabelsPanelOpen(false)}
                    className="rounded p-1 text-[#9fadbc] hover:bg-white/10"
                    aria-label="Đóng nhãn"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <input
                  type="text"
                  value={labelSearch}
                  onChange={(event) => setLabelSearch(event.target.value)}
                  placeholder="Tìm nhãn..."
                  className="mb-3 h-10 w-full rounded-md border border-[#4f5966] bg-[#22272b] px-3 text-sm text-[#d1d7e0] placeholder:text-[#8c9bab] outline-none focus:border-[#579dff]"
                />

                <p className="mb-2 text-sm font-semibold text-[#b8c4d1]">Nhãn</p>
                <div className="space-y-2">
                  {filteredPriorityOptions.map((option) => {
                    const checked = priorityDraft === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSavePriority(option.value)}
                        disabled={prioritySaveLoading}
                        className="flex w-full items-center gap-2 rounded-md text-left disabled:opacity-60"
                        aria-label={`Chọn nhãn priority ${option.label}`}
                      >
                        <span className="flex h-4 w-4 items-center justify-center rounded border border-[#9fadbc] bg-transparent text-[10px] text-white">
                          {checked ? "✓" : ""}
                        </span>
                        <span className={`min-w-0 flex-1 rounded px-3 py-2 font-semibold ${getOptionRowClass(option.value)}`}>
                          {option.vietnamese}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {filteredPriorityOptions.length === 0 && (
                  <p className="mt-3 text-sm text-[#8c9bab]">Không tìm thấy nhãn phù hợp.</p>
                )}

                <p className={`mt-3 inline-flex rounded px-2 py-1 text-xs font-semibold ${priorityMeta.chipClass}`} title={priorityMeta.description}>
                  Priority hiện tại: {priorityMeta.label}
                </p>
              </div>
            )}
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

          {prioritySaveError && (
            <p className="rounded-md bg-red-500/10 px-2 py-1.5 text-xs text-red-300">
              {prioritySaveError}
            </p>
          )}

          {prioritySaveSuccess && (
            <p className="rounded-md bg-emerald-500/10 px-2 py-1.5 text-xs text-emerald-300">
              {prioritySaveSuccess}
            </p>
          )}
        </div>

        {/* 3. Two-column: Description (left) + Activity (right) */}
        <div className="min-h-0 flex flex-1 flex-col gap-6 overflow-y-auto px-6 pb-10 pt-5 sm:flex-row sm:overflow-hidden">
          
          {/* Left Column: Description */}
          <div className="min-h-0 min-w-0 flex-1 space-y-4 sm:overflow-y-auto sm:pr-3">
            <div>
              <p className="mb-2 text-sm font-semibold text-[#b8c4d1]">Nhãn</p>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex max-w-full items-center rounded-md px-3 py-2 text-sm font-semibold ${getOptionRowClass(priorityDraft)}`}
                  title={priorityMeta.description}
                >
                  <span className="truncate">{priorityMeta.label}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setLabelsPanelOpen(true)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white/10 text-[#c9d3df] hover:bg-white/15"
                  aria-label="Mở nhãn"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            <CardDescription 
              initialDescription={card.description} 
              onSave={onSave} 
            />
          </div>

          {/* Right Column: Activity/Comments only */}
          <div className="shrink-0 border-white/10 sm:w-80 sm:border-l sm:pl-4">
            <div className="flex flex-col gap-4">
            <CardActivity cardId={card.id} />
            <CardSideActions onDelete={onDelete} />
            </div>
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
