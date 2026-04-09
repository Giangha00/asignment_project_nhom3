import React from "react";
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
        path="/workspace/:workspaceId/:section?/:boardId?"
        element={
          isAuthenticated ? <WorkspaceUnifiedPage /> : <Navigate to="/login" />
        }
      />
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;
