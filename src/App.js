import React, { useMemo, useState } from "react";
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

import "./App.css";

function App() {
  const [authToken, setAuthToken] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingResetEmail, setPendingResetEmail] = useState("");

  const isAuthenticated = Boolean(authToken);

  const authPayload = useMemo(
    () => ({ authToken, currentUser }),
    [authToken, currentUser]
  );

  const handleLoginSuccess = ({ token, user }) => {
    setAuthToken(token || "");
    setCurrentUser(user || null);
  };

  const handleLogout = () => {
    setAuthToken("");
    setCurrentUser(null);
    setPendingResetEmail("");
  };

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
            <Home {...authPayload} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/workspace/:workspaceId/:section?/:boardId?"
        element={
          isAuthenticated ? (
            <WorkspaceUnifiedPage {...authPayload} onLogout={handleLogout} />
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
