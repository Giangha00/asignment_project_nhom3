import { useEffect, useState } from "react";

/**
 * Debounce = "trì hoãn cập nhật": giá trị trả về chỉ đổi sau khi `value` ngừng thay đổi một lúc.
 *
 * Ví dụ ô tìm kiếm: user gõ liên tục → ta vẫn đọc được từng chữ (state `filterInput`),
 * nhưng chỉ sau ~300ms không gõ nữa thì `debouncedFilter` mới đổi → lúc đó mới lọc danh sách,
 * tránh lọc/re-render quá dày mỗi phím.
 *
 * @template T
 * @param {T} value - giá trị nguồn (thường gắn với input)
 * @param {number} [delayMs=300] - chờ bao nhiêu ms sau lần đổi cuối cùng
 * @returns {T} - bản sao đã debounce của `value`
 */
export function useDebouncedValue(value, delayMs = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    // Hẹn giờ: sau delayMs mới ghi nhận value mới
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    // Nếu value đổi lại trước khi hết giờ → hủy timer cũ (chỉ giữ lần gõ cuối)
    return () => window.clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
