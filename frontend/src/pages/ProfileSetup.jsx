import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { createProfile, updateProfile } from "../api/profile.api";
import { useProfile } from "../context/ProfileContext";
import Layout from "../components/Layout";

// ─── Constants ────────────────────────────────────────────────────────────────

const INDIAN_STATES = [
    "", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
    "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
    "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
    "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi (NCT)", "Jammu & Kashmir", "Ladakh",
    "Andaman & Nicobar Islands", "Chandigarh", "Dadra & Nagar Haveli",
    "Daman & Diu", "Lakshadweep", "Puducherry",
];

const EDUCATION_LEVELS = [
    "", "No Formal Education", "Primary (1–5)", "Upper Primary (6–8)",
    "Secondary (9–10)", "Higher Secondary (11–12)", "Diploma / ITI",
    "Graduate", "Post Graduate", "Doctorate",
];

const EMPLOYMENT_STATUSES = [
    "", "Student", "Unemployed", "Self-Employed", "Wage / Daily Labour",
    "Salaried (Private)", "Salaried (Government)", "Farmer",
    "Retired", "Homemaker", "Other",
];

const RATION_CARD_TYPES = ["", "APL", "BPL", "Antyodaya (AAY)", "None"];

const EMPTY_FORM = {
    fullName: "",
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    state: "",
    district: "",
    ruralUrban: "",
    annualIncome: "",
    bpl: false,
    rationCardType: "",
    casteCategory: "",
    minority: false,
    disability: false,
    educationLevel: "",
    currentlyStudying: false,
    employmentStatus: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Calculate age in full years from a DOB string (YYYY-MM-DD). Returns null if invalid. */
function calcAge(dob) {
    if (!dob) return null;
    const birth = new Date(dob);
    if (isNaN(birth)) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const hadBirthday =
        today.getMonth() > birth.getMonth() ||
        (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
    if (!hadBirthday) age -= 1;
    return age >= 0 ? age : null;
}

/** Validate required / format constraints. Returns an errors object. */
function validateForm(form) {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required.";
    if (!form.dateOfBirth) {
        e.dateOfBirth = "Date of birth is required.";
    } else {
        const age = calcAge(form.dateOfBirth);
        if (age === null || age < 1 || age > 120)
            e.dateOfBirth = "Enter a valid date of birth.";
    }
    if (!form.gender) e.gender = "Please select gender.";
    if (!form.maritalStatus) e.maritalStatus = "Please select marital status.";
    if (!form.state) e.state = "Please select a state.";
    if (!form.district.trim()) e.district = "District is required.";
    if (!form.ruralUrban) e.ruralUrban = "Please select Rural or Urban.";
    if (form.annualIncome === "" || Number(form.annualIncome) < 0)
        e.annualIncome = "Enter a valid annual income (0 or more).";
    if (!form.casteCategory) e.casteCategory = "Please select a caste category.";
    if (!form.educationLevel) e.educationLevel = "Please select education level.";
    if (!form.employmentStatus) e.employmentStatus = "Please select employment status.";
    return e;
}

// ─── Sub-components (defined outside to prevent remount) ─────────────────────

function SectionTitle({ step, title, subtitle }) {
    return (
        <div className="mb-5 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-800 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {step}
                </span>
                <div>
                    <h2 className="text-base font-semibold text-blue-900">{title}</h2>
                    {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
                </div>
            </div>
        </div>
    );
}

function TextField({ id, label, placeholder, value, onChange, error, disabled, type = "text", required = false }) {
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="text-sm font-medium text-gray-700">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <input
                id={id} name={id} type={type} placeholder={placeholder}
                value={value} onChange={onChange} disabled={disabled}
                className={`w-full border rounded-md px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition disabled:opacity-50 ${error ? "border-red-400 bg-red-50" : "border-gray-300"}`}
            />
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
}

function SelectField({ id, label, options, value, onChange, error, disabled, required = false }) {
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="text-sm font-medium text-gray-700">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <select
                id={id} name={id} value={value} onChange={onChange} disabled={disabled}
                className={`w-full border rounded-md px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition disabled:opacity-50 bg-white ${error ? "border-red-400 bg-red-50" : "border-gray-300"}`}
            >
                {options.map((opt) =>
                    typeof opt === "string"
                        ? <option key={opt} value={opt} disabled={opt === ""}>{opt === "" ? `Select ${label.replace(" *", "")}` : opt}</option>
                        : <option key={opt.value} value={opt.value} disabled={opt.value === ""}>{opt.label}</option>
                )}
            </select>
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
}

function CheckboxField({ id, label, sublabel, checked, onChange, disabled }) {
    return (
        <label htmlFor={id} className="flex items-start gap-3 cursor-pointer group">
            <input
                id={id} name={id} type="checkbox" checked={checked}
                onChange={onChange} disabled={disabled}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-blue-700 cursor-pointer"
            />
            <div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-800 transition">{label}</span>
                {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
            </div>
        </label>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProfileSetup() {
    const { profile, setProfile } = useProfile();
    const navigate = useNavigate();

    // Pre-fill from existing profile when editing
    const [form, setForm] = useState(() => {
        if (!profile) return EMPTY_FORM;
        return {
            fullName: profile.fullName ?? "",
            dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : "",
            gender: profile.gender ?? "",
            maritalStatus: profile.maritalStatus ?? "",
            state: profile.state ?? "",
            district: profile.district ?? "",
            ruralUrban: profile.ruralUrban ?? "",
            annualIncome: profile.annualIncome !== undefined ? String(profile.annualIncome) : "",
            bpl: profile.bpl ?? false,
            rationCardType: profile.rationCardType ?? "",
            casteCategory: profile.casteCategory ?? "",
            minority: profile.minority ?? false,
            disability: profile.disability ?? false,
            educationLevel: profile.educationLevel ?? "",
            currentlyStudying: profile.currentlyStudying ?? false,
            employmentStatus: profile.employmentStatus ?? "",
        };
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState(null);

    const isEdit = Boolean(profile);

    // Derived age preview (not sent to backend)
    const agePreview = useMemo(() => calcAge(form.dateOfBirth), [form.dateOfBirth]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
        setServerError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError(null);

        const validationErrors = validateForm(form);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            // Scroll to first error
            const firstKey = Object.keys(validationErrors)[0];
            document.getElementById(firstKey)?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        // Build payload — no age field sent
        const payload = {
            fullName: form.fullName.trim(),
            dateOfBirth: form.dateOfBirth,
            gender: form.gender,
            maritalStatus: form.maritalStatus,
            state: form.state,
            district: form.district.trim(),
            ruralUrban: form.ruralUrban,
            annualIncome: Number(form.annualIncome),
            bpl: form.bpl,
            rationCardType: form.rationCardType || null,
            casteCategory: form.casteCategory,
            minority: form.minority,
            disability: form.disability,
            educationLevel: form.educationLevel,
            currentlyStudying: form.currentlyStudying,
            employmentStatus: form.employmentStatus,
        };

        setSubmitting(true);
        try {
            const saved = isEdit
                ? await updateProfile(payload)
                : await createProfile(payload);
            setProfile(saved);
            navigate("/dashboard", { replace: true });
        } catch (error) {
            console.error("[ProfileSetup] submit failed:", error);
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
            <div className="max-w-4xl mx-auto mt-6 mb-10">
                {/* Page header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-blue-900">
                        {isEdit ? "Update Your Profile" : "Complete Your Profile"}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        This information is used to match you with the right government schemes.
                    </p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="space-y-6">

                        {/* ── SECTION 1: Basic Details ─────────────────────── */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <SectionTitle step="1" title="Basic Details" subtitle="Personal identification information" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <TextField
                                    id="fullName" label="Full Name" placeholder="e.g. Rajesh Kumar"
                                    value={form.fullName} onChange={handleChange}
                                    error={errors.fullName} disabled={submitting} required
                                />
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
                                        Date of Birth<span className="text-red-500 ml-0.5">*</span>
                                    </label>
                                    <input
                                        id="dateOfBirth" name="dateOfBirth" type="date"
                                        value={form.dateOfBirth} onChange={handleChange}
                                        max={new Date().toISOString().slice(0, 10)}
                                        disabled={submitting}
                                        className={`w-full border rounded-md px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition disabled:opacity-50 ${errors.dateOfBirth ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                                    />
                                    {agePreview !== null && (
                                        <span className="text-xs text-blue-600 font-medium">Age: {agePreview} years</span>
                                    )}
                                    {errors.dateOfBirth && <span className="text-xs text-red-500">{errors.dateOfBirth}</span>}
                                </div>
                                <SelectField
                                    id="gender" label="Gender"
                                    options={["", "Male", "Female", "Other", "Prefer not to say"]}
                                    value={form.gender} onChange={handleChange}
                                    error={errors.gender} disabled={submitting} required
                                />
                                <SelectField
                                    id="maritalStatus" label="Marital Status"
                                    options={["", "Single", "Married", "Widowed", "Divorced", "Separated"]}
                                    value={form.maritalStatus} onChange={handleChange}
                                    error={errors.maritalStatus} disabled={submitting} required
                                />
                            </div>
                        </div>

                        {/* ── SECTION 2: Location ──────────────────────────── */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <SectionTitle step="2" title="Location" subtitle="Used to match state-specific schemes" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <SelectField
                                    id="state" label="State / UT"
                                    options={INDIAN_STATES}
                                    value={form.state} onChange={handleChange}
                                    error={errors.state} disabled={submitting} required
                                />
                                <TextField
                                    id="district" label="District" placeholder="e.g. Pune"
                                    value={form.district} onChange={handleChange}
                                    error={errors.district} disabled={submitting} required
                                />
                                <SelectField
                                    id="ruralUrban" label="Area Type"
                                    options={["", "Rural", "Urban", "Semi-Urban"]}
                                    value={form.ruralUrban} onChange={handleChange}
                                    error={errors.ruralUrban} disabled={submitting} required
                                />
                            </div>
                        </div>

                        {/* ── SECTION 3: Economic ──────────────────────────── */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <SectionTitle step="3" title="Economic Status" subtitle="Income and welfare card details" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <TextField
                                    id="annualIncome" label="Annual Income (₹)" type="number"
                                    placeholder="e.g. 250000"
                                    value={form.annualIncome} onChange={handleChange}
                                    error={errors.annualIncome} disabled={submitting} required
                                />
                                <SelectField
                                    id="rationCardType" label="Ration Card Type"
                                    options={RATION_CARD_TYPES}
                                    value={form.rationCardType} onChange={handleChange}
                                    error={errors.rationCardType} disabled={submitting}
                                />
                                <div className="md:col-span-2">
                                    <CheckboxField
                                        id="bpl" label="Below Poverty Line (BPL)"
                                        sublabel="Check if you are a registered BPL household"
                                        checked={form.bpl} onChange={handleChange} disabled={submitting}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ── SECTION 4: Category ──────────────────────────── */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <SectionTitle step="4" title="Category & Identity" subtitle="Caste, minority, and disability status" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <SelectField
                                    id="casteCategory" label="Caste Category"
                                    options={["", "General", "OBC", "SC", "ST", "EWS"]}
                                    value={form.casteCategory} onChange={handleChange}
                                    error={errors.casteCategory} disabled={submitting} required
                                />
                                <div className="flex flex-col gap-4 justify-center pt-1">
                                    <CheckboxField
                                        id="minority" label="Minority Community"
                                        sublabel="Muslim, Christian, Sikh, Buddhist, Jain, Parsi"
                                        checked={form.minority} onChange={handleChange} disabled={submitting}
                                    />
                                    <CheckboxField
                                        id="disability" label="Person with Disability (PwD)"
                                        sublabel="Any physical, mental, or sensory disability"
                                        checked={form.disability} onChange={handleChange} disabled={submitting}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ── SECTION 5: Education ─────────────────────────── */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <SectionTitle step="5" title="Education" subtitle="Highest qualification and study status" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <SelectField
                                    id="educationLevel" label="Education Level"
                                    options={EDUCATION_LEVELS}
                                    value={form.educationLevel} onChange={handleChange}
                                    error={errors.educationLevel} disabled={submitting} required
                                />
                                <div className="flex items-center pt-6">
                                    <CheckboxField
                                        id="currentlyStudying" label="Currently Studying"
                                        sublabel="Enrolled in a school, college, or university"
                                        checked={form.currentlyStudying} onChange={handleChange} disabled={submitting}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ── SECTION 6: Employment ────────────────────────── */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <SectionTitle step="6" title="Employment" subtitle="Current occupation or work status" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <SelectField
                                    id="employmentStatus" label="Employment Status"
                                    options={EMPLOYMENT_STATUSES}
                                    value={form.employmentStatus} onChange={handleChange}
                                    error={errors.employmentStatus} disabled={submitting} required
                                />
                            </div>
                        </div>

                        {/* ── Server Error & Submit ─────────────────────────── */}
                        {serverError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                                {serverError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-blue-800 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base shadow-md"
                        >
                            {submitting
                                ? (isEdit ? "Updating…" : "Saving…")
                                : (isEdit ? "Update Profile" : "Save & Continue")}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
}
