import { useState } from "react";
import ExplainPanel, { MatchBar } from "./ExplainPanel";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS = {
    eligible: { label: "Eligible", dot: "bg-green-500", text: "text-green-700", bg: "bg-green-50 border-green-200" },
    not_eligible: { label: "Not Eligible", dot: "bg-red-500", text: "text-red-600", bg: "bg-red-50 border-red-200" },
    partial: { label: "Partial", dot: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
};

const CATEGORY_COLORS = {
    Education: "bg-blue-100 text-blue-700",
    Health: "bg-teal-100 text-teal-700",
    Housing: "bg-purple-100 text-purple-700",
    Agriculture: "bg-lime-100 text-lime-700",
    Employment: "bg-orange-100 text-orange-700",
    Finance: "bg-indigo-100 text-indigo-700",
    Women: "bg-pink-100 text-pink-700",
    Welfare: "bg-yellow-100 text-yellow-700",
};

function categoryColor(cat) {
    return CATEGORY_COLORS[cat] ?? "bg-gray-100 text-gray-600";
}

// ─── SchemeCard ───────────────────────────────────────────────────────────────
export default function SchemeCard({ scheme }) {
    const {
        schemeName,
        category,
        eligibilityStatus = "not_eligible",
        matchedCriteria = 0,
        totalCriteria = 0,
        criteriaBreakdown = [],
        // Legacy fallback fields
        eligible,
        description,
    } = scheme;

    // Normalise legacy shape
    const status = eligibilityStatus ?? (eligible ? "eligible" : "not_eligible");
    const s = STATUS[status] ?? STATUS.not_eligible;

    const [expanded, setExpanded] = useState(false);
    const hasBreakdown = criteriaBreakdown.length > 0;

    return (
        <div
            className={`relative bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden`}
        >
            {/* Top accent line */}
            <div className={`h-1 w-full ${s.dot.replace("bg-", "bg-")}`} />

            <div className="p-5 flex flex-col flex-1">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-sm font-bold text-blue-900 leading-snug flex-1">
                        {schemeName}
                    </h3>
                    {/* Status badge */}
                    <span className={`flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${s.bg} ${s.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                    </span>
                </div>

                {/* Category chip */}
                {category && (
                    <span className={`self-start text-xs font-medium px-2 py-0.5 rounded-full mb-3 ${categoryColor(category)}`}>
                        {category}
                    </span>
                )}

                {/* Description (legacy) */}
                {description && (
                    <p className="text-xs text-gray-500 leading-relaxed mb-3 flex-1">{description}</p>
                )}

                {/* Match bar */}
                {totalCriteria > 0 && (
                    <MatchBar matched={matchedCriteria} total={totalCriteria} />
                )}

                {/* Expand button */}
                {hasBreakdown && (
                    <button
                        onClick={() => setExpanded((p) => !p)}
                        className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors self-start"
                    >
                        <svg
                            className={`w-3.5 h-3.5 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                        {expanded ? "Hide breakdown" : "View criteria breakdown"}
                    </button>
                )}

                {/* Explain Panel (animated height via grid trick) */}
                <div
                    className="grid transition-all duration-300 ease-in-out"
                    style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
                >
                    <div className="overflow-hidden">
                        {hasBreakdown && <ExplainPanel breakdown={criteriaBreakdown} />}
                    </div>
                </div>
            </div>
        </div>
    );
}
