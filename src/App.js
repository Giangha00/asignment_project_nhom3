import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './page/authen/Login';
import Register from './page/authen/Register';
import Dashboard from './page/Dashboard';
import ForgotPassword from './page/authen/ForgotPassword';
import ResetPassword from './page/authen/ResetPassword';
import Home from './page/home/Home';
import BoardView from './page/board/BoardView';
import './App.css';

function App() {
  // Đọc token mỗi khi đổi URL để sau đăng nhập/đăng xuất không bị kẹt state cũ
  // (trước đây isAuthenticated chỉ set một lần lúc mount nên đăng nhập xong vẫn bị đẩy về /login).
  useLocation();
  const isAuthenticated = !!localStorage.getItem('token');

  return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
        <Route path="/board/:boardId" element={isAuthenticated ? <BoardView /> : <Navigate to="/login" />} />
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      </Routes>
   
  );
}

export default App;
