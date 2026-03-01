import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
    { to: "/admin/schemes", icon: "📋", label: "Scheme Manager" },
    { to: "/dashboard", icon: "🏠", label: "Back to App" },
];

export default function AdminLayout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* ── Sidebar ──────────────────────────────────────── */}
            <aside className="w-56 bg-blue-900 flex flex-col shrink-0">
                {/* Logo */}
                <div className="px-5 py-5 border-b border-blue-800">
                    <p className="text-white font-bold text-base tracking-tight">SarkarAssist</p>
                    <p className="text-blue-400 text-xs font-medium mt-0.5">Admin Panel</p>
                </div>

                {/* User chip */}
                <div className="px-4 py-3 border-b border-blue-800">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {(user?.fullName ?? user?.email ?? "A")[0].toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-white text-xs font-semibold truncate">{user?.fullName ?? "Admin"}</p>
                            <p className="text-blue-400 text-[10px] truncate">{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-3 space-y-1">
                    {NAV.map(({ to, icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? "bg-white/15 text-white"
                                    : "text-blue-200 hover:bg-white/10 hover:text-white"}`
                            }
                        >
                            <span>{icon}</span>
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="px-3 pb-4">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-300 hover:text-red-100 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <span>🚪</span> Logout
                    </button>
                </div>
            </aside>

            {/* ── Main content ─────────────────────────────────── */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between shadow-sm">
                    <h1 className="text-lg font-bold text-blue-900">Admin — Scheme Management</h1>
                    <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                        Admin
                    </span>
                </header>
                <div className="flex-1 p-8 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
