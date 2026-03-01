import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { getProfile } from "../api/profile.api";

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getProfile();
            setProfile(data); // null if 404, object if found
        } catch (error) {
            console.error("[ProfileContext] Failed to fetch profile:", error);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Only fetch profile when a user is authenticated.
    // Reset to loading state and clear profile on logout.
    useEffect(() => {
        if (user) {
            fetchProfile();
        } else {
            setProfile(null);
            setLoading(false);
        }
    }, [user, fetchProfile]);

    const value = { profile, loading, fetchProfile, setProfile };

    return (
        <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
    );
}

export function useProfile() {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error("useProfile must be used within a ProfileProvider");
    }
    return context;
}
