import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* ── Scheme card data ─────────────────────────────────── */
const SCHEMES = [
    {
        id: "agriculture",
        img: "/scheme-agriculture.png",
        badge: "Agriculture",
        badgeColor: "bg-green-600",
        title: "PM-KISAN Samman Nidhi",
        desc: "Direct income support of ₹6,000 per year to small and marginal farmers. Benefit released in three equal instalments directly to the bank account.",
        tag: "Farmers · Land Holders",
    },
    {
        id: "education",
        img: "/scheme-education.png",
        badge: "Education",
        badgeColor: "bg-blue-700",
        title: "National Scholarship Portal",
        desc: "Centralised scholarship platform offering 50+ scholarships for SC, ST, OBC, minorities and merit students from Class 1 to Post-Doctoral level.",
        tag: "Students · SC/ST/OBC/Minority",
    },
    {
        id: "housing",
        img: "/scheme-housing.png",
        badge: "Housing",
        badgeColor: "bg-orange-600",
        title: "Pradhan Mantri Awas Yojana",
        desc: "Affordable housing for all — urban and rural beneficiaries receive interest subsidies up to 6.5% on home loans under CLSS component.",
        tag: "Urban · Rural · EWS / LIG / MIG",
    },
    {
        id: "health",
        img: "/scheme-health.png",
        badge: "Healthcare",
        badgeColor: "bg-red-600",
        title: "Ayushman Bharat PM-JAY",
        desc: "World's largest health assurance scheme providing ₹5 lakh cover per family per year for hospitalisation at over 27,000 empanelled hospitals.",
        tag: "All Citizens · BPL Families",
    },
];

const STATS = [
    { value: "1500+", label: "Active Schemes" },
    { value: "80 Cr+", label: "Beneficiaries" },
    { value: "28", label: "States & UTs Covered" },
    { value: "10+", label: "Ministries Integrated" },
];

/* ─────────────────────────────────────────────────────── */

