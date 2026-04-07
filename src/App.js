import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./page/authen/Login";
import Register from "./page/authen/Register";
import ForgotPassword from "./page/authen/ForgotPassword";
import ResetPassword from "./page/authen/ResetPassword";
import Home from "./page/home/Home";
import BoardView from "./page/board/BoardView";
import WorkspaceDetailPage from "./page/workspace/WorkspaceDetailPage";
import BoardsPage from "./page/boards/BoardsPage";
import MembersPage from "./page/members/MembersPage";
import SettingsPage from "./page/settings/SettingsPage";

import "./App.css";

function App() {
  useLocation();
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/home"
        element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
      />
      <Route
        path="/board/:boardId"
        element={isAuthenticated ? <BoardView /> : <Navigate to="/login" />}
      />
      <Route
        path="/workspace/:workspaceId/*"
        element={isAuthenticated ? <WorkspaceDetailPage /> : <Navigate to="/login" />}
      >
        <Route index element={<BoardsPage />} />
        <Route path="boards" element={<BoardsPage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/login" />
        }
      />
    </Routes>
  );
}

export default App;
