/**
 * utils/filterSchemes.js
 *
 * Pure, stateless filter functions applied AFTER eligibility evaluation.
 * No database access, no eligibility logic — only post-processing.
 */

/**
 * Apply optional filters to a schemes array.
 *
 * @param {object[]} schemes  — array of scheme summary objects
 * @param {object}   filters  — { schemeCategory?, state?, search? }
 * @returns {object[]} filtered array
 */
export const applyFilters = (schemes, filters = {}) => {
    if (!filters || typeof filters !== "object") return schemes;

    let result = schemes;

    // Filter 1 — schemeCategory: exact match
    if (filters.schemeCategory && typeof filters.schemeCategory === "string") {
        const category = filters.schemeCategory.trim();
        result = result.filter(
            (s) => s.schemeCategory?.toLowerCase() === category.toLowerCase()
        );
    }

    // Filter 2 — state: match scheme's state or "ALL" (nationally applicable)
    if (filters.state && typeof filters.state === "string") {
        const state = filters.state.trim();
        result = result.filter(
            (s) => s.state === "ALL" || s.state?.toLowerCase() === state.toLowerCase()
        );
    }

    // Filter 3 — search: case-insensitive across schemeName, description, tags
    if (filters.search && typeof filters.search === "string") {
        const term = filters.search.trim().toLowerCase();
        if (term.length > 0) {
            result = result.filter((s) => {
                const inName = s.schemeName?.toLowerCase().includes(term);
                const inDesc = s.description?.toLowerCase().includes(term);
                const inTags = Array.isArray(s.tags) &&
                    s.tags.some((tag) => tag.toLowerCase().includes(term));
                return inName || inDesc || inTags;
            });
        }
    }

    return result;
};
