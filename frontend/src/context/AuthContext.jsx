import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useRef,
} from "react";
import {
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithPopup,
    signOut,
} from "firebase/auth";
import { auth } from "../config/firebase";

const AuthContext = createContext(null);

const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Prevents multiple concurrent signInWithPopup calls (e.g. clicking
    // several sign-in buttons on the landing page in quick succession).
    const popupInProgress = useRef(false);

    // Track auth state across the app lifecycle
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const loginWithGoogle = useCallback(async () => {
        if (popupInProgress.current) return; // guard: only one popup at a time
        popupInProgress.current = true;
        try {
            await signInWithPopup(auth, googleProvider);
        } finally {
            popupInProgress.current = false;
        }
    }, []);


    const logout = useCallback(async () => {
        await signOut(auth);
    }, []);

    /**
     * Returns the current user's Firebase ID token.
     * Force-refreshes the token if it is about to expire.
     */
    const getIdToken = useCallback(
        async (forceRefresh = false) => {
            if (!auth.currentUser) return null;
            return auth.currentUser.getIdToken(forceRefresh);
        },
        []
    );

    const value = { user, loading, loginWithGoogle, logout, getIdToken };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
