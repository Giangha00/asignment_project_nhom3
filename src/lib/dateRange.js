function isValidDate(date) {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

export function parseIsoDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return isValidDate(date) ? date : null;
}

function pad(number) {
  return String(number).padStart(2, "0");
}

export function toLocalDateTimeInputValue(value) {
  const date = parseIsoDate(value);
  if (!date) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function localDateTimeInputToIso(value) {
  if (!value) return null;
  const date = new Date(value);
  return isValidDate(date) ? date.toISOString() : null;
}

export function validateDateRange(startAt, dueAt) {
  const start = parseIsoDate(startAt);
  const due = parseIsoDate(dueAt);

  if (!start && !due) {
    return { status: "empty", isValid: true, error: "" };
  }
  if (!start || !due) {
    return { status: "partial", isValid: true, error: "" };
  }
  if (start.getTime() > due.getTime()) {
    return {
      status: "full",
      isValid: false,
      error: "Thời gian bắt đầu phải trước hoặc bằng thời gian kết thúc.",
    };
  }
  return { status: "full", isValid: true, error: "" };
}

function formatDateTime(value, locale = "vi-VN") {
  const date = parseIsoDate(value);
  if (!date) return "";
  try {
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

export function formatDateRangeCompact(startAt, dueAt, locale = "vi-VN") {
  const validation = validateDateRange(startAt, dueAt);
  if (validation.status === "empty") return "Ngày";
  if (validation.status === "partial") {
    const only = formatDateTime(startAt || dueAt, locale);
    return `Đã chọn một phần: ${only}`;
  }

  const startText = formatDateTime(startAt, locale);
  const dueText = formatDateTime(dueAt, locale);

  if (!startText && !dueText) return "Ngày";
  if (!startText || !dueText) return `Đã chọn một phần: ${startText || dueText}`;
  return `${startText} - ${dueText}`;
}

export function formatDateRangeFull(startAt, dueAt, locale = "vi-VN") {
  const validation = validateDateRange(startAt, dueAt);
  if (validation.status === "empty") return "Ngày";
  if (validation.status === "partial") {
    const only = formatDateTime(startAt || dueAt, locale);
    return `Đã chọn một phần (${only})`;
  }
  const startText = formatDateTime(startAt, locale);
  const dueText = formatDateTime(dueAt, locale);
  return `Bắt đầu: ${startText} | Kết thúc: ${dueText}`;
}

export function toIsoRangeFromLocalInputs(startInputValue, dueInputValue) {
  return {
    startAt: localDateTimeInputToIso(startInputValue),
    dueAt: localDateTimeInputToIso(dueInputValue),
  };
}
