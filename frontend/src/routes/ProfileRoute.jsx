import { Navigate, Outlet } from "react-router-dom";
import { useProfile } from "../context/ProfileContext";

/**
 * Sits inside ProtectedRoute (auth is already guaranteed).
 * Guards routes that require a profile to exist.
 *
 * - loading  → show spinner
 * - !profile → redirect to /profile/setup
 * - profile  → render child routes via <Outlet />
 */
export default function ProfileRoute() {
    const { profile, loading } = useProfile();

    if (loading) {
        return (
            <div className="loading-screen">
                <span className="loading-spinner" />
                <p>Loading profile…</p>
            </div>
        );
    }

    if (!profile) {
        return <Navigate to="/profile/setup" replace />;
    }

    return <Outlet />;
}
