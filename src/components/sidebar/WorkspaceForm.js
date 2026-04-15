import React from "react";

/**
 * Form tạo / sửa workspace (bên trong modal).
 * mode: "create" | "edit"
 */
function WorkspaceForm({ mode = "create", form, setField, submitting, onSubmit, onClose }) {
  const isEdit = mode === "edit";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto flex">
        {/* Left — Form */}
        <div className="flex-1 p-8">
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Đóng form"
          >
            ✕
          </button>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isEdit ? "Chỉnh sửa Không gian làm việc" : "Hãy xây dựng một Không gian làm việc"}
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
            {isEdit
              ? "Cập nhật thông tin cho Không gian làm việc của bạn."
              : "Tăng năng suất bằng cách giúp mọi người dễ dàng truy cập bảng ở một vị trí."}
          </p>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Tên Không gian làm việc
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setField("name")(e.target.value)}
                placeholder="Công ty của Taco"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Đây là tên của công ty, nhóm hoặc tổ chức của bạn.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Loại Không gian làm việc
              </label>
              <select
                value={form.type}
                onChange={(e) => setField("type")(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Chọn...</option>
                <option value="sales">Kinh doanh - Bán hàng</option>
                <option value="marketing">Tiếp thị</option>
                <option value="hr">Nhân sự</option>
                <option value="operations">Vận hành</option>
                <option value="engineering">Kỹ thuật</option>
                <option value="education">Giáo dục</option>
                <option value="personal">Cá nhân</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Chế độ xem
              </label>
              <select
                value={form.visibility}
                onChange={(e) => setField("visibility")(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="private">Riêng tư</option>
                <option value="public">Công khai</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Mô tả Không gian làm việc{" "}
                <span className="font-normal text-gray-500">Tùy chọn</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setField("description")(e.target.value)}
                placeholder="Nhóm của chúng tôi tổ chức mọi thứ ở đây."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="4"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition mt-8 disabled:opacity-60"
            >
              {submitting
                ? isEdit ? "Đang lưu..." : "Đang tạo..."
                : isEdit ? "Lưu thay đổi" : "Tiếp tục"}
            </button>
          </form>
        </div>

        {/* Right — Illustration */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-cyan-300 to-green-400 items-center justify-center p-8 rounded-r-lg">
          <div className="inline-block bg-white bg-opacity-90 rounded-lg p-6 shadow-lg">
            <svg width="200" height="160" viewBox="0 0 200 160" className="mx-auto">
              <rect x="20" y="20" width="160" height="120" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" rx="8" />
              <rect x="35" y="35" width="40" height="35" fill="#fbbf24" stroke="#b45309" strokeWidth="1" rx="2" />
              <rect x="80" y="35" width="40" height="35" fill="#86efac" stroke="#16a34a" strokeWidth="1" rx="2" />
              <rect x="125" y="35" width="25" height="35" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="1" rx="2" />
              <circle cx="160" cy="100" r="8" fill="#60a5fa" opacity="0.7" />
              <circle cx="170" cy="85" r="6" fill="#34d399" opacity="0.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkspaceForm;
