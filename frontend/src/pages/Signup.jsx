import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Must be defined OUTSIDE Signup so React doesn't remount the input on every keystroke
function Field({ id, label, type = "text", placeholder, optional = false, value, onChange, error }) {
    return (
        <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
                {label}{" "}
                {optional && <span className="text-gray-400 font-normal">(optional)</span>}
            </label>
            <input
                id={id}
                name={id}
                type={type}
                autoComplete={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${error ? "border-red-400 bg-red-50" : "border-gray-300"
                    }`}
            />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

export default function Signup() {
    const { signup, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        mobile: "",
    });
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // If already logged in, go to dashboard
    useEffect(() => {
        if (!loading && isAuthenticated) {
            navigate("/dashboard", { replace: true });
        }
    }, [isAuthenticated, loading, navigate]);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
        setApiError("");
    };

    const validate = () => {
        const newErrors = {};
        if (!form.fullName.trim()) newErrors.fullName = "Full name is required.";
        if (!form.email.trim()) newErrors.email = "Email is required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            newErrors.email = "Enter a valid email address.";
        if (!form.password) newErrors.password = "Password is required.";
        else if (form.password.length < 6)
            newErrors.password = "Password must be at least 6 characters.";
        if (!form.confirmPassword) newErrors.confirmPassword = "Please confirm your password.";
        else if (form.password !== form.confirmPassword)
            newErrors.confirmPassword = "Passwords do not match.";
        if (form.mobile && !/^\d{10}$/.test(form.mobile))
            newErrors.mobile = "Enter a valid 10-digit mobile number.";
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setSubmitting(true);
        try {
            const { confirmPassword, ...payload } = form;
            if (!payload.mobile) delete payload.mobile;
            await signup(payload);
            navigate("/dashboard", { replace: true });
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "Registration failed. Please try again.";
            setApiError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 px-4 py-10">
            <div className="w-full max-w-md">
                {/* Brand */}
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
                    <p className="text-blue-200 text-sm">Create your account to get started</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">Create Account</h1>
                    <p className="text-gray-500 text-sm mb-6">Check your eligibility for 1,500+ schemes</p>

                    {apiError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
                            {apiError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                        <Field id="fullName" label="Full Name" placeholder="Rajesh Kumar" value={form.fullName} onChange={handleChange} error={errors.fullName} />
                        <Field id="email" label="Email Address" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} error={errors.email} />
                        <Field id="password" label="Password" type="password" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} error={errors.password} />
                        <Field id="confirmPassword" label="Confirm Password" type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
                        <Field id="mobile" label="Mobile Number" type="tel" placeholder="10-digit number" optional value={form.mobile} onChange={handleChange} error={errors.mobile} />

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-orange-500 hover:bg-orange-400 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-2"
                        >
                            {submitting ? "Creating account…" : "Create Account"}
                        </button>
                    </form>

                    <div className="mt-5 text-center text-sm text-gray-500">
                        Already have an account?{" "}
                        <Link to="/login" className="text-blue-700 font-semibold hover:underline">
                            Sign in
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
