import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import {
    getProfile,
    getFamilyMembers,
    addFamilyMember as apiAddMember,
    updateFamilyMember as apiUpdateMember,
    deleteFamilyMember as apiDeleteMember,
} from "../api/profile.api";

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
    const { isAuthenticated } = useAuth();

    const [primaryProfile, setPrimaryProfile] = useState(null);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [activeProfile, setActiveProfile] = useState(null); // primary or a family member
    const [loading, setLoading] = useState(true);

    // ── Fetch primary profile ────────────────────────────────
    const fetchProfile = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getProfile();
            setPrimaryProfile(data);
            // On first load, default active profile to primary
            setActiveProfile((prev) => prev ?? data);
        } catch (error) {
            console.error("[ProfileContext] fetchProfile failed:", error);
            setPrimaryProfile(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Fetch family members ─────────────────────────────────
    const fetchFamilyMembers = useCallback(async () => {
        try {
            const members = await getFamilyMembers();
            setFamilyMembers(members ?? []);
        } catch (error) {
            console.error("[ProfileContext] fetchFamilyMembers failed:", error);
            setFamilyMembers([]);
        }
    }, []);

    // ── Add a family member ──────────────────────────────────
    const addMember = useCallback(async (data) => {
        const created = await apiAddMember(data);
        setFamilyMembers((prev) => [...prev, created]);
        return created;
    }, []);

    // ── Update a family member ───────────────────────────────
    const updateMember = useCallback(async (id, data) => {
        const updated = await apiUpdateMember(id, data);
        setFamilyMembers((prev) =>
            prev.map((m) => (m._id === id ? updated : m))
        );
        // Keep activeProfile in sync if it was this member
        setActiveProfile((prev) => (prev?._id === id ? updated : prev));
        return updated;
    }, []);

    // ── Delete a family member ───────────────────────────────
    const deleteMember = useCallback(async (id) => {
        await apiDeleteMember(id);
        setFamilyMembers((prev) => prev.filter((m) => m._id !== id));
        // If deleted member was active, fall back to primary
        setActiveProfile((prev) => (prev?._id === id ? primaryProfile : prev));
    }, [primaryProfile]);

    // ── Bootstrap on auth change ─────────────────────────────
    useEffect(() => {
        if (isAuthenticated) {
            fetchProfile();
            fetchFamilyMembers();
        } else {
            setPrimaryProfile(null);
            setFamilyMembers([]);
            setActiveProfile(null);
            setLoading(false);
        }
    }, [isAuthenticated, fetchProfile, fetchFamilyMembers]);

    // Legacy alias so existing code using setProfile / profile still works
    const setProfile = setPrimaryProfile;
    const profile = primaryProfile;

    const value = {
        // Backwards compat
        profile,
        setProfile,
        // Phase 2
        primaryProfile,
        familyMembers,
        activeProfile,
        setActiveProfile,
        loading,
        fetchProfile,
        fetchFamilyMembers,
        addMember,
        updateMember,
        deleteMember,
    };

    return (
        <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
    );
}

export function useProfile() {
    const context = useContext(ProfileContext);
    if (!context) throw new Error("useProfile must be used within a ProfileProvider");
    return context;
}
