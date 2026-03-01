import { useState } from "react";
import CriteriaBuilder from "./CriteriaBuilder";

const CATEGORIES = [
    "Education", "Health", "Housing", "Agriculture",
    "Employment", "Finance", "Women", "Welfare", "Other",
];

const EMPTY = {
    schemeName: "",
    category: "",
    description: "",
    criteria: [],
};

function validate(form) {
    const e = {};
    if (!form.schemeName.trim()) e.schemeName = "Scheme name is required.";
    if (!form.category) e.category = "Category is required.";
    if (!form.description.trim()) e.description = "Description is required.";
    if (form.criteria.some((c) => !c.field || !c.value.toString().trim()))
        e.criteria = "All criteria rows must have a field and value.";
    return e;
}

const cls = {
    label: "text-xs font-semibold text-gray-600 uppercase tracking-wide",
    input: "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition",
    error: "text-xs text-red-500 mt-0.5",
};

export default function SchemeForm({ scheme, onSave, onCancel, saving }) {
    const isEdit = Boolean(scheme);

    const [form, setForm] = useState(() =>
        scheme
            ? {
                schemeName: scheme.schemeName ?? "",
                category: scheme.category ?? "",
                description: scheme.description ?? "",
                criteria: scheme.criteria ?? [],
            }
            : { ...EMPTY }
    );
    const [errors, setErrors] = useState({});

    const set = (key, val) => {
        setForm((p) => ({ ...p, [key]: val }));
        if (errors[key]) setErrors((p) => ({ ...p, [key]: null }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate(form);
        if (Object.keys(errs).length) { setErrors(errs); return; }
        onSave({
            schemeName: form.schemeName.trim(),
            category: form.category,
            description: form.description.trim(),
            criteria: form.criteria,
        });
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Name */}
            <div>
                <label className={cls.label}>Scheme Name *</label>
                <input
                    value={form.schemeName}
                    onChange={(e) => set("schemeName", e.target.value)}
                    placeholder="e.g. PM Awas Yojana"
                    disabled={saving}
                    className={`${cls.input} mt-1 ${errors.schemeName ? "border-red-400 bg-red-50" : ""}`}
                />
                {errors.schemeName && <p className={cls.error}>{errors.schemeName}</p>}
            </div>

            {/* Category */}
            <div>
                <label className={cls.label}>Category *</label>
                <select
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                    disabled={saving}
                    className={`${cls.input} mt-1 bg-white ${errors.category ? "border-red-400 bg-red-50" : ""}`}
                >
                    <option value="" disabled>Select category…</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className={cls.error}>{errors.category}</p>}
            </div>

            {/* Description */}
            <div>
                <label className={cls.label}>Description *</label>
                <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Brief description of this scheme…"
                    disabled={saving}
                    className={`${cls.input} mt-1 resize-none ${errors.description ? "border-red-400 bg-red-50" : ""}`}
                />
                {errors.description && <p className={cls.error}>{errors.description}</p>}
            </div>

            {/* Criteria */}
            <div>
                <label className={cls.label + " mb-2 block"}>Eligibility Criteria</label>
                <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                    <CriteriaBuilder
                        criteria={form.criteria}
                        onChange={(val) => set("criteria", val)}
                    />
                </div>
                {errors.criteria && <p className={cls.error}>{errors.criteria}</p>}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={onCancel} disabled={saving}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700 transition disabled:opacity-50 px-4 py-2">
                    Cancel
                </button>
                <button type="submit" disabled={saving}
                    className="bg-blue-800 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 shadow-sm">
                    {saving ? "Saving…" : isEdit ? "Update Scheme" : "Create Scheme"}
                </button>
            </div>
        </form>
    );
}
