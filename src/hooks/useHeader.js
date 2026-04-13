import { useState, useEffect, useRef } from "react";

export function useHeader({ onCreateBoard, onLogout }) {
  const [searchText, setSearchText] = useState("");
  const [recentSearches, setRecentSearches] = useState([
    "Bảng Trello của tôi",
    "Bảng Demo",
    "Thông tin của nhóm",
  ]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const userRef = useRef(null);

  const createOptions = [
    { key: "board", label: "Tạo bảng" },
    { key: "workspace-view", label: "Tạo dạng xem không gian làm việc" },
    { key: "template", label: "Bắt đầu với mẫu" },
  ];

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setSearchOpen(false);
      if (userRef.current && !userRef.current.contains(event.target)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setSearchOpen(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchText.trim()) return;
    setRecentSearches((prev) => {
      const next = [searchText.trim(), ...prev.filter((item) => item !== searchText.trim())];
      return next.slice(0, 5);
    });
    setSearchOpen(false);
  };

  const handleSearchFocus = () => setSearchOpen(true);

  const handleRecentSearchClick = (value) => {
    setSearchText(value);
    setSearchOpen(false);
  };

  const handleCreateClick = () => setMenuOpen((prev) => !prev);

  const handleOptionSelect = (option) => {
    setMenuOpen(false);
    if (typeof onCreateBoard === "function") onCreateBoard(option.key);
  };

  const handleLogout = () => {
    if (typeof onLogout === "function") onLogout();
    setUserMenuOpen(false);
  };

  return {
    searchText,
    recentSearches,
    searchOpen,
    menuOpen,
    userMenuOpen,
    setUserMenuOpen,
    menuRef,
    searchRef,
    userRef,
    createOptions,
    handleSearchChange,
    handleSearchSubmit,
    handleSearchFocus,
    handleRecentSearchClick,
    handleCreateClick,
    handleOptionSelect,
    handleLogout,
  };
}
