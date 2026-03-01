import { useState, useEffect } from "react";

// ─── Constants (same lists as ProfileSetup) ───────────────────────────────────

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

const RELATIONS = [
    "", "Spouse", "Son", "Daughter", "Father", "Mother",
    "Brother", "Sister", "Grandfather", "Grandmother",
    "Father-in-law", "Mother-in-law", "Other",
];

const EMPTY_FORM = {
    relation: "",
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

function validate(form) {
    const e = {};
    if (!form.relation) e.relation = "Please select relation.";
    if (!form.fullName.trim()) e.fullName = "Full name is required.";
    if (!form.dateOfBirth) e.dateOfBirth = "Date of birth is required.";
    else {
        const age = calcAge(form.dateOfBirth);
        if (age === null || age < 0 || age > 120) e.dateOfBirth = "Enter a valid date of birth.";
    }
    if (!form.gender) e.gender = "Please select gender.";
    if (!form.state) e.state = "Please select a state.";
    if (!form.casteCategory) e.casteCategory = "Please select a category.";
    if (form.annualIncome === "" || Number(form.annualIncome) < 0)
        e.annualIncome = "Enter a valid income (0 or more).";
    return e;
}

// ─── Reusable field components (module-scope — no re-mount) ──────────────────

function F({ id, label, error, required, children }) {
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
}

function Input({ id, type = "text", placeholder, value, onChange, error, disabled, max }) {
    return (
        <input
            id={id} name={id} type={type} placeholder={placeholder}
            value={value} onChange={onChange} disabled={disabled} max={max}
            className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 ${error ? "border-red-400 bg-red-50" : "border-gray-200"}`}
        />
    );
}

function Select({ id, options, value, onChange, error, disabled }) {
    return (
        <select
            id={id} name={id} value={value} onChange={onChange} disabled={disabled}
            className={`w-full border rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 ${error ? "border-red-400 bg-red-50" : "border-gray-200"}`}
        >
            {options.map((opt) =>
                <option key={opt} value={opt} disabled={opt === ""}>{opt === "" ? "Select…" : opt}</option>
            )}
        </select>
    );
}

function Checkbox({ id, label, sublabel, checked, onChange, disabled }) {
    return (
        <label htmlFor={id} className="flex items-start gap-2 cursor-pointer">
            <input id={id} name={id} type="checkbox" checked={checked} onChange={onChange} disabled={disabled}
                className="mt-0.5 accent-blue-700 w-4 h-4 flex-shrink-0" />
            <div>
                <span className="text-sm text-gray-700">{label}</span>
                {sublabel && <p className="text-xs text-gray-400">{sublabel}</p>}
            </div>
        </label>
    );
}

// ─── FamilyForm modal ─────────────────────────────────────────────────────────

export default function FamilyForm({ member, onSave, onClose, saving }) {
    const isEdit = Boolean(member);

    const [form, setForm] = useState(() => {
        if (!member) return EMPTY_FORM;
        return {
            relation: member.relation ?? "",
            fullName: member.fullName ?? "",
            dateOfBirth: member.dateOfBirth ? member.dateOfBirth.slice(0, 10) : "",
            gender: member.gender ?? "",
            maritalStatus: member.maritalStatus ?? "",
            state: member.state ?? "",
            district: member.district ?? "",
            ruralUrban: member.ruralUrban ?? "",
            annualIncome: member.annualIncome !== undefined ? String(member.annualIncome) : "",
            bpl: member.bpl ?? false,
            rationCardType: member.rationCardType ?? "",
            casteCategory: member.casteCategory ?? "",
            minority: member.minority ?? false,
            disability: member.disability ?? false,
            educationLevel: member.educationLevel ?? "",
            currentlyStudying: member.currentlyStudying ?? false,
            employmentStatus: member.employmentStatus ?? "",
        };
    });

    const [errors, setErrors] = useState({});
    const agePreview = calcAge(form.dateOfBirth);

    const h = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
        if (errors[name]) setErrors((p) => ({ ...p, [name]: null }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate(form);
        if (Object.keys(errs).length) { setErrors(errs); return; }
        const payload = {
            ...form,
            annualIncome: Number(form.annualIncome),
            rationCardType: form.rationCardType || null,
            district: form.district.trim(),
            fullName: form.fullName.trim(),
        };
        onSave(payload);
    };

    // Trap scroll inside the modal
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal card */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-blue-900">
                        {isEdit ? "Edit Family Member" : "Add Family Member"}
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-500">
                        ✕
                    </button>
                </div>

                {/* Scrollable body */}
                <form onSubmit={handleSubmit} noValidate className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

                    {/* Relation + Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <F id="relation" label="Relation" error={errors.relation} required>
                            <Select id="relation" options={RELATIONS} value={form.relation} onChange={h} error={errors.relation} disabled={saving} />
                        </F>
                        <F id="fullName" label="Full Name" error={errors.fullName} required>
                            <Input id="fullName" placeholder="e.g. Priya Sharma" value={form.fullName} onChange={h} error={errors.fullName} disabled={saving} />
                        </F>
                    </div>

                    {/* Basic */}
                    <div className="grid grid-cols-2 gap-4">
                        <F id="dateOfBirth" label="Date of Birth" error={errors.dateOfBirth} required>
                            <Input id="dateOfBirth" type="date" value={form.dateOfBirth} onChange={h} error={errors.dateOfBirth} disabled={saving}
                                max={new Date().toISOString().slice(0, 10)} />
                            {agePreview !== null && <span className="text-xs text-blue-600 font-medium">Age: {agePreview} years</span>}
                        </F>
                        <F id="gender" label="Gender" error={errors.gender} required>
                            <Select id="gender" options={["", "Male", "Female", "Other", "Prefer not to say"]} value={form.gender} onChange={h} error={errors.gender} disabled={saving} />
                        </F>
                        <F id="maritalStatus" label="Marital Status" error={errors.maritalStatus}>
                            <Select id="maritalStatus" options={["", "Single", "Married", "Widowed", "Divorced", "Separated"]} value={form.maritalStatus} onChange={h} error={errors.maritalStatus} disabled={saving} />
                        </F>
                        <F id="state" label="State / UT" error={errors.state} required>
                            <Select id="state" options={INDIAN_STATES} value={form.state} onChange={h} error={errors.state} disabled={saving} />
                        </F>
                        <F id="district" label="District" error={errors.district}>
                            <Input id="district" placeholder="e.g. Pune" value={form.district} onChange={h} error={errors.district} disabled={saving} />
                        </F>
                        <F id="ruralUrban" label="Area Type" error={errors.ruralUrban}>
                            <Select id="ruralUrban" options={["", "Rural", "Urban", "Semi-Urban"]} value={form.ruralUrban} onChange={h} error={errors.ruralUrban} disabled={saving} />
                        </F>
                    </div>

                    {/* Economic */}
                    <div className="grid grid-cols-2 gap-4">
                        <F id="annualIncome" label="Annual Income (₹)" error={errors.annualIncome} required>
                            <Input id="annualIncome" type="number" placeholder="e.g. 150000" value={form.annualIncome} onChange={h} error={errors.annualIncome} disabled={saving} />
                        </F>
                        <F id="rationCardType" label="Ration Card" error={errors.rationCardType}>
                            <Select id="rationCardType" options={RATION_CARD_TYPES} value={form.rationCardType} onChange={h} error={errors.rationCardType} disabled={saving} />
                        </F>
                        <div className="col-span-2">
                            <Checkbox id="bpl" label="Below Poverty Line (BPL)" sublabel="Registered BPL household" checked={form.bpl} onChange={h} disabled={saving} />
                        </div>
                    </div>

                    {/* Category */}
                    <div className="grid grid-cols-2 gap-4">
                        <F id="casteCategory" label="Caste Category" error={errors.casteCategory} required>
                            <Select id="casteCategory" options={["", "General", "OBC", "SC", "ST", "EWS"]} value={form.casteCategory} onChange={h} error={errors.casteCategory} disabled={saving} />
                        </F>
                        <div className="flex flex-col gap-3 justify-center">
                            <Checkbox id="minority" label="Minority Community" checked={form.minority} onChange={h} disabled={saving} />
                            <Checkbox id="disability" label="Person with Disability (PwD)" checked={form.disability} onChange={h} disabled={saving} />
                        </div>
                    </div>

                    {/* Education + Employment */}
                    <div className="grid grid-cols-2 gap-4">
                        <F id="educationLevel" label="Education Level" error={errors.educationLevel}>
                            <Select id="educationLevel" options={EDUCATION_LEVELS} value={form.educationLevel} onChange={h} error={errors.educationLevel} disabled={saving} />
                        </F>
                        <F id="employmentStatus" label="Employment Status" error={errors.employmentStatus}>
                            <Select id="employmentStatus" options={EMPLOYMENT_STATUSES} value={form.employmentStatus} onChange={h} error={errors.employmentStatus} disabled={saving} />
                        </F>
                        <div className="col-span-2">
                            <Checkbox id="currentlyStudying" label="Currently Studying" sublabel="Enrolled in school, college, or university" checked={form.currentlyStudying} onChange={h} disabled={saving} />
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <button type="button" onClick={onClose} disabled={saving}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition disabled:opacity-50">
                        Cancel
                    </button>
                    <button
                        form="family-form"
                        type="submit"
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-5 py-2 bg-blue-800 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                        {saving ? "Saving…" : (isEdit ? "Update Member" : "Add Member")}
                    </button>
                </div>
            </div>
        </div>
    );
}
