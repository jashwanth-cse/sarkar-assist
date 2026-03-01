import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import ProfileRoute from "./routes/ProfileRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProfileSetup from "./pages/ProfileSetup";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />

        {/* Auth-gated routes */}
        <Route element={<ProtectedRoute />}>
          {/* Profile setup — accessible without a profile (new users land here) */}
          <Route path="/profile/setup" element={<ProfileSetup />} />

          {/* Profile-gated routes — redirect to /profile/setup if no profile */}
          <Route element={<ProfileRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

