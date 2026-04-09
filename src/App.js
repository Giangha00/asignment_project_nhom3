import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./page/authen/Login";
import Register from "./page/authen/Register";
import ForgotPassword from "./page/authen/ForgotPassword";
import ResetPassword from "./page/authen/ResetPassword";
import Home from "./page/home/Home";
import WorkspaceUnifiedPage from "./page/workspace/WorkspaceUnifiedPage";
import api from "./lib/api";

import "./App.css";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingResetEmail, setPendingResetEmail] = useState("");
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const bootstrapSession = async () => {
      try {
        const response = await api.get("/api/auth/session");
        if (!cancelled) {
          setCurrentUser(response.data?.user || null);
        }
      } catch {
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

  const handleLoginSuccess = ({ user }) => {
    setCurrentUser(user || null);
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // Clear local auth state even if the cookie was already invalid.
    }
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
        path="/workspace/:workspaceId/:section?/:boardId?"
        element={
          isAuthenticated ? (
            <WorkspaceUnifiedPage currentUser={currentUser} onLogout={handleLogout} />
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
  );
}

export default App;
