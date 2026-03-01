import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import ProfileRoute from "./routes/ProfileRoute";
import AdminRoute from "./routes/AdminRoute";
import Login from "./pages/Login";
import LoginForm from "./pages/LoginForm";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProfileSetup from "./pages/ProfileSetup";
import FamilyManagement from "./pages/FamilyManagement";
import SchemeManager from "./pages/admin/SchemeManager";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ───────────────────────────────────────── */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<Signup />} />

        {/* ── Auth-gated ───────────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          {/* Profile setup (accessible without a profile) */}
          <Route path="/profile/setup" element={<ProfileSetup />} />

          {/* Profile-gated (redirect to /profile/setup if no profile) */}
          <Route element={<ProfileRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/family" element={<FamilyManagement />} />
          </Route>

          {/* Admin-gated (redirect to /dashboard if not admin) */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/schemes" element={<SchemeManager />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
