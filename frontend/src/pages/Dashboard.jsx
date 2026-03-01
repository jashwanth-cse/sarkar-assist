import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { getSchemes } from "../api/scheme.api";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import SchemeCard from "../components/SchemeCard";

export default function Dashboard() {
    const { user, logout } = useAuth();
    const { profile } = useProfile();
    const navigate = useNavigate();

    // ── Schemes state ──────────────────────────────────────
    const [schemes, setSchemes] = useState([]);
    const [schemesLoading, setSchemesLoading] = useState(true);
    const [schemesError, setSchemesError] = useState(null);

    // Fetch once on mount — no extra deps to avoid infinite loop
    useEffect(() => {
        let cancelled = false;

        async function fetchSchemes() {
            setSchemesLoading(true);
            setSchemesError(null);
            try {
                const data = await getSchemes();
                if (!cancelled) setSchemes(data);
            } catch (err) {
                console.error("[Dashboard] getSchemes failed:", err);
                if (!cancelled) {
                    setSchemesError(
                        err.response?.data?.message ||
                        "Failed to load schemes. Please try again later."
                    );
                }
            } finally {
                if (!cancelled) setSchemesLoading(false);
            }
        }

        fetchSchemes();
        return () => { cancelled = true; }; // cleanup on unmount
    }, []); // empty deps → run once

    // ── Logout ─────────────────────────────────────────────
    const handleLogout = async () => {
        try {
            await logout();
            navigate("/", { replace: true });
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const formatIncome = (amount) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);

    return (
        <Layout>
            {/* ── Section 1: Welcome ──────────────────────────── */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="flex items-center gap-4">
                    {user?.photoURL && (
                        <img
                            src={user.photoURL}
                            alt={user.displayName}
                            referrerPolicy="no-referrer"
                            className="w-14 h-14 rounded-full border-2 border-blue-200 flex-shrink-0"
                        />
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Welcome, {user?.displayName}
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm">
                            Discover government schemes tailored for you.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Section 2: Profile Overview ─────────────────── */}
            {profile && (
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Your Profile Overview
                        </h2>
                        <StatusBadge type="success">Profile Complete</StatusBadge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Age</p>
                            <p className="text-gray-800 font-semibold mt-1">{profile.age} years</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Annual Income</p>
                            <p className="text-gray-800 font-semibold mt-1">{formatIncome(profile.income)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Category</p>
                            <p className="text-gray-800 font-semibold mt-1 uppercase">{profile.category}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">State / UT</p>
                            <p className="text-gray-800 font-semibold mt-1 capitalize">
                                {profile.state?.replace(/_/g, " ")}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Section 3: Available Schemes ─────────────────── */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-5">
                    Available Schemes
                </h2>

                {/* Loading */}
                {schemesLoading && (
                    <div className="flex items-center justify-center py-16 text-gray-500 text-sm">
                        <svg
                            className="animate-spin mr-3 h-5 w-5 text-blue-700"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Loading schemes…
                    </div>
                )}

                {/* Error */}
                {!schemesLoading && schemesError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-600 text-sm">
                        {schemesError}
                    </div>
                )}

                {/* Empty */}
                {!schemesLoading && !schemesError && schemes.length === 0 && (
                    <div className="bg-white rounded-xl shadow-md p-10 text-center text-gray-400 text-sm">
                        No schemes found for your profile at this time.
                    </div>
                )}

                {/* Schemes Grid */}
                {!schemesLoading && !schemesError && schemes.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {schemes.map((scheme) => (
                            <SchemeCard key={scheme.id} scheme={scheme} />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
