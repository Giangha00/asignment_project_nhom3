import PropTypes from "prop-types";

/**
 * Định nghĩa "hình dạng" object cho PropTypes — dev sai props (thiếu id, sai kiểu) sẽ thấy cảnh báo console.
 * Không thay thế TypeScript nhưng giúp team JS thống nhất cấu trúc dữ liệu thành viên trên UI.
 */

/** Một thành viên hiển thị trong danh sách (dữ liệu từ workspace.members + tuỳ chọn avatarUrl). */
export const workspaceMemberPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  initials: PropTypes.string,
  handle: PropTypes.string,
  role: PropTypes.string,
  lastActive: PropTypes.string,
  /** Có URL → MemberAvatar dùng <img alt="...">; không có → vòng tròn chữ viết tắt. */
  avatarUrl: PropTypes.string,
});

/** Workspace đủ để ContentMembers dùng: ít nhất cần id + mảng members (có thể rỗng). */
export const workspacePropType = PropTypes.shape({
  id: PropTypes.string,
  members: PropTypes.arrayOf(workspaceMemberPropType),
});
