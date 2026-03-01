import { useEffect, useState, useCallback } from "react";
import { adminGetSchemes, adminCreateScheme, adminUpdateScheme, adminDeleteScheme } from "../../api/admin.api";
import AdminLayout from "../../layouts/AdminLayout";
import SchemeForm from "../../components/SchemeForm";

// ─── Status helpers ───────────────────────────────────────────────────────────
function CategoryBadge({ cat }) {
    const colors = {
        Education: "bg-blue-100 text-blue-700", Health: "bg-teal-100 text-teal-700",
        Housing: "bg-purple-100 text-purple-700", Agriculture: "bg-lime-100 text-lime-700",
        Employment: "bg-orange-100 text-orange-700", Finance: "bg-indigo-100 text-indigo-700",
        Women: "bg-pink-100 text-pink-700", Welfare: "bg-yellow-100 text-yellow-700",
    };
    return (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[cat] ?? "bg-gray-100 text-gray-600"}`}>
            {cat}
        </span>
    );
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-bold text-blue-900">{title}</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition">✕</button>
                </div>
                <div className="overflow-y-auto p-6">{children}</div>
            </div>
        </div>
    );
}

// ─── Confirm dialog ────────────────────────────────────────────────────────────
function ConfirmModal({ scheme, onConfirm, onCancel, deleting }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                <div className="text-4xl mb-3">🗑️</div>
                <h3 className="text-base font-bold text-gray-800 mb-1">Delete Scheme</h3>
                <p className="text-sm text-gray-500 mb-5">
                    Are you sure you want to delete <strong>{scheme?.schemeName}</strong>? This cannot be undone.
                </p>
                <div className="flex gap-3 justify-center">
                    <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition">Cancel</button>
                    <button onClick={onConfirm} disabled={deleting}
                        className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
                        {deleting ? "Deleting…" : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── SchemeManager ────────────────────────────────────────────────────────────
export default function SchemeManager() {
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    const [formMode, setFormMode] = useState(null); // null | "create" | "edit"
    const [editTarget, setEditTarget] = useState(null);
    const [formSaving, setFormSaving] = useState(false);
    const [formError, setFormError] = useState(null);

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // ── Fetch ────────────────────────────────────────────────
    const fetchSchemes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await adminGetSchemes();
            setSchemes(Array.isArray(data) ? data : data?.schemes ?? []);
        } catch (err) {
            setError(err.response?.data?.message ?? "Failed to load schemes.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSchemes(); }, [fetchSchemes]);

    // ── Save (create or edit) ─────────────────────────────────
    const handleSave = async (payload) => {
        setFormSaving(true);
        setFormError(null);
        try {
            if (formMode === "edit" && editTarget) {
                const updated = await adminUpdateScheme(editTarget._id, payload);
                setSchemes((prev) => prev.map((s) => (s._id === editTarget._id ? updated : s)));
            } else {
                const created = await adminCreateScheme(payload);
                setSchemes((prev) => [created, ...prev]);
            }
            setFormMode(null);
            setEditTarget(null);
        } catch (err) {
            setFormError(err.response?.data?.message ?? "Failed to save scheme.");
        } finally {
            setFormSaving(false);
        }
    };

    // ── Delete ────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await adminDeleteScheme(deleteTarget._id);
            setSchemes((prev) => prev.filter((s) => s._id !== deleteTarget._id));
            setDeleteTarget(null);
        } catch (err) {
            setError(err.response?.data?.message ?? "Failed to delete scheme.");
            setDeleteTarget(null);
        } finally {
            setDeleting(false);
        }
    };

    // ── Filtered list ─────────────────────────────────────────
    const visible = schemes.filter((s) =>
        !search || (s.schemeName ?? "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout>
            {/* Top bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Schemes</h2>
                    <p className="text-sm text-gray-400 mt-0.5">{schemes.length} total</p>
                </div>
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Search schemes…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition w-56"
                    />
                    <button
                        onClick={() => { setEditTarget(null); setFormMode("create"); setFormError(null); }}
                        className="flex items-center gap-2 bg-blue-800 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
                    >
                        <span className="text-base">＋</span> New Scheme
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-5">
                    {error}
                </div>
            )}

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20 text-gray-400 text-sm gap-3">
                    <svg className="animate-spin h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Loading schemes…
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    {visible.length === 0 ? (
                        <div className="text-center py-16 text-gray-400 text-sm">
                            {search ? "No schemes match your search." : "No schemes yet. Click '+ New Scheme' to add one."}
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                                <tr>
                                    <th className="text-left px-5 py-3 font-semibold">#</th>
                                    <th className="text-left px-5 py-3 font-semibold">Scheme Name</th>
                                    <th className="text-left px-5 py-3 font-semibold">Category</th>
                                    <th className="text-left px-5 py-3 font-semibold">Criteria</th>
                                    <th className="text-left px-5 py-3 font-semibold">Description</th>
                                    <th className="text-right px-5 py-3 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {visible.map((scheme, i) => (
                                    <tr key={scheme._id} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="px-5 py-4 text-gray-400 font-mono text-xs">{i + 1}</td>
                                        <td className="px-5 py-4 font-semibold text-gray-800 max-w-[180px]">
                                            <span className="line-clamp-2">{scheme.schemeName}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <CategoryBadge cat={scheme.category} />
                                        </td>
                                        <td className="px-5 py-4 text-gray-500">
                                            {scheme.criteria?.length ?? 0} rules
                                        </td>
                                        <td className="px-5 py-4 text-gray-400 max-w-[200px]">
                                            <span className="line-clamp-2 text-xs">{scheme.description}</span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => { setEditTarget(scheme); setFormMode("edit"); setFormError(null); }}
                                                    className="text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(scheme)}
                                                    className="text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Create / Edit Modal */}
            {formMode && (
                <Modal
                    title={formMode === "edit" ? `Edit — ${editTarget?.schemeName}` : "New Scheme"}
                    onClose={() => { setFormMode(null); setEditTarget(null); }}
                >
                    {formError && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                            {formError}
                        </div>
                    )}
                    <SchemeForm
                        scheme={editTarget}
                        onSave={handleSave}
                        onCancel={() => { setFormMode(null); setEditTarget(null); }}
                        saving={formSaving}
                    />
                </Modal>
            )}

            {/* Delete Confirm Modal */}
            {deleteTarget && (
                <ConfirmModal
                    scheme={deleteTarget}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                    deleting={deleting}
                />
            )}
        </AdminLayout>
    );
}
