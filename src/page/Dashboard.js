import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const sampleData = {
  boards: [
    {
      id: 'board-1',
      name: 'To Do',
      cards: [
        { id: 'card-1', title: 'Thiết kế giao diện', description: 'Tạo wireframe và mockup trang Trello.' },
        { id: 'card-2', title: 'Lưu demo vào localStorage', description: 'Lưu dữ liệu mẫu để xem giao diện.' },
      ],
    },
    {
      id: 'board-2',
      name: 'In Progress',
      cards: [
        { id: 'card-3', title: 'Tạo component', description: 'Xây dựng Login / Register / Dashboard bằng React.' },
      ],
    },
    {
      id: 'board-3',
      name: 'Done',
      cards: [
        { id: 'card-4', title: 'Kết nối Tailwind CDN', description: 'Sử dụng Tailwind CDN để hiển thị view nhanh.' },
      ],
    },
  ],
};

function Dashboard() {
  const [user, setUser] = useState(null);
  const [boards, setBoards] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      navigate('/login');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }

    const existing = localStorage.getItem('trelloData');
    if (existing) {
      setBoards(JSON.parse(existing).boards || []);
    } else {
      localStorage.setItem('trelloData', JSON.stringify(sampleData));
      setBoards(sampleData.boards);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleResetData = () => {
    localStorage.setItem('trelloData', JSON.stringify(sampleData));
    setBoards(sampleData.boards);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Trello Clone</h1>
            <p className="text-indigo-200 mt-2 text-sm">
              Dữ liệu mẫu đã được lưu tạm lên <span className="font-semibold">localStorage</span>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white text-sm font-medium">
              Xin chào, {user?.username || 'User'}
            </span>
            <button
              onClick={handleResetData}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition"
            >
              Reset dữ liệu mẫu
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
            >
              Đăng Xuất
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {boards.map((board) => (
            <div key={board.id} className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{board.name}</h2>
              <div className="space-y-4">
                {board.cards.map((card) => (
                  <div key={card.id} className="rounded-xl border border-gray-200 p-4 bg-slate-50">
                    <h3 className="font-semibold text-gray-800">{card.title}</h3>
                    <p className="text-gray-600 text-sm mt-2">{card.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
