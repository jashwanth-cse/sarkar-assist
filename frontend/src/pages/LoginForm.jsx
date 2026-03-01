import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginForm() {
    const { login, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // If already logged in, redirect to dashboard
    useEffect(() => {
        if (!loading && isAuthenticated) {
            navigate("/dashboard", { replace: true });
        }
    }, [isAuthenticated, loading, navigate]);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) {
            setError("Please enter both email and password.");
            return;
        }
        setSubmitting(true);
        try {
            await login(form);
            navigate("/dashboard", { replace: true });
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "Invalid credentials. Please try again.";
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 opacity-95" />

            <div className="relative z-10 w-full max-w-md">
                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-3">
                        <svg viewBox="0 0 40 40" width="44" height="44">
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
                        <div className="text-left">
                            <p className="text-white text-2xl font-extrabold leading-none">SarkarAssist AI</p>
                            <p className="text-blue-300 text-xs mt-0.5">Powered by Digital India</p>
                        </div>
                    </div>
                    <p className="text-blue-200 text-sm">Sign in to check your scheme eligibility</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">Welcome back</h1>
                    <p className="text-gray-500 text-sm mb-6">Enter your credentials to continue</p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                        {/* Email */}
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="mb-6">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                required
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-blue-800 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {submitting ? "Signing in…" : "Sign In"}
                        </button>
                    </form>

                    {/* Footer links */}
                    <div className="mt-5 text-center text-sm text-gray-500">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-blue-700 font-semibold hover:underline">
                            Create one
                        </Link>
                    </div>
                    <div className="mt-3 text-center">
                        <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                            ← Back to home
                        </Link>
                    </div>
                </div>

                <p className="text-center text-blue-300 text-xs mt-6">
                    © 2026 SarkarAssist AI — Government of India
                </p>
            </div>
        </div>
    );
}
