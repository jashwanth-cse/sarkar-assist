import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wraps private routes.
 * - Shows a loading screen while the auth state is being resolved (token vs /auth/me check).
 * - Redirects unauthenticated visitors to /login.
 * - Renders nested routes via <Outlet> when authenticated.
 */
export default function ProtectedRoute() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen">
                <span className="loading-spinner" />
                <p>Loading…</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
