const PRIORITY_META = {
  low: {
    value: "low",
    label: "Chưa cần gấp",
    vietnamese: "Chưa cần gấp",
    description: "Mức ưu tiên thấp, có thể xử lý sau.",
    cardClass: "bg-emerald-700 text-emerald-100",
    chipClass: "bg-slate-500/20 text-slate-200 border border-slate-400/30",
  },
  medium: {
    value: "medium",
    label: "Bình thường",
    vietnamese: "Bình thường",
    description: "Mức ưu tiên trung bình, cần theo dõi thường xuyên.",
    cardClass: "bg-yellow-700 text-yellow-100",
    chipClass: "bg-blue-500/20 text-blue-200 border border-blue-400/30",
  },
  high: {
    value: "high",
    label: "Quan trọng",
    vietnamese: "Quan trọng",
    description: "Mức ưu tiên cao, nên xử lý sớm.",
    cardClass: "bg-orange-700 text-orange-100",
    chipClass: "bg-amber-500/20 text-amber-200 border border-amber-400/30",
  },
  urgent: {
    value: "urgent",
    label: "Rất quan trọng",
    vietnamese: "Rất quan trọng",
    description: "Mức ưu tiên khẩn cấp, cần xử lý ngay.",
    cardClass: "bg-red-700 text-red-100",
    chipClass: "bg-red-500/20 text-red-200 border border-red-400/30",
  },
};

export const DEFAULT_PRIORITY = "medium";

export const PRIORITY_OPTIONS = Object.values(PRIORITY_META).map(({ value, label, vietnamese }) => ({
  value,
  label,
  vietnamese,
}));

export function normalizePriority(value) {
  const normalized = String(value || "").toLowerCase();
  return PRIORITY_META[normalized] ? normalized : DEFAULT_PRIORITY;
}

export function getPriorityMeta(value) {
  const normalized = normalizePriority(value);
  return PRIORITY_META[normalized];
}