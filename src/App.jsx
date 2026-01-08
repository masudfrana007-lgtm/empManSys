import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./Landing";
import Login from "./Login";
import Home from "./Home";
import Admin from "./Admin";
import "./App.css"; // ✅ REQUIRED: restores your previous styling

const RequireAuth = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" replace />;
  if (role && userRole !== role) return <Navigate to="/" replace />;

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route
          path="/home"
          element={
            <RequireAuth>
              <Home
                onLogout={() => {
                  localStorage.clear();
                  window.location.href = "/";
                }}
              />
            </RequireAuth>
          }
        />

        <Route
          path="/admin"
          element={
            <RequireAuth role="super-admin">
              <Admin
                onLogout={() => {
                  localStorage.clear();
                  window.location.href = "/";
                }}
              />
            </RequireAuth>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
