import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/", { replace: true });
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <nav className="bg-white shadow-sm border-b-2 border-blue-800">
            <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
                {/* Logo */}
                <span className="text-xl font-bold text-blue-800 tracking-tight">
                    SarkarAssist AI
                </span>

                {/* Right section — only shown when logged in */}
                {user && (
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-700 font-medium">
                            {user.displayName}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
