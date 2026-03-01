import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Guards routes that require role === "admin".
 * Must be nested inside ProtectedRoute (auth already guaranteed).
 *
 *  loading  → spinner
 * !admin   → redirect to /dashboard
 *  admin   → render child routes
 */
export default function AdminRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm gap-3">
                <svg className="animate-spin h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Verifying access…
            </div>
        );
    }

    if (user?.role !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
