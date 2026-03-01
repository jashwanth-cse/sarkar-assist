import apiClient from "./axios";

/**
 * Register a new user.
 * @param {{ fullName: string, email: string, password: string, mobile?: string }} data
 * @returns {Promise<{ token: string, user: object }>}
 */
export async function signup(data) {
    const { data: res } = await apiClient.post("/auth/signup", data);
    return res;
}

/**
 * Log in with email + password.
 * @param {{ email: string, password: string }} data
 * @returns {Promise<{ token: string, user: object }>}
 */
export async function login(data) {
    const { data: res } = await apiClient.post("/auth/login", data);
    return res;
}

/**
 * Validate the current token and return the authenticated user.
 * @returns {Promise<{ user: object }>}
 */
export async function getMe() {
    const { data: res } = await apiClient.get("/auth/me");
    return res;
}

/**
 * Invalidate the current session on the server.
 */
export async function logout() {
    await apiClient.post("/auth/logout");
}
