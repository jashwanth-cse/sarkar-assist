import { useState, useEffect } from "react";

/**
 * ExplainPanel — renders criteriaBreakdown rows.
 * Green for matched, red for unmatched.
 */
export default function ExplainPanel({ breakdown = [] }) {
    if (!breakdown.length) {
        return <p className="text-xs text-gray-400 mt-2">No detailed breakdown available.</p>;
    }

    return (
        <div className="mt-3 rounded-xl overflow-hidden border border-gray-100">
            <table className="w-full text-xs">
                <thead>
                    <tr className="bg-gray-50 text-gray-500 uppercase tracking-wide">
                        <th className="text-left px-3 py-2 font-semibold w-2/5">Criterion</th>
                        <th className="text-left px-3 py-2 font-semibold">Required</th>
                        <th className="text-left px-3 py-2 font-semibold">Yours</th>
                        <th className="text-center px-3 py-2 font-semibold w-10">✓</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {breakdown.map((row, i) => (
                        <tr
                            key={i}
                            className={`transition-colors ${row.matched ? "bg-green-50/60" : "bg-red-50/60"}`}
                        >
                            <td className="px-3 py-2 font-medium text-gray-700">{row.label}</td>
                            <td className="px-3 py-2 text-gray-500">{row.requiredValue ?? "—"}</td>
                            <td className={`px-3 py-2 font-semibold ${row.matched ? "text-green-700" : "text-red-600"}`}>
                                {row.userValue ?? "—"}
                            </td>
                            <td className="px-3 py-2 text-center">
                                {row.matched ? (
                                    <span className="text-green-600 font-bold">✓</span>
                                ) : (
                                    <span className="text-red-500 font-bold">✗</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/**
 * Animated match percentage progress bar.
 */
export function MatchBar({ matched, total }) {
    const pct = total > 0 ? Math.round((matched / total) * 100) : 0;
    const [width, setWidth] = useState(0);

    useEffect(() => {
        // Delay to trigger CSS transition after mount
        const t = setTimeout(() => setWidth(pct), 80);
        return () => clearTimeout(t);
    }, [pct]);

    const color =
        pct >= 75 ? "bg-green-500" :
            pct >= 40 ? "bg-amber-400" :
                "bg-red-400";

    return (
        <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400 font-medium">Match score</span>
                <span className={`text-xs font-bold ${pct >= 75 ? "text-green-600" : pct >= 40 ? "text-amber-600" : "text-red-500"}`}>
                    {pct}% &nbsp;·&nbsp; {matched}/{total} criteria
                </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
                    style={{ width: `${width}%` }}
                />
            </div>
        </div>
    );
}
