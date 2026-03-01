import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProfile } from "../api/profile.api";
import { useProfile } from "../context/ProfileContext";
import Layout from "../components/Layout";

const CATEGORIES = [
    { value: "", label: "Select category" },
    { value: "general", label: "General" },
    { value: "obc", label: "OBC" },
    { value: "sc", label: "SC" },
    { value: "st", label: "ST" },
    { value: "ews", label: "EWS" },
];

const INDIAN_STATES = [
    { value: "", label: "Select state" },
    { value: "andhra_pradesh", label: "Andhra Pradesh" },
    { value: "arunachal_pradesh", label: "Arunachal Pradesh" },
    { value: "assam", label: "Assam" },
    { value: "bihar", label: "Bihar" },
    { value: "chhattisgarh", label: "Chhattisgarh" },
    { value: "goa", label: "Goa" },
    { value: "gujarat", label: "Gujarat" },
    { value: "haryana", label: "Haryana" },
    { value: "himachal_pradesh", label: "Himachal Pradesh" },
    { value: "jharkhand", label: "Jharkhand" },
    { value: "karnataka", label: "Karnataka" },
    { value: "kerala", label: "Kerala" },
    { value: "madhya_pradesh", label: "Madhya Pradesh" },
    { value: "maharashtra", label: "Maharashtra" },
    { value: "manipur", label: "Manipur" },
    { value: "meghalaya", label: "Meghalaya" },
    { value: "mizoram", label: "Mizoram" },
    { value: "nagaland", label: "Nagaland" },
    { value: "odisha", label: "Odisha" },
    { value: "punjab", label: "Punjab" },
    { value: "rajasthan", label: "Rajasthan" },
    { value: "sikkim", label: "Sikkim" },
    { value: "tamil_nadu", label: "Tamil Nadu" },
    { value: "telangana", label: "Telangana" },
    { value: "tripura", label: "Tripura" },
    { value: "uttar_pradesh", label: "Uttar Pradesh" },
    { value: "uttarakhand", label: "Uttarakhand" },
    { value: "west_bengal", label: "West Bengal" },
    { value: "delhi", label: "Delhi (NCT)" },
    { value: "jammu_kashmir", label: "Jammu & Kashmir" },
    { value: "ladakh", label: "Ladakh" },
];

const initialForm = { age: "", income: "", category: "", state: "" };

const inputBase =
    "w-full border border-gray-300 rounded-md p-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed";
const inputError = "border-red-500 focus:ring-red-400";

export default function ProfileSetup() {
    const { setProfile } = useProfile();
    const navigate = useNavigate();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const next = {};
        const age = Number(form.age);
        const income = Number(form.income);

        if (!form.age || isNaN(age) || age <= 0 || !Number.isInteger(age)) {
            next.age = "Enter a valid age (positive whole number).";
        }
        if (form.income === "" || isNaN(income) || income < 0) {
            next.income = "Enter a valid annual income (0 or more).";
        }
        if (!form.category) next.category = "Please select a category.";
        if (!form.state) next.state = "Please select a state.";

        return next;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError(null);

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                age: Number(form.age),
                income: Number(form.income),
                category: form.category,
                state: form.state,
            };
            const created = await createProfile(payload);
            setProfile(created);
            navigate("/dashboard", { replace: true });
        } catch (error) {
            console.error("[ProfileSetup] createProfile failed:", error);
            setServerError(
                error.response?.data?.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout>
            <div className="bg-white rounded-xl shadow-md p-8 max-w-2xl mx-auto mt-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-blue-800">
                        Complete Your Profile
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        This information is used to determine scheme eligibility.
                    </p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="grid grid-cols-2 gap-6">
                        {/* Age */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="age" className="text-sm font-medium text-gray-700">
                                Age
                            </label>
                            <input
                                id="age"
                                name="age"
                                type="number"
                                min="1"
                                max="120"
                                placeholder="e.g. 28"
                                value={form.age}
                                onChange={handleChange}
                                disabled={submitting}
                                className={`${inputBase} ${errors.age ? inputError : ""}`}
                            />
                            {errors.age && (
                                <span className="text-xs text-red-500">{errors.age}</span>
                            )}
                        </div>

                        {/* Annual Income */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="income" className="text-sm font-medium text-gray-700">
                                Annual Income (₹)
                            </label>
                            <input
                                id="income"
                                name="income"
                                type="number"
                                min="0"
                                placeholder="e.g. 350000"
                                value={form.income}
                                onChange={handleChange}
                                disabled={submitting}
                                className={`${inputBase} ${errors.income ? inputError : ""}`}
                            />
                            {errors.income && (
                                <span className="text-xs text-red-500">{errors.income}</span>
                            )}
                        </div>

                        {/* Category */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="category" className="text-sm font-medium text-gray-700">
                                Category
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                disabled={submitting}
                                className={`${inputBase} ${errors.category ? inputError : ""}`}
                            >
                                {CATEGORIES.map(({ value, label }) => (
                                    <option key={value} value={value} disabled={value === ""}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                            {errors.category && (
                                <span className="text-xs text-red-500">{errors.category}</span>
                            )}
                        </div>

                        {/* State */}
                        <div className="flex flex-col gap-1">
                            <label htmlFor="state" className="text-sm font-medium text-gray-700">
                                State / UT
                            </label>
                            <select
                                id="state"
                                name="state"
                                value={form.state}
                                onChange={handleChange}
                                disabled={submitting}
                                className={`${inputBase} ${errors.state ? inputError : ""}`}
                            >
                                {INDIAN_STATES.map(({ value, label }) => (
                                    <option key={value} value={value} disabled={value === ""}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                            {errors.state && (
                                <span className="text-xs text-red-500">{errors.state}</span>
                            )}
                        </div>

                        {/* Server Error */}
                        {serverError && (
                            <div className="col-span-2">
                                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                                    {serverError}
                                </p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="col-span-2 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg mt-4 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? "Saving…" : "Save & Continue"}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
