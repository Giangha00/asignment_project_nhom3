import React from 'react';

const SettingContent = ({ workspace }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="rounded-[28px] border border-[#30363f] bg-[#181f25] p-8 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-[0.28em] text-[#8c9bab]">Các cài đặt Không gian làm việc</div>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#8b5cf6] to-[#4f46e5] text-3xl font-bold text-white">T</div>
              <div>
                <div className="text-2xl font-semibold text-white">{workspace.name}</div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[#9fadbc]">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[#d3dce4]">Premium</span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[#d3dce4]">Riêng tư</span>
                </div>
              </div>
            </div>
          </div>
          <button className="rounded-lg border border-[#2f3740] bg-[#0f1720] px-5 py-3 text-sm font-semibold text-[#9fadbc] transition hover:border-[#579dff] hover:text-white">
            Thay đổi
          </button>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#30363f] bg-[#181f25] p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between gap-4 rounded-[24px] border border-[#232b34] bg-[#11161b] p-6">
          <div>
            <div className="text-base font-semibold text-white">AI</div>
            <p className="mt-2 text-sm text-[#9fadbc]">Đã bật AI cho tất cả các bảng trong Không gian làm việc này.</p>
          </div>
          <button className="rounded-full bg-[#2f67ff] px-4 py-2 text-sm font-semibold text-[#1d2125] hover:bg-[#4b82ff] transition">PREMIUM</button>
        </div>

        <div className="space-y-4">
          <div className="rounded-[24px] border border-[#232b34] bg-[#11161b] p-6">
            <div className="text-sm font-semibold text-white">Khả năng hiển thị trong Không gian làm việc</div>
            <p className="mt-3 text-sm text-[#9fadbc]">Riêng tư — Đây là Không gian làm việc riêng tư. Chỉ những người trong Không gian làm việc có thể truy cập hoặc nhìn thấy Không gian làm việc.</p>
            <button className="mt-4 rounded-lg border border-[#2f3740] bg-[#0f1720] px-4 py-2 text-sm text-[#9fadbc] hover:border-[#579dff] hover:text-white transition">Thay đổi</button>
          </div>

          <div className="rounded-[24px] border border-[#232b34] bg-[#11161b] p-6">
            <div className="text-sm font-semibold text-white">Chính sách hạn chế tư cách thành viên Không gian làm việc</div>
            <p className="mt-3 text-sm text-[#9fadbc]">Bất kỳ ai cũng có thể được thêm vào Không gian làm việc này.</p>
            <button className="mt-4 rounded-lg border border-[#2f3740] bg-[#0f1720] px-4 py-2 text-sm text-[#9fadbc] hover:border-[#579dff] hover:text-white transition">Thay đổi</button>
          </div>

          <div className="rounded-[24px] border border-[#232b34] bg-[#11161b] p-6">
            <div className="text-sm font-semibold text-white">Chính sách hạn chế tạo bảng</div>
            <div className="mt-3 space-y-3 text-sm text-[#9fadbc]">
              <p>Bất kỳ thành viên Không gian làm việc nào cũng có thể tạo 🌐 bảng thông tin công khai.</p>
              <p>Bất kỳ thành viên Không gian làm việc nào cũng có thể tạo 👥 bảng thông tin hiển thị trong Không gian làm việc.</p>
              <p>Bất kỳ thành viên Không gian làm việc nào cũng có thể tạo 🔒 bảng thông tin riêng tư.</p>
            </div>
            <button className="mt-4 rounded-lg border border-[#2f3740] bg-[#0f1720] px-4 py-2 text-sm text-[#9fadbc] hover:border-[#579dff] hover:text-white transition">Thay đổi</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingContent;
