import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import ProfileSwitcher from "./ProfileSwitcher";

export default function Navbar() {
    const { user, logout } = useAuth();
    const { primaryProfile } = useProfile();

    const displayName = primaryProfile?.fullName ?? user?.fullName ?? user?.email ?? "User";

    return (
        <nav className="bg-white shadow-sm border-b-2 border-blue-800">
            <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
                {/* Logo */}
                <Link to="/dashboard" className="text-xl font-bold text-blue-800 tracking-tight flex-shrink-0">
                    SarkarAssist AI
                </Link>

                {/* Nav links */}
                {user && (
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
                        <Link to="/dashboard" className="hover:text-blue-800 transition-colors">Dashboard</Link>
                        <Link to="/dashboard/family" className="hover:text-blue-800 transition-colors">Family</Link>
                        <Link to="/profile/setup" className="hover:text-blue-800 transition-colors">Edit Profile</Link>
                    </div>
                )}

                {/* Right section */}
                {user && (
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <ProfileSwitcher />
                        <span className="hidden md:block text-sm text-gray-600 font-medium truncate max-w-[120px]">
                            {displayName}
                        </span>
                        <button
                            onClick={logout}
                            className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
