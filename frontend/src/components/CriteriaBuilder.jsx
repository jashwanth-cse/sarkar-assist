/**
 * CriteriaBuilder – dynamic add/remove rows for scheme criteria.
 *
 * Each row: { field, operator, value }
 *
 * Props:
 *   criteria  — array of { field, operator, value }
 *   onChange  — (newCriteria) => void
 */

const FIELDS = [
    { value: "age", label: "Age" },
    { value: "annualIncome", label: "Annual Income (₹)" },
    { value: "gender", label: "Gender" },
    { value: "casteCategory", label: "Caste Category" },
    { value: "state", label: "State / UT" },
    { value: "ruralUrban", label: "Rural / Urban" },
    { value: "bpl", label: "BPL Status" },
    { value: "minority", label: "Minority" },
    { value: "disability", label: "Person with Disability" },
    { value: "educationLevel", label: "Education Level" },
    { value: "employmentStatus", label: "Employment Status" },
    { value: "maritalStatus", label: "Marital Status" },
    { value: "rationCardType", label: "Ration Card Type" },
    { value: "currentlyStudying", label: "Currently Studying" },
];

const OPERATORS = [
    { value: "eq", label: "equals (=)" },
    { value: "neq", label: "not equals (≠)" },
    { value: "lt", label: "less than (<)" },
    { value: "lte", label: "≤" },
    { value: "gt", label: "greater than (>)" },
    { value: "gte", label: "≥" },
    { value: "in", label: "is one of" },
    { value: "nin", label: "is not one of" },
];

const EMPTY_ROW = { field: "", operator: "eq", value: "" };

function Row({ row, index, onChange, onRemove, total }) {
    const update = (key, val) => onChange(index, { ...row, [key]: val });

    const sel = "text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition w-full";
    const inp = "text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition w-full";

    return (
        <div className="flex items-center gap-2 group">
            {/* Row number */}
            <span className="text-xs text-gray-400 font-mono w-5 text-right flex-shrink-0">{index + 1}.</span>

            {/* Field */}
            <select value={row.field} onChange={(e) => update("field", e.target.value)} className={sel}>
                <option value="" disabled>Select field…</option>
                {FIELDS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>

            {/* Operator */}
            <select value={row.operator} onChange={(e) => update("operator", e.target.value)} className={`${sel} w-40 flex-shrink-0`}>
                {OPERATORS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Value */}
            <input
                type="text"
                placeholder="Value…"
                value={row.value}
                onChange={(e) => update("value", e.target.value)}
                className={inp}
            />

            {/* Remove */}
            <button
                type="button"
                onClick={() => onRemove(index)}
                disabled={total === 1}
                title="Remove row"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
            >
                ✕
            </button>
        </div>
    );
}

export default function CriteriaBuilder({ criteria, onChange }) {
    const rows = criteria.length ? criteria : [EMPTY_ROW];

    const handleChange = (i, updated) => {
        const next = [...rows];
        next[i] = updated;
        onChange(next);
    };

    const handleRemove = (i) => {
        const next = rows.filter((_, idx) => idx !== i);
        onChange(next.length ? next : [EMPTY_ROW]);
    };

    const handleAdd = () => onChange([...rows, { ...EMPTY_ROW }]);

    return (
        <div className="space-y-3">
            {/* Column headers */}
            <div className="flex items-center gap-2 pl-7 text-xs text-gray-400 uppercase tracking-wide font-semibold">
                <span className="flex-1">Field</span>
                <span className="w-40 flex-shrink-0">Operator</span>
                <span className="flex-1">Value</span>
                <span className="w-7 flex-shrink-0" />
            </div>

            {rows.map((row, i) => (
                <Row key={i} row={row} index={i} onChange={handleChange} onRemove={handleRemove} total={rows.length} />
            ))}

            <button
                type="button"
                onClick={handleAdd}
                className="flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors mt-1"
            >
                <span className="text-lg leading-none">＋</span> Add criterion
            </button>
        </div>
    );
}