export default function Login() {
    const { user, loading, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            navigate("/dashboard", { replace: true });
        }
    }, [user, loading, navigate]);

    const handleLogin = async () => {
        try {
            await loginWithGoogle();
        } catch (error) {
            console.error("Google sign-in failed:", error);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100 font-sans">

            {/* ══════════════ HEADER ══════════════ */}
            <header className="bg-blue-900 text-white">
                {/* Top strip */}
                <div className="bg-blue-950 text-xs text-blue-300 text-center py-1 tracking-wide">
                    Government of India — Official Scheme Intelligence Platform
                </div>

                {/* Main nav */}
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        {/* Ashoka Chakra SVG */}
                        <svg viewBox="0 0 40 40" width="40" height="40" className="flex-shrink-0">
                            <circle cx="20" cy="20" r="18" fill="none" stroke="#f97316" strokeWidth="2" />
                            <circle cx="20" cy="20" r="6" fill="#f97316" />
                            {Array.from({ length: 24 }).map((_, i) => {
                                const angle = (i * 360) / 24;
                                const rad = (angle * Math.PI) / 180;
                                const x1 = 20 + 8 * Math.cos(rad);
                                const y1 = 20 + 8 * Math.sin(rad);
                                const x2 = 20 + 16 * Math.cos(rad);
                                const y2 = 20 + 16 * Math.sin(rad);
                                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f97316" strokeWidth="1.2" />;
                            })}
                        </svg>
                        <div>
                            <p className="text-xl font-bold tracking-tight leading-none">SarkarAssist AI</p>
                            <p className="text-xs text-blue-300 leading-tight mt-0.5">Powered by Digital India</p>
                        </div>
                    </div>

                    {/* Nav links */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-blue-100">
                        <a href="#schemes" className="hover:text-white transition-colors">Schemes</a>
                        <a href="#about" className="hover:text-white transition-colors">About</a>
                        <a href="#contact" className="hover:text-white transition-colors">Contact</a>
                    </nav>

                    {/* CTA */}
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                        Sign In with Google
                    </button>
                </div>
            </header>

            {/* ══════════════ HERO ══════════════ */}
            <section className="relative overflow-hidden">
                <img
                    src="/hero.png"
                    alt="Indian Parliament building"
                    className="w-full h-[480px] object-cover object-center"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-900/70 to-transparent flex items-center">
                    <div className="max-w-7xl mx-auto px-6 w-full">
                        <div className="max-w-lg">
                            <span className="inline-block bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                                AI-Powered Platform
                            </span>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
                                Find Government Schemes <span className="text-orange-400">Made for You</span>
                            </h1>
                            <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                                Answer a few questions about your profile. Our AI instantly matches you with the right Central &amp; State schemes across Agriculture, Education, Health, Housing and more.
                            </p>
                            <button
                                onClick={handleLogin}
                                disabled={loading}
                                className="flex items-center gap-3 bg-white text-blue-900 font-bold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl hover:bg-blue-50 transition-all disabled:opacity-50 text-base"
                            >
                                <svg viewBox="0 0 48 48" width="22" height="22" aria-hidden="true">
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                </svg>
                                Check Your Eligibility Free
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════ STATS STRIP ══════════════ */}
            <section className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    {STATS.map(({ value, label }) => (
                        <div key={label}>
                            <p className="text-3xl font-extrabold text-blue-800">{value}</p>
                            <p className="text-sm text-gray-500 mt-1">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════ SCHEME CARDS ══════════════ */}
            <section id="schemes" className="max-w-7xl mx-auto px-6 py-16">
                <div className="text-center mb-12">
                    <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">Featured Schemes</span>
                    <h2 className="text-3xl font-extrabold text-blue-900 mt-2">
                        Popular Government Schemes
                    </h2>
                    <p className="text-gray-500 mt-3 max-w-xl mx-auto">
                        Millions of Indians benefit from these schemes every year. Sign in to check if you qualify.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {SCHEMES.map((s) => (
                        <div
                            key={s.id}
                            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
                        >
                            {/* Image */}
                            <div className="relative h-52 overflow-hidden">
                                <img
                                    src={s.img}
                                    alt={s.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <span className={`absolute top-4 left-4 ${s.badgeColor} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
                                    {s.badge}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-2">{s.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed mb-4">{s.desc}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-3 py-1">
                                        {s.tag}
                                    </span>
                                    <button
                                        onClick={handleLogin}
                                        className="text-sm font-semibold text-blue-800 hover:text-orange-500 transition-colors"
                                    >
                                        Check Eligibility →
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════ HOW IT WORKS ══════════════ */}
            <section id="about" className="bg-blue-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-extrabold mb-3">How SarkarAssist AI Works</h2>
                    <p className="text-blue-200 mb-12 max-w-xl mx-auto">
                        From sign-in to eligibility report in under 60 seconds.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: "01", title: "Sign In with Google", desc: "Secure, one-click login. No passwords to remember." },
                            { step: "02", title: "Complete Your Profile", desc: "Enter age, income, state and category. Takes less than a minute." },
                            { step: "03", title: "Get Matched Instantly", desc: "Our AI scans 1,500+ schemes and shows your personalised list." },
                        ].map(({ step, title, desc }) => (
                            <div key={step} className="bg-blue-800 rounded-2xl p-8 text-left hover:bg-blue-700 transition-colors">
                                <p className="text-4xl font-black text-orange-400 mb-4">{step}</p>
                                <h3 className="text-lg font-bold mb-2">{title}</h3>
                                <p className="text-blue-200 text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════ CTA BANNER ══════════════ */}
            <section className="bg-orange-500 py-12 text-center text-white">
                <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
                    Don't miss out on benefits you deserve
                </h2>
                <p className="mb-6 text-orange-100 text-sm">Free to use. Powered by Government of India data.</p>
                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="bg-white text-orange-600 font-bold px-8 py-3 rounded-xl hover:bg-orange-50 transition-colors shadow-md disabled:opacity-50"
                >
                    Get Started — It's Free
                </button>
            </section>

            {/* ══════════════ FOOTER ══════════════ */}
            <footer id="contact" className="bg-blue-950 text-blue-300 py-12">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Brand */}
                    <div>
                        <p className="text-white text-lg font-bold mb-2">SarkarAssist AI</p>
                        <p className="text-sm leading-relaxed">
                            An AI-powered platform helping Indian citizens discover and access government welfare schemes effortlessly.
                        </p>
                    </div>

                    {/* Quick links */}
                    <div>
                        <p className="text-white font-semibold mb-3 uppercase text-xs tracking-widest">Quick Links</p>
                        <ul className="space-y-2 text-sm">
                            {["Agriculture Schemes", "Education Schemes", "Housing Schemes", "Health Schemes"].map((l) => (
                                <li key={l}>
                                    <a href="#schemes" className="hover:text-white transition-colors">{l}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Official links */}
                    <div>
                        <p className="text-white font-semibold mb-3 uppercase text-xs tracking-widest">Official Portals</p>
                        <ul className="space-y-2 text-sm">
                            {[
                                { label: "india.gov.in", url: "https://india.gov.in" },
                                { label: "myscheme.gov.in", url: "https://www.myscheme.gov.in" },
                                { label: "umang.gov.in", url: "https://web.umang.gov.in" },
                            ].map(({ label, url }) => (
                                <li key={label}>
                                    <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                        {label} ↗
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 mt-10 pt-6 border-t border-blue-900 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-blue-500">
                    <p>© 2026 SarkarAssist AI — Built for the citizens of India 🇮🇳</p>
                    <p>Data sourced from official Government of India portals.</p>
                </div>
            </footer>
        </div>
    );
}
