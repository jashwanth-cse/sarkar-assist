import apiClient from "./axios";

// ─── Admin Scheme CRUD ────────────────────────────────────────────────────────

export async function adminGetSchemes() {
    const { data } = await apiClient.get("/admin/schemes");
    return data;
}

export async function adminCreateScheme(payload) {
    const { data } = await apiClient.post("/admin/schemes", payload);
    return data;
}

export async function adminUpdateScheme(id, payload) {
    const { data } = await apiClient.put(`/admin/schemes/${id}`, payload);
    return data;
}

export async function adminDeleteScheme(id) {
    await apiClient.delete(`/admin/schemes/${id}`);
}
