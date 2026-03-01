import apiClient from "./axios";

/**
 * Fetch the list of schemes with eligibility status for the current user.
 * @returns {Promise<Array<{id: string, schemeName: string, description: string, eligible: boolean, reasons: string[]}>>}
 */
export async function getSchemes() {
    const { data } = await apiClient.get("/schemes");
    return data;
}
