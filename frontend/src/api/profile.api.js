import apiClient from "./axios";

/**
 * Fetch the current user's profile.
 * Returns null if the profile does not exist (404).
 * Re-throws on any other error.
 */
export async function getProfile() {
    try {
        const { data } = await apiClient.get("/profile");
        return data;
    } catch (error) {
        if (error.response?.status === 404) {
            return null;
        }
        throw error;
    }
}

/**
 * Create (or update) the current user's profile.
 * @param {{ age: number, income: number, category: string, state: string }} profileData
 */
export async function createProfile(profileData) {
    const { data } = await apiClient.post("/profile", profileData);
    return data;
}
