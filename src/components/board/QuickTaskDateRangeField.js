import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarClock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react";
import {
  formatDateRangeCompact,
  formatDateRangeFull,
  localDateTimeInputToIso,
  parseIsoDate,
  toIsoRangeFromLocalInputs,
  toLocalDateTimeInputValue,
  validateDateRange,
} from "../../lib/dateRange";

const WEEKDAYS = ["Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "CN"];

function pad(value) {
  return String(value).padStart(2, "0");
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function addYears(date, amount) {
  return new Date(date.getFullYear() + amount, date.getMonth(), 1);
}

function monthTitle(date) {
  return `Tháng ${date.getMonth() + 1} ${date.getFullYear()}`;
}

function toDatePart(value) {
  if (!value) return "";
  const [datePart] = String(value).split("T");
  return datePart || "";
}

function toTimePart(value) {
  if (!value) return "";
  const [, timePart] = String(value).split("T");
  return (timePart || "").slice(0, 5);
}

function defaultTimePart() {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function mergeDateAndTime(datePart, timePart) {
  if (!datePart) return "";
  return `${datePart}T${timePart || "00:00"}`;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getCalendarDays(monthDate) {
  const firstDay = startOfMonth(monthDate);
  const offset = (firstDay.getDay() + 6) % 7;
  const firstVisible = new Date(firstDay);
  firstVisible.setDate(firstVisible.getDate() - offset);

  return Array.from({ length: 42 }, (_, idx) => {
    const date = new Date(firstVisible);
    date.setDate(firstVisible.getDate() + idx);
    return {
      date,
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      inCurrentMonth: date.getMonth() === monthDate.getMonth(),
    };
  });
}

function statusLabel(status) {
  if (status === "full") return "Đã chọn đầy đủ";
  if (status === "partial") return "Đã chọn một phần";
  return "Chưa chọn ngày";
}

function statusClass(status) {
  if (status === "full") return "bg-emerald-500/15 text-emerald-300";
  if (status === "partial") return "bg-amber-500/15 text-amber-300";
  return "bg-white/10 text-[#9fadbc]";
}

function QuickTaskDateRangeField({
  startAt,
  dueAt,
  onChange,
  error,
  compact = true,
  className = "",
}) {
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [didOpen, setDidOpen] = useState(false);
  const [startInput, setStartInput] = useState(toLocalDateTimeInputValue(startAt));
  const [dueInput, setDueInput] = useState(toLocalDateTimeInputValue(dueAt));
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));
  const [repeatRule, setRepeatRule] = useState("Không bao giờ");
  const [remindRule, setRemindRule] = useState("1 Ngày trước");

  useEffect(() => {
    setStartInput(toLocalDateTimeInputValue(startAt));
  }, [startAt]);

  useEffect(() => {
    setDueInput(toLocalDateTimeInputValue(dueAt));
  }, [dueAt]);

  useEffect(() => {
    const reference = parseIsoDate(startAt) || parseIsoDate(dueAt) || new Date();
    setMonthCursor(startOfMonth(reference));
  }, [startAt, dueAt]);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const computed = useMemo(() => {
    const nextRange = toIsoRangeFromLocalInputs(startInput, dueInput);
    const validation = validateDateRange(nextRange.startAt, nextRange.dueAt);
    return {
      ...nextRange,
      ...validation,
      compactText: formatDateRangeCompact(nextRange.startAt, nextRange.dueAt),
      fullText: formatDateRangeFull(nextRange.startAt, nextRange.dueAt),
    };
  }, [startInput, dueInput]);

  useEffect(() => {
    if (typeof onChange === "function") {
      onChange({
        startAt: computed.startAt,
        dueAt: computed.dueAt,
        isValid: computed.isValid,
        status: computed.status,
        error: computed.error,
      });
    }
  }, [computed.startAt, computed.dueAt, computed.isValid, computed.status, computed.error, onChange]);

  const toggleOpen = () => {
    if (!didOpen) setDidOpen(true);
    setOpen((prev) => !prev);
  };

  const clearRange = () => {
    setStartInput("");
    setDueInput("");
  };

  const helperError = error || computed.error;

  const startDatePart = toDatePart(startInput);
  const startTimePart = toTimePart(startInput) || defaultTimePart();
  const dueDatePart = toDatePart(dueInput);
  const dueTimePart = toTimePart(dueInput) || defaultTimePart();

  const startDate = parseIsoDate(computed.startAt);
  const dueDate = parseIsoDate(computed.dueAt);
  const rangeStart = startDate ? startOfDay(startDate) : null;
  const rangeEnd = dueDate ? startOfDay(dueDate) : null;

  const days = useMemo(() => getCalendarDays(monthCursor), [monthCursor]);

  const updateStartDatePart = (datePart) => {
    setStartInput(datePart ? mergeDateAndTime(datePart, toTimePart(startInput) || defaultTimePart()) : "");
  };

  const updateStartTimePart = (timePart) => {
    if (!startDatePart) return;
    setStartInput(mergeDateAndTime(startDatePart, timePart || "00:00"));
  };

  const updateDueDatePart = (datePart) => {
    setDueInput(datePart ? mergeDateAndTime(datePart, toTimePart(dueInput) || defaultTimePart()) : "");
  };

  const updateDueTimePart = (timePart) => {
    if (!dueDatePart) return;
    setDueInput(mergeDateAndTime(dueDatePart, timePart || "00:00"));
  };

  const handlePickDay = (dayDate) => {
    const pickedDate = `${dayDate.getFullYear()}-${pad(dayDate.getMonth() + 1)}-${pad(dayDate.getDate())}`;

    if (!startDatePart || (startDatePart && dueDatePart)) {
      setStartInput(mergeDateAndTime(pickedDate, startTimePart || defaultTimePart()));
      setDueInput("");
      return;
    }

    const startIso = localDateTimeInputToIso(mergeDateAndTime(startDatePart, startTimePart || "00:00"));
    const dueIso = localDateTimeInputToIso(mergeDateAndTime(pickedDate, dueTimePart || "00:00"));
    const shouldSwap = startIso && dueIso && new Date(dueIso).getTime() < new Date(startIso).getTime();

    if (shouldSwap) {
      setDueInput(mergeDateAndTime(startDatePart, dueTimePart || defaultTimePart()));
      setStartInput(mergeDateAndTime(pickedDate, startTimePart || defaultTimePart()));
    } else {
      setDueInput(mergeDateAndTime(pickedDate, dueTimePart || defaultTimePart()));
    }
  };

  const dueDateInputClass = dueDatePart
    ? "w-full rounded-md border border-[#5f6977] bg-[#252b35] px-2.5 py-1.5 text-sm text-[#e1e7ef] outline-none"
    : "w-full rounded-md border border-[#3f4753] bg-[#1d222b] px-2.5 py-1.5 text-sm text-[#6b7585] outline-none";

  const dueTimeInputClass = dueDatePart
    ? "w-full rounded-md border border-[#5f6977] bg-[#252b35] px-2.5 py-1.5 text-sm text-[#e1e7ef] outline-none"
    : "w-full rounded-md border border-[#3f4753] bg-[#1d222b] px-2.5 py-1.5 text-sm text-[#6b7585] outline-none";

  const startDateInputClass = startDatePart
    ? "w-full rounded-md border border-[#5f6977] bg-[#252b35] px-2.5 py-1.5 text-sm text-[#e1e7ef] outline-none"
    : "w-full rounded-md border border-[#3f4753] bg-[#1d222b] px-2.5 py-1.5 text-sm text-[#6b7585] outline-none";

  const startTimeInputClass = startDatePart
    ? "w-full rounded-md border border-[#5f6977] bg-[#252b35] px-2.5 py-1.5 text-sm text-[#e1e7ef] outline-none"
    : "w-full rounded-md border border-[#3f4753] bg-[#1d222b] px-2.5 py-1.5 text-sm text-[#6b7585] outline-none";

  return (
    <div ref={wrapperRef} className={`relative ${className}`.trim()}>
      <button
        type="button"
        onClick={toggleOpen}
        className={`flex w-full items-center gap-2 rounded-md border border-white/10 bg-[#3d454c] px-3 py-2 text-left text-sm text-[#dee4ea] hover:bg-[#4a535c] ${compact ? "" : "min-h-10"}`.trim()}
        title={computed.fullText}
      >
        <CalendarClock className="h-4 w-4 shrink-0 text-[#9fadbc]" />
        <span className="min-w-0 flex-1 truncate">{computed.compactText}</span>
        <span className={`rounded px-2 py-0.5 text-[10px] font-medium ${statusClass(computed.status)}`}>
          {statusLabel(computed.status)}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#9fadbc] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && didOpen && (
        <div className="absolute left-0 z-20 mt-2 w-[365px] max-w-[92vw] rounded-xl border border-white/10 bg-[#272b34] p-4 shadow-2xl">
          <div className="mb-3 flex items-center justify-center">
            <h4 className="text-xl font-semibold leading-none text-[#dfe7ef]">
              Ngày
            </h4>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 rounded p-1 text-[#a8b0bb] hover:bg-white/10 hover:text-white"
              aria-label="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-2 flex items-center justify-between text-[#cfd7e3]">
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setMonthCursor((prev) => addYears(prev, -1))} className="rounded p-1 hover:bg-white/10" aria-label="Năm trước">
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setMonthCursor((prev) => addMonths(prev, -1))} className="rounded p-1 hover:bg-white/10" aria-label="Tháng trước">
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
            <div className="text-2xl font-semibold leading-none">
              {monthTitle(monthCursor)}
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setMonthCursor((prev) => addMonths(prev, 1))} className="rounded p-1 hover:bg-white/10" aria-label="Tháng sau">
                <ChevronRight className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setMonthCursor((prev) => addYears(prev, 1))} className="rounded p-1 hover:bg-white/10" aria-label="Năm sau">
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1 text-center text-sm font-semibold text-[#a7afbb]">
            {WEEKDAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 pb-1">
            {days.map((day) => {
              const dayOnly = startOfDay(day.date);
              const inRange = rangeStart && rangeEnd && dayOnly >= rangeStart && dayOnly <= rangeEnd;
              const isStart = rangeStart && isSameDay(dayOnly, rangeStart);
              const isEnd = rangeEnd && isSameDay(dayOnly, rangeEnd);
              const classNameDay = isStart || isEnd
                ? "bg-[#1e4d88] text-[#a9d1ff]"
                : inRange
                ? "bg-[#183a62] text-[#cde4ff]"
                : day.inCurrentMonth
                ? "text-[#d7deea] hover:bg-white/10"
                : "text-[#838c9a] hover:bg-white/5";

              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => handlePickDay(day.date)}
                  className={`h-9 rounded text-sm leading-none transition-colors ${classNameDay}`}
                >
                  {day.date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 space-y-3">
            <div>
              <p className="mb-1 text-sm font-semibold text-[#a7afbb]">Ngày bắt đầu</p>
              <div className="grid grid-cols-[24px_1fr_112px] items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(startDatePart)}
                  onChange={(event) => {
                    if (!event.target.checked) {
                      setStartInput("");
                      return;
                    }
                    const day = startDatePart || `${monthCursor.getFullYear()}-${pad(monthCursor.getMonth() + 1)}-01`;
                    setStartInput(mergeDateAndTime(day, startTimePart || defaultTimePart()));
                  }}
                  aria-label="Bật ngày bắt đầu"
                  className="h-4 w-4 rounded border-[#4b5560] bg-[#11161c] text-[#579dff]"
                />
                <input
                  aria-label="Ngày bắt đầu (date)"
                  type="date"
                  value={startDatePart}
                  onChange={(event) => updateStartDatePart(event.target.value)}
                  className={startDateInputClass}
                />
                <input
                  aria-label="Giờ bắt đầu (time)"
                  type="time"
                  value={startDatePart ? startTimePart : ""}
                  onChange={(event) => updateStartTimePart(event.target.value)}
                  disabled={!startDatePart}
                  className={startTimeInputClass}
                />
              </div>
            </div>

            <div>
              <p className="mb-1 text-sm font-semibold text-[#a7afbb]">Ngày hết hạn</p>
              <div className="grid grid-cols-[24px_1fr_112px] items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(dueDatePart)}
                  onChange={(event) => {
                    if (!event.target.checked) {
                      setDueInput("");
                      return;
                    }
                    const baseDate = dueDatePart || startDatePart || `${monthCursor.getFullYear()}-${pad(monthCursor.getMonth() + 1)}-01`;
                    setDueInput(mergeDateAndTime(baseDate, dueTimePart || defaultTimePart()));
                  }}
                  aria-label="Bật ngày kết thúc"
                  className="h-4 w-4 rounded border-[#4b5560] bg-[#11161c] text-[#579dff]"
                />
                <input
                  aria-label="Ngày kết thúc (date)"
                  type="date"
                  value={dueDatePart}
                  onChange={(event) => updateDueDatePart(event.target.value)}
                  className={dueDateInputClass}
                />
                <input
                  aria-label="Giờ kết thúc (time)"
                  type="time"
                  value={dueDatePart ? dueTimePart : ""}
                  onChange={(event) => updateDueTimePart(event.target.value)}
                  disabled={!dueDatePart}
                  className={dueTimeInputClass}
                />
              </div>
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-1 text-sm font-semibold text-[#a7afbb]">Định kỳ</p>
            <select
              value={repeatRule}
              onChange={(event) => setRepeatRule(event.target.value)}
              className="w-full rounded-md border border-[#5f6977] bg-[#252b35] px-3 py-2 text-base text-[#e1e7ef] outline-none"
            >
              <option>Không bao giờ</option>
              <option>Hàng ngày</option>
              <option>Hàng tuần</option>
              <option>Hàng tháng</option>
            </select>
          </div>

          <div className="mt-3">
            <p className="mb-1 text-sm font-semibold text-[#a7afbb]">Thiết lập Nhắc nhở</p>
            <select
              value={remindRule}
              onChange={(event) => setRemindRule(event.target.value)}
              className="w-full rounded-md border border-[#5f6977] bg-[#252b35] px-3 py-2 text-base text-[#e1e7ef] outline-none"
            >
              <option>Không nhắc</option>
              <option>5 Phút trước</option>
              <option>10 Phút trước</option>
              <option>30 Phút trước</option>
              <option>1 Giờ trước</option>
              <option>1 Ngày trước</option>
            </select>
            <p className="mt-2 text-sm text-[#a7afbb]">
              Nhắc nhở sẽ được gửi đến tất cả các thành viên và người theo dõi thẻ này.
            </p>
          </div>

          <div className="mt-4 text-[11px] text-[#8c9bab]" title={computed.fullText}>{computed.fullText}</div>

          {helperError && (
            <p className="mt-2 rounded-md bg-red-500/10 px-2 py-1.5 text-xs text-red-300">
              {helperError}
            </p>
          )}

          <button
            type="button"
            onClick={clearRange}
            className="mt-3 w-full rounded-md border border-[#3f4753] bg-[#1d222b] px-3 py-2 text-sm text-[#9fadbc] hover:bg-[#242b35]"
          >
            Xóa ngày
          </button>
        </div>
      )}
    </div>
  );
}

export default QuickTaskDateRangeField;
