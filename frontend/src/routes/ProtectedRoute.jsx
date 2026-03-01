import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wraps private routes.
 * - Renders a loading indicator while auth state is resolving.
 * - Redirects unauthenticated visitors to the login page.
 * - Renders nested <Route> elements via <Outlet> when authenticated.
 */
export default function ProtectedRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen">
                <span className="loading-spinner" />
                <p>Loading…</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
