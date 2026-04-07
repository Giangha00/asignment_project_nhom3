import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra token khi app load
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Login />} />
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
        element={
          isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/login" />
        }
      />
    </Routes>
  );
}

export default App;
