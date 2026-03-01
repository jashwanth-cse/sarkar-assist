import { useState } from "react";
import StatusBadge from "./StatusBadge";

export default function SchemeCard({ scheme }) {
    const { schemeName, description, eligible, reasons = [] } = scheme;
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200 flex flex-col">
            {/* Header Row */}
            <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-blue-800 leading-snug flex-1">
                    {schemeName}
                </h3>
                <StatusBadge type={eligible ? "success" : "error"}>
                    {eligible ? "Eligible" : "Not Eligible"}
                </StatusBadge>
            </div>

            {/* Description */}
            <p className="text-gray-600 mt-3 text-sm leading-relaxed flex-1">
                {description}
            </p>

            {/* Why not eligible — expandable */}
            {!eligible && reasons.length > 0 && (
                <div className="mt-4">
                    <button
                        onClick={() => setExpanded((prev) => !prev)}
                        className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
                    >
                        <span>{expanded ? "▲" : "▼"}</span>
                        Why not eligible?
                    </button>
                    {expanded && (
                        <ul className="mt-2 space-y-1 pl-3 border-l-2 border-red-200">
                            {reasons.map((reason, i) => (
                                <li key={i} className="text-xs text-red-600 leading-relaxed">
                                    {reason}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* View Details Button */}
            <button className="mt-4 self-start bg-blue-700 hover:bg-blue-800 text-white text-sm px-4 py-2 rounded-md transition-colors">
                View Details
            </button>
        </div>
    );
}
