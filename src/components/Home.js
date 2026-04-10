import React from 'react';
import { 
  Trello, 
  Layout, 
  Home, 
  Users, 
  Settings, 
  CreditCard, 
  Plus, 
  ChevronDown 
} from 'lucide-react'; // Cài đặt: npm install lucide-react
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#1d2125] text-[#9fadbc] flex flex-col font-sans">
      {/* 1. Top Navigation Bar */}
      <nav className="h-12 border-b border-[#3c444d] bg-[#1d2125] flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-white font-bold text-xl">
            <Trello size={20} className="text-[#579dff]" />
            Trello
          </div>
          <button className="px-3 py-1 hover:bg-[#3c444d] rounded text-sm font-medium">Các không gian làm việc <ChevronDown size={14} className="inline ml-1" /></button>
          <button className="px-3 py-1 bg-[#579dff] text-[#1d2125] rounded font-bold text-sm">Tạo mới</button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center text-white text-xs font-bold">NH</div>
        </div>
      </nav>

      <div className="flex flex-1">
        {/* 2. Left Sidebar */}
        <aside className="w-64 p-4 space-y-6 hidden md:block">
          <ul className="space-y-2">
            <li className="flex items-center gap-3 px-3 py-2 bg-[#e9f2ff14] text-[#579dff] rounded-md cursor-default block">
              <Layout size={18} /> <span className="font-medium">Bảng</span>
            </li>
            <li className="flex items-center gap-3 px-3 py-2 hover:bg-[#3c444d] rounded-md cursor-pointer">
              <Home size={18} /> <span>Trang chủ</span>
            </li>
          </ul>

          <div>
            <p className="px-3 text-xs font-bold mb-2 uppercase">Các không gian làm việc</p>
            <div className="space-y-1">
              <div className="flex items-center justify-between px-3 py-2 hover:bg-[#3c444d] rounded-md cursor-pointer group">
                <div className="flex items-center gap-3 italic font-bold">
                  <span className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center text-xs">T</span>
                  Trello Không gian...
                </div>
                <ChevronDown size={14} />
              </div>
              {/* Workspace sub-menu */}
              <div className="ml-9 space-y-1 text-sm">
                <Link to="/workspace/1/boards" className="py-1.5 flex items-center gap-3 hover:text-white cursor-pointer"><Layout size={14}/> Bảng</Link>
                <Link to="/members" className="py-1.5 flex items-center gap-3 hover:text-white cursor-pointer"><Users size={14}/> Thành viên</Link>
                <Link to="/settings" className="py-1.5 flex items-center gap-3 hover:text-white cursor-pointer"><Settings size={14}/> Cài đặt</Link>
              </div>
            </div>
          </div>
        </aside>

        {/* 3. Main Content Area */}
        <main className="flex-1 p-8 max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center text-center space-y-6 mt-10 border border-[#3c444d] p-10 rounded-lg bg-[#22272b]">
            <div className="w-48 h-32 bg-[#2c333a] rounded-md relative overflow-hidden flex items-center justify-center">
               <div className="flex gap-2">
                  <div className="w-10 h-14 bg-purple-500 rounded"></div>
                  <div className="w-10 h-10 bg-pink-500 rounded"></div>
                  <div className="w-10 h-16 bg-blue-500 rounded"></div>
               </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">Tổ chức mọi thứ</h1>
              <p className="text-slate-400 max-w-md">
                Đặt tất cả mọi thứ ở một nơi và bắt đầu di chuyển mọi thứ về phía trước với bảng Trello đầu tiên của bạn!
              </p>
            </div>

            <button className="bg-[#579dff] text-[#1d2125] px-6 py-2 rounded font-bold hover:bg-[#85b8ff] transition">
              Tạo một bảng Không gian làm việc
            </button>
            
            <button className="text-sm hover:underline">Đã hiểu! Bỏ qua điều này.</button>
          </div>
        </main>

        {/* 4. Right History Section */}
        <aside className="w-72 p-8 space-y-6 hidden lg:block">
          <div>
             <h3 className="text-xs font-bold uppercase mb-4">Đã xem gần đây</h3>
             <ul className="space-y-4">
                <li className="flex items-center gap-3 cursor-pointer group">
                   <div className="w-8 h-6 bg-purple-600 rounded"></div>
                   <div>
                      <p className="text-sm text-white font-medium group-hover:text-[#579dff]">Thông tin của nhóm</p>
                      <p className="text-xs">T2502E-Assignment-NodeJS</p>
                   </div>
                </li>
             </ul>
          </div>
          <button className="flex items-center gap-2 text-sm hover:bg-[#3c444d] w-full p-2 rounded transition">
             <div className="w-6 h-6 bg-[#2c333a] rounded flex items-center justify-center text-white"><Plus size={16}/></div>
             Tạo bảng mới
          </button>
        </aside>
      </div>
    </div>
  );
};

export default HomePage;
