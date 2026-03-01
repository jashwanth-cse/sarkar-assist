import apiClient from "./axios";

// ─── Primary Profile ──────────────────────────────────────────────────────────

export async function getProfile() {
    try {
        const { data } = await apiClient.get("/profile");
        return data;
    } catch (error) {
        if (error.response?.status === 404) return null;
        throw error;
    }
}

export async function createProfile(profileData) {
    const { data } = await apiClient.post("/profile", profileData);
    return data;
}

export async function updateProfile(profileData) {
    const { data } = await apiClient.put("/profile", profileData);
    return data;
}

// ─── Family Members ───────────────────────────────────────────────────────────

export async function getFamilyMembers() {
    const { data } = await apiClient.get("/profile/family");
    return data; // array
}

export async function addFamilyMember(memberData) {
    const { data } = await apiClient.post("/profile/family", memberData);
    return data;
}

export async function updateFamilyMember(id, memberData) {
    const { data } = await apiClient.put(`/profile/family/${id}`, memberData);
    return data;
}

export async function deleteFamilyMember(id) {
    await apiClient.delete(`/profile/family/${id}`);
}

// ─── Eligibility ──────────────────────────────────────────────────────────────

export async function getEligibility(profileId) {
    const { data } = await apiClient.get(`/eligibility/${profileId}`);
    return data;
}
