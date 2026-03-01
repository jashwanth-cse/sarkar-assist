import { useState } from "react";
import { useProfile } from "../context/ProfileContext";
import FamilyForm from "./FamilyForm";

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

function MemberCard({ member, onEdit, onDelete, deleting }) {
    const age = calcAge(member.dateOfBirth);
    return (
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                        {(member.fullName ?? "?")[0].toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 text-sm">{member.fullName}</p>
                        {member.relation && (
                            <span className="inline-block text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                {member.relation}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => onEdit(member)}
                        className="text-xs font-medium text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                        Edit
                    </button>
                    <button onClick={() => onDelete(member._id)} disabled={deleting === member._id}
                        className="text-xs font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                        {deleting === member._id ? "…" : "Delete"}
                    </button>
                </div>
            </div>

            {/* Details chips */}
            <div className="flex flex-wrap gap-2">
                {age !== null && <Chip label={`${age} yrs`} />}
                {member.gender && <Chip label={member.gender} />}
                {member.state && <Chip label={member.state} />}
                {member.casteCategory && <Chip label={member.casteCategory.toUpperCase()} />}
                {member.annualIncome !== undefined && (
                    <Chip label={`₹${Number(member.annualIncome).toLocaleString("en-IN")}/yr`} />
                )}
                {member.bpl && <Chip label="BPL" color="orange" />}
                {member.disability && <Chip label="PwD" color="purple" />}
                {member.minority && <Chip label="Minority" color="teal" />}
            </div>
        </div>
    );
}

function Chip({ label, color = "gray" }) {
    const colors = {
        gray: "bg-gray-100 text-gray-600",
        orange: "bg-orange-100 text-orange-700",
        purple: "bg-purple-100 text-purple-700",
        teal: "bg-teal-100 text-teal-700",
    };
    return (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[color]}`}>
            {label}
        </span>
    );
}

export default function FamilyList() {
    const { familyMembers, addMember, updateMember, deleteMember } = useProfile();

    const [showForm, setShowForm] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [error, setError] = useState(null);

    const handleEdit = (member) => {
        setEditingMember(member);
        setShowForm(true);
    };

    const handleAdd = () => {
        setEditingMember(null);
        setShowForm(true);
    };

    const handleSave = async (payload) => {
        setSaving(true);
        setError(null);
        try {
            if (editingMember) {
                await updateMember(editingMember._id, payload);
            } else {
                await addMember(payload);
            }
            setShowForm(false);
            setEditingMember(null);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Remove this family member?")) return;
        setDeleting(id);
        setError(null);
        try {
            await deleteMember(id);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete. Please try again.");
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div>
            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-800">Family Members</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {familyMembers.length === 0
                            ? "No family members added yet"
                            : `${familyMembers.length} member${familyMembers.length > 1 ? "s" : ""}`}
                    </p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-blue-800 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                    <span className="text-lg leading-none">+</span> Add Member
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                    {error}
                </div>
            )}

            {familyMembers.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                    Add family members to check their scheme eligibility too.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {familyMembers.map((m) => (
                        <MemberCard key={m._id} member={m} onEdit={handleEdit} onDelete={handleDelete} deleting={deleting} />
                    ))}
                </div>
            )}

            {showForm && (
                <FamilyForm
                    member={editingMember}
                    onSave={handleSave}
                    onClose={() => { setShowForm(false); setEditingMember(null); }}
                    saving={saving}
                />
            )}
        </div>
    );
}
