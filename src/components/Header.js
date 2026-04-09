import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Header = ({ onCreateBoard, backTo, trialBadge }) => {
  const navigate = useNavigate();
  const [user] = useState(() => {
    try {
      const raw = localStorage.getItem('userProfile');
      if (raw) {
        const parsed = JSON.parse(raw);
        const name = parsed.fullName || parsed.name || parsed.email || 'User';
        const initials = (String(name).trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('') || 'U').toUpperCase();
        return { name, initials, email: parsed.email || '' };
      }
    } catch {}
    return { name: 'User', initials: 'U', email: '' };
  });
  const [searchText, setSearchText] = useState('');
  const [recentSearches, setRecentSearches] = useState(['Bảng Trello của tôi', 'Bảng Demo', 'Thông tin của nhóm']);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const createOptions = [
    { key: 'board', label: 'Tạo bảng' },
    { key: 'workspace-view', label: 'Tạo dạng xem không gian làm việc' },
    { key: 'template', label: 'Bắt đầu với mẫu' }
  ];

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
    setSearchOpen(true);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (!searchText.trim()) return;

    setRecentSearches(prev => {
      const next = [searchText.trim(), ...prev.filter(item => item !== searchText.trim())];
      return next.slice(0, 5);
    });
    setSearchOpen(false);
    console.log('Search query:', searchText.trim());
  };

  const handleSearchFocus = () => {
    setSearchOpen(true);
  };

  const handleRecentSearchClick = (value) => {
    setSearchText(value);
    setSearchOpen(false);
  };

  const handleCreateClick = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleOptionSelect = (option) => {
    setMenuOpen(false);
    if (typeof onCreateBoard === 'function') {
      onCreateBoard(option.key);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('forgotPasswordResetEmail');
    setUserMenuOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <nav className="h-12 px-2 flex items-center justify-between bg-[#1d2125] border-b border-[#3c444d] text-[#9fadbc] sticky top-0 z-50">
      
      {/* 1. Left Section: (tuỳ chọn) Quay lại + Logo Trello */}
      <div className="flex items-center gap-1">
        {backTo ? (
          <Link
            to={backTo}
            className="p-2 text-[#dee4ea] hover:bg-[#3c444d] rounded-sm transition"
            aria-label="Quay lại"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
        ) : null}
        <button type="button" className="p-2 hover:bg-[#3c444d] rounded-sm transition">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" /></svg>
        </button>
        
        <div className="flex items-center gap-1.5 px-2 py-1 hover:bg-[#3c444d] rounded-sm cursor-pointer transition">
          <div className="bg-[#579dff] p-0.5 rounded-[3px] flex items-center justify-center">
            {/* Logo Trello Vector chuẩn */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1d2125"><path d="M21 2.25H3c-.414 0-.75.336-.75.75v18c0 .414.336.75.75.75h18c.414 0 .75-.336.75-.75V3c0-.414-.336-.75-.75-.75zM10.125 15.75c0 .414-.336.75-.75.75H5.625c-.414 0-.75-.336-.75-.75V6.75c0-.414.336-.75.75-.75h3.75c.414 0 .75.336.75.75v9zM18.375 12c0 .414-.336.75-.75.75h-3.75c-.414 0-.75-.336-.75-.75V6.75c0-.414.336-.75.75-.75h3.75c.414 0 .75.336.75.75V12z" /></svg>
          </div>
          <span className="text-xl font-black text-[#dee4ea] tracking-tighter">Trello</span>
        </div>
      </div>

      {/* 2. Middle Section: Search Bar & Create Button */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 w-full max-w-[550px] px-4">
        <form onSubmit={handleSearchSubmit} ref={searchRef} className="relative flex-1">
          <div className="relative flex-1 group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c9bab] group-focus-within:text-black">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <input 
              type="text" 
              value={searchText}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              placeholder="Tìm kiếm"
              aria-label="Tìm kiếm"
              className="w-full bg-[#22272b] border border-[#3c444d] rounded-[3px] py-1.5 pl-10 pr-3 text-sm focus:bg-white focus:text-black outline-none transition-all placeholder:text-[#8c9bab]"
            />
          </div>
          {searchOpen && (
            <div className="absolute left-0 top-full z-20 mt-2 w-full overflow-hidden rounded-[12px] border border-[#3c444d] bg-[#171d24] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
              <div className="border-b border-[#2c3540] px-4 py-3 text-sm font-semibold text-white">Tìm kiếm gần đây</div>
              <div className="space-y-1 px-2 py-2">
                {recentSearches.length === 0 && (
                  <div className="px-3 py-2 text-sm text-[#8c9bab]">Chưa có tìm kiếm nào.</div>
                )}
                {recentSearches.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleRecentSearchClick(item)}
                    className="w-full rounded-xl px-3 py-2 text-left text-sm text-[#e4edf4] transition hover:bg-[#1f2834]"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
        <div className="relative" ref={menuRef}>
          <button type="button" onClick={handleCreateClick} className="shrink-0 px-3 py-1.5 bg-[#579dff] hover:bg-[#85b8ff] text-[#1d2125] rounded-sm font-bold text-sm transition">
            Tạo mới
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 rounded-[14px] border border-[#3c444d] bg-[#171d24] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
              <div className="space-y-2">
                {createOptions.map(option => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => handleOptionSelect(option)}
                    className="w-full rounded-[12px] px-3 py-3 text-left text-sm text-[#e4edf4] transition hover:bg-[#2b3650]"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {trialBadge ? (
          <span className="hidden shrink-0 rounded-full border border-[#3c444d] px-2.5 py-0.5 text-xs text-[#dee4ea] lg:inline">
            {trialBadge}
          </span>
        ) : null}
      </div>

      {/* 3. Right Section: Các Logo được sửa lại đẹp hơn theo hình mẫu */}
      <div className="flex items-center gap-1">
        {/* Info Icon (Tròn) */}
        <button className="p-2 hover:bg-[#3c444d] rounded-full transition text-[#9fadbc]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" /><path d="M12 8h.01" />
          </svg>
        </button>

        {/* Notifications Icon (Chuông xoay) */}
        <button className="p-2 hover:bg-[#3c444d] rounded-full transition text-[#9fadbc] relative">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="-rotate-12">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
        </button>

        {/* Help/Question Icon */}
        <button className="p-2 hover:bg-[#3c444d] rounded-full transition text-[#9fadbc]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
        </button>
        
        {/* User Avatar */}
        <div ref={userRef} className="relative ml-1">
          <button
            onClick={() => setUserMenuOpen(prev => !prev)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1d7f5c] text-white text-[13px] font-bold transition border border-[#3c444d] hover:opacity-90"
          >
            {user.initials}
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 top-full z-30 mt-3 w-72 overflow-hidden rounded-[18px] border border-[#3c444d] bg-[#171d24] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
              <div className="border-b border-[#2c3540] px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2f67ff] text-lg font-bold text-white">{user.initials}</div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-[#8c9bab]">Tài khoản</div>
                    <div className="text-sm font-semibold text-white">{user.name}</div>
                    <div className="text-xs text-[#9fadbc]">{user.email}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-1 px-3 py-3">
                <button className="w-full rounded-xl px-3 py-2 text-left text-sm text-[#e4edf4] transition hover:bg-[#1f2834]">Chuyển đổi Tài khoản</button>
                <button className="w-full rounded-xl px-3 py-2 text-left text-sm text-[#e4edf4] transition hover:bg-[#1f2834]">Quản lý tài khoản</button>
              </div>
              <div className="border-t border-[#2c3540] px-3 py-3">
                <button className="w-full rounded-xl px-3 py-2 text-left text-sm text-[#e4edf4] transition hover:bg-[#1f2834]">Hồ sơ và Hiển thị</button>
                <button className="w-full rounded-xl px-3 py-2 text-left text-sm text-[#e4edf4] transition hover:bg-[#1f2834]">Hoạt động</button>
                <button className="w-full rounded-xl px-3 py-2 text-left text-sm text-[#e4edf4] transition hover:bg-[#1f2834]">Thẻ</button>
                <button className="w-full rounded-xl px-3 py-2 text-left text-sm text-[#e4edf4] transition hover:bg-[#1f2834]">Cài đặt</button>
                <button className="w-full rounded-xl px-3 py-2 text-left text-sm text-[#e4edf4] transition hover:bg-[#1f2834]">Labs</button>
              </div>
              <div className="border-t border-[#2c3540] px-3 py-3">
                <button className="w-full rounded-xl px-3 py-2 text-left text-sm text-[#e4edf4] transition hover:bg-[#1f2834]">Tạo Không gian làm việc</button>
                <button className="w-full rounded-xl px-3 py-2 text-left text-sm text-[#e4edf4] transition hover:bg-[#1f2834]">Trợ giúp</button>
                <button className="w-full rounded-xl px-3 py-2 text-left text-sm text-[#e4edf4] transition hover:bg-[#1f2834]">Phím tắt</button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-xl px-3 py-2 text-left text-sm text-[#e4edf4] transition hover:bg-[#1f2834]"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
