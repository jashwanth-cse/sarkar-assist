import { useMemo } from "react";

/**
 * SchemeFilters — search by name, filter by category and eligibility status.
 *
 * Props:
 *   schemes     — full unfiltered array
 *   filters     — { search, category, status }  (controlled state from parent)
 *   onChange    — (key, value) => void
 */
export default function SchemeFilters({ schemes, filters, onChange }) {
    // Derive unique categories from live data
    const categories = useMemo(() => {
        const cats = [...new Set(schemes.map((s) => s.category).filter(Boolean))].sort();
        return cats;
    }, [schemes]);

    const inputCls =
        "text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition w-full";

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Name search */}
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                    <input
                        type="text"
                        placeholder="Search schemes…"
                        value={filters.search}
                        onChange={(e) => onChange("search", e.target.value)}
                        className={`${inputCls} pl-8`}
                    />
                </div>

                {/* Status filter */}
                <select
                    value={filters.status}
                    onChange={(e) => onChange("status", e.target.value)}
                    className={inputCls}
                >
                    <option value="">All Status</option>
                    <option value="eligible">Eligible</option>
                    <option value="not_eligible">Not Eligible</option>
                    <option value="partial">Partially Eligible</option>
                </select>

                {/* Category filter */}
                <select
                    value={filters.category}
                    onChange={(e) => onChange("category", e.target.value)}
                    className={inputCls}
                >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* Active filter chips */}
            {(filters.search || filters.status || filters.category) && (
                <div className="flex items-center flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">Active:</span>
                    {filters.search && <Chip label={`"${filters.search}"`} onRemove={() => onChange("search", "")} />}
                    {filters.status && <Chip label={filters.status.replace("_", " ")} onRemove={() => onChange("status", "")} />}
                    {filters.category && <Chip label={filters.category} onRemove={() => onChange("category", "")} />}
                    <button onClick={() => { onChange("search", ""); onChange("status", ""); onChange("category", ""); }}
                        className="text-xs text-red-500 hover:text-red-700 ml-1 font-medium">
                        Clear all
                    </button>
                </div>
            )}
        </div>
    );
}

function Chip({ label, onRemove }) {
    return (
        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">
            {label}
            <button onClick={onRemove} className="hover:text-blue-900 leading-none">✕</button>
        </span>
    );
}
