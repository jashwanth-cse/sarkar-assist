import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { login as apiLogin, signup as apiSignup, logout as apiLogout, getMe } from "../api/auth.api";

const AuthContext = createContext(null);

const TOKEN_KEY = "token";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
    const [loading, setLoading] = useState(true);

    const isAuthenticated = Boolean(user);

    // On mount: validate token by calling /auth/me
    useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        if (!storedToken) {
            setLoading(false);
            return;
        }

        getMe()
            .then((res) => {
                setUser(res.user ?? res);
            })
            .catch(() => {
                // Token invalid or expired → clear it
                localStorage.removeItem(TOKEN_KEY);
                setToken(null);
                setUser(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const login = useCallback(async (formData) => {
        const res = await apiLogin(formData);
        const { token: newToken, user: newUser } = res;
        localStorage.setItem(TOKEN_KEY, newToken);
        setToken(newToken);
        setUser(newUser);
    }, []);

    const signup = useCallback(async (formData) => {
        const res = await apiSignup(formData);
        const { token: newToken, user: newUser } = res;
        localStorage.setItem(TOKEN_KEY, newToken);
        setToken(newToken);
        setUser(newUser);
    }, []);

    const logout = useCallback(async () => {
        try {
            await apiLogout();
        } catch (_) {
            // Ignore errors on logout — always clear locally
        } finally {
            localStorage.removeItem(TOKEN_KEY);
            setToken(null);
            setUser(null);
            // Hard redirect for a clean slate
            window.location.href = "/login";
        }
    }, []);

    const value = { user, token, loading, isAuthenticated, login, signup, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
