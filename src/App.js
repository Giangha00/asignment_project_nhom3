import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./page/authen/Login";
import Register from "./page/authen/Register";
import ForgotPassword from "./page/authen/ForgotPassword";
import ResetPassword from "./page/authen/ResetPassword";
import Home from "./page/home/Home";
import BoardDetail from "./page/board/BoardDetail";
import api from "./lib/api";
import { setSocketAuthToken } from "./lib/socket";
import { NotificationProvider } from "./context/NotificationContext";
import { UserSocketNotificationBridge } from "./components/UserSocketNotificationBridge";

import "./App.css";

/**
 * Gốc routing + trạng thái đăng nhập.
 *
 * - Khởi động: GET /api/auth/session (cookie JWT) → có user thì coi như đã đăng nhập.
 * - currentUser: dùng cho Home, header; null = chưa đăng nhập.
 * - Đăng xuất: POST /api/auth/logout + xóa state (cookie được server clear).
 * - NotificationProvider: state thông báo chuông dùng chung Home + BoardDetail.
 */
function App() {
  const [currentUser, setCurrentUser] = useState(null);
  /** JWT từ session/login — dùng đồng bộ socket trước khi Bridge subscribe (realtime). */
  const [sessionToken, setSessionToken] = useState(null);
  const [pendingResetEmail, setPendingResetEmail] = useState("");
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    /** Khôi phục phiên sau F5: nếu cookie còn hạn thì nhận user, không thì vào màn login. */
    const bootstrapSession = async () => {
      try {
        const response = await api.get("/api/auth/session");
        const token = response.data?.token;
        if (token) {
          setSocketAuthToken(token);
          setSessionToken(token);
        } else {
          setSessionToken(null);
        }
        if (!cancelled) {
          setCurrentUser(response.data?.user || null);
        }
      } catch {
        setSocketAuthToken(null);
        setSessionToken(null);
        if (!cancelled) {
          setCurrentUser(null);
        }
      } finally {
        if (!cancelled) {
          setAuthReady(true);
        }
      }
    };

    bootstrapSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const isAuthenticated = Boolean(currentUser);

  /** Sau login thành công: cập nhật user trong memory (cookie đã được server set khi POST /login). */
  const handleLoginSuccess = ({ user, token }) => {
    if (token) {
      setSocketAuthToken(token);
      setSessionToken(token);
    } else {
      setSessionToken(null);
    }
    setCurrentUser(user || null);
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // Clear local auth state even if the cookie was already invalid.
    }
    setSocketAuthToken(null);
    setSessionToken(null);
    setCurrentUser(null);
    setPendingResetEmail("");
  };

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121517] text-[#dee4ea]">
        Đang tải phiên đăng nhập...
      </div>
    );
  }

  return (
    <NotificationProvider>
    {isAuthenticated && currentUser ? (
      <UserSocketNotificationBridge
        currentUser={currentUser}
        sessionToken={sessionToken}
      />
    ) : null}
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/home" replace />
          ) : (
            <Login onLoginSuccess={handleLoginSuccess} />
          )
        }
      />
      <Route path="/register" element={<Register />} />
      <Route
        path="/forgot-password"
        element={<ForgotPassword onEmailReady={setPendingResetEmail} />}
      />
      <Route
        path="/reset-password"
        element={<ResetPassword pendingEmail={pendingResetEmail} />}
      />
      <Route
        path="/home"
        element={
          isAuthenticated ? (
            <Home currentUser={currentUser} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/workspace/:workspaceId/:section"
        element={
          isAuthenticated ? (
            <Home currentUser={currentUser} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/workspace/:workspaceId/board/:boardId"
        element={
          isAuthenticated ? (
            <BoardDetail currentUser={currentUser} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/home" : "/"} replace />}
      />
    </Routes>
    </NotificationProvider>
  );
}

export default App;
