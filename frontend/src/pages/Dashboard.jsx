import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { getEligibility } from "../api/profile.api";
import Layout from "../components/Layout";
import SchemeCard from "../components/SchemeCard";
import SchemeFilters from "../components/SchemeFilters";
import StatusBadge from "../components/StatusBadge";
import FamilyList from "../components/FamilyList";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcAge(dob) {
    if (!dob) return null;
    const birth = new Date(dob);
    if (isNaN(birth)) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const hadBirthday =
        today.getMonth() > birth.getMonth() ||
        (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
    if (!hadBirthday) age--;
    return age >= 0 ? age : null;
}

function fmt(v) { return (v === null || v === undefined) ? "—" : v; }
function fmtIncome(v) {
    if (v === null || v === undefined) return "—";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);
}

function Spinner() {
    return (
        <div className="flex items-center justify-center py-16 text-gray-400 text-sm gap-3">
            <svg className="animate-spin h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Checking eligibility…
        </div>
    );
}

function StatPill({ label, value, accent }) {
    const colors = {
        green: "border-green-200 bg-green-50 text-green-700",
        amber: "border-amber-200 bg-amber-50 text-amber-700",
        red: "border-red-200 bg-red-50 text-red-600",
        blue: "border-blue-200 bg-blue-50 text-blue-700",
    };
    return (
        <div className={`rounded-xl border px-4 py-3 text-center ${colors[accent] ?? colors.blue}`}>
            <p className="text-2xl font-bold leading-none">{value}</p>
            <p className="text-xs font-medium mt-1 opacity-80">{label}</p>
        </div>
    );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
    const { user } = useAuth();
    const { primaryProfile, activeProfile } = useProfile();

    const [allSchemes, setAllSchemes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ search: "", status: "", category: "" });

    // ── Fetch eligibility whenever active profile changes ────
    const fetchSchemes = useCallback(async (profileId) => {
        setLoading(true);
        setError(null);
        setFilters({ search: "", status: "", category: "" }); // reset on switch
        try {
            const data = await getEligibility(profileId);
            setAllSchemes(Array.isArray(data) ? data : data?.schemes ?? []);
        } catch (err) {
            console.error("[Dashboard] getEligibility failed:", err);
            setError(err.response?.data?.message || "Failed to load eligibility. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeProfile?._id) fetchSchemes(activeProfile._id);
    }, [activeProfile?._id, fetchSchemes]);

    // ── Filter logic ─────────────────────────────────────────
    const handleFilterChange = (key, val) => setFilters((p) => ({ ...p, [key]: val }));

    const filteredSchemes = useMemo(() => {
        return allSchemes.filter((s) => {
            const matchName = !filters.search ||
                (s.schemeName ?? "").toLowerCase().includes(filters.search.toLowerCase());
            const matchStatus = !filters.status || s.eligibilityStatus === filters.status;
            const matchCat = !filters.category || s.category === filters.category;
            return matchName && matchStatus && matchCat;
        });
    }, [allSchemes, filters]);

    // ── Summary stats ─────────────────────────────────────────
    const stats = useMemo(() => ({
        total: allSchemes.length,
        eligible: allSchemes.filter((s) => s.eligibilityStatus === "eligible").length,
        partial: allSchemes.filter((s) => s.eligibilityStatus === "partial").length,
        notEligible: allSchemes.filter((s) => s.eligibilityStatus === "not_eligible").length,
    }), [allSchemes]);

    // ── Profile metadata ──────────────────────────────────────
    const age = calcAge(activeProfile?.dateOfBirth);
    const greetName = primaryProfile?.fullName?.split(" ")[0] ?? user?.email ?? "there";
    const isFamily = activeProfile && primaryProfile && activeProfile._id !== primaryProfile._id;

    const tiles = [
        { label: "Age", value: age !== null ? `${age} yrs` : "—" },
        { label: "Income", value: fmtIncome(activeProfile?.annualIncome ?? activeProfile?.income) },
        { label: "Category", value: fmt(activeProfile?.casteCategory ?? activeProfile?.category)?.toUpperCase() },
        { label: "State", value: fmt(activeProfile?.state) },
        { label: "Employment", value: fmt(activeProfile?.employmentStatus) },
        { label: "Education", value: fmt(activeProfile?.educationLevel) },
    ];

    return (
        <Layout>
            {/* ── Welcome ───────────────────────────────────────── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Welcome back, {greetName}! 👋
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">
                            Discover government schemes tailored for you and your family.
                        </p>
                    </div>
                    <Link to="/profile/setup"
                        className="text-sm font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors self-start sm:self-auto">
                        ✏️ Edit Profile
                    </Link>
                </div>
            </div>

            {/* ── Active Profile Overview ───────────────────────── */}
            {activeProfile && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-700 text-white font-bold text-base flex items-center justify-center flex-shrink-0">
                                {(activeProfile.fullName ?? "U")[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 text-sm">{activeProfile.fullName}</p>
                                {isFamily && (
                                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                                        {activeProfile.relation ?? "Family Member"}
                                    </span>
                                )}
                            </div>
                        </div>
                        <StatusBadge type="success">Profile Active</StatusBadge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                        {tiles.map(({ label, value }) => (
                            <div key={label} className="bg-gray-50 rounded-lg p-2.5 text-center">
                                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-0.5">{label}</p>
                                <p className="text-xs text-gray-800 font-bold capitalize leading-tight">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Summary Stats ──────────────────────────────────── */}
            {allSchemes.length > 0 && !loading && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    <StatPill label="Total Schemes" value={stats.total} accent="blue" />
                    <StatPill label="Eligible" value={stats.eligible} accent="green" />
                    <StatPill label="Partial" value={stats.partial} accent="amber" />
                    <StatPill label="Not Eligible" value={stats.notEligible} accent="red" />
                </div>
            )}

            {/* ── Schemes Section ───────────────────────────────── */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-800">
                        {isFamily
                            ? `Schemes for ${activeProfile?.fullName?.split(" ")[0]}`
                            : "Your Eligible Schemes"}
                    </h2>
                    {!loading && filteredSchemes.length > 0 && (
                        <span className="text-xs text-gray-400 font-medium">
                            Showing {filteredSchemes.length} of {allSchemes.length}
                        </span>
                    )}
                </div>

                {/* Filters */}
                {!loading && allSchemes.length > 0 && (
                    <SchemeFilters schemes={allSchemes} filters={filters} onChange={handleFilterChange} />
                )}

                {/* States */}
                {loading && <Spinner />}

                {!loading && error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-600 text-sm">{error}</div>
                )}

                {!loading && !error && allSchemes.length === 0 && (
                    <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
                        No schemes found for this profile at this time.
                    </div>
                )}

                {!loading && !error && allSchemes.length > 0 && filteredSchemes.length === 0 && (
                    <div className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center text-gray-400 text-sm">
                        No schemes match your current filters.
                    </div>
                )}

                {!loading && !error && filteredSchemes.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredSchemes.map((scheme) => (
                            <SchemeCard key={scheme._id ?? scheme.id} scheme={scheme} />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Family Section ───────────────────────────────── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <FamilyList />
            </div>
        </Layout>
    );
}
