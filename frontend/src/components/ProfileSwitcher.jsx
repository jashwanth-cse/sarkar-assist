import { useState, useRef, useEffect } from "react";
import { useProfile } from "../context/ProfileContext";

/**
 * Dropdown that lists the primary profile + all family members.
 * Selecting one updates activeProfile in context.
 */
export default function ProfileSwitcher() {
    const { primaryProfile, familyMembers, activeProfile, setActiveProfile } = useProfile();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close on outside click
    useEffect(() => {
        function handler(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const allProfiles = [
        primaryProfile && { ...primaryProfile, _label: "You (Primary)" },
        ...familyMembers.map((m) => ({ ...m, _label: m.relation ? `${m.fullName} (${m.relation})` : m.fullName })),
    ].filter(Boolean);

    if (allProfiles.length < 2) return null; // nothing to switch if only primary

    const activeName = activeProfile?._label
        ?? (activeProfile?._id === primaryProfile?._id ? "You (Primary)" : activeProfile?.fullName)
        ?? "Select profile";

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((p) => !p)}
                className="flex items-center gap-2 bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm font-medium text-blue-800 hover:bg-blue-50 transition-colors shadow-sm"
            >
                {/* Avatar letter */}
                <span className="w-6 h-6 rounded-full bg-blue-700 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
                    {(activeProfile?.fullName ?? "U")[0].toUpperCase()}
                </span>
                <span className="max-w-[140px] truncate">{activeName}</span>
                <svg className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
                    <p className="text-xs text-gray-400 uppercase tracking-widest px-4 pt-3 pb-1 font-semibold">Switch profile</p>
                    {allProfiles.map((p) => {
                        const isActive = activeProfile?._id === p._id;
                        return (
                            <button
                                key={p._id}
                                onClick={() => { setActiveProfile(p); setOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isActive ? "bg-blue-50 text-blue-800 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
                            >
                                <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold flex-shrink-0">
                                    {(p.fullName ?? "?")[0].toUpperCase()}
                                </span>
                                <span className="truncate">{p._label}</span>
                                {isActive && (
                                    <svg className="w-4 h-4 ml-auto text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
