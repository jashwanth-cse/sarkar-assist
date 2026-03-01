/**
 * utils/dateUtils.js
 *
 * Pure date helper utilities.
 * Age is NEVER stored — always calculated at runtime from dateOfBirth.
 */

/**
 * Calculate age in full years from an ISO date string.
 *
 * @param {string} dateOfBirth  - ISO 8601 date string, e.g. "2000-06-15"
 * @returns {number} age in full years as of today
 */
export const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const dob = new Date(dateOfBirth);

    let age = today.getFullYear() - dob.getFullYear();
    const hasHadBirthdayThisYear =
        today.getMonth() > dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());

    if (!hasHadBirthdayThisYear) age -= 1;

    return age;
};

/**
 * Check whether a string is a valid past ISO date (YYYY-MM-DD).
 *
 * @param {string} value
 * @returns {boolean}
 */
export const isValidPastDate = (value) => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
        return false;
    const date = new Date(value);
    if (isNaN(date.getTime())) return false;
    return date < new Date();
};
