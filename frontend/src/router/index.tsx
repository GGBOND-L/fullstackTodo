import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import TodoPage from "../pages/TodoPage";
import NotFoundPage from "../pages/NotFoundPage";
import ProtectedRoute from "../components/ProtectedRoute"; // 保护路由

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* 登录页 */}
        <Route path="/login" element={<LoginPage />} />
        {/* 注册页 */}
        <Route path="/register" element={<RegisterPage />} />
        {/* 受保护路由，只有登录后才能访问 */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <TodoPage />
            </ProtectedRoute>
          }
        />
        {/* 404 页面 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
