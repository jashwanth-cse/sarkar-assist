/**
 * Isolated unit test for the eligibility rule engine v3.
 * Does NOT import firebase-admin — tests only pure checkEligibility logic.
 * Verifies { isEligible, reason } return shape.
 */

import { calculateAge } from "../utils/dateUtils.js";

// ─── Inline engine (mirrors eligibility.service.js) ──────────────────────────

const SENIOR_CITIZEN_MIN_AGE = 60;

const applyTargetGroupGuards = (userProfile, scheme, age) => {
    const tg = Array.isArray(scheme.targetGroup) ? scheme.targetGroup : [];
    if (scheme.schemeCategory === "Pension" && age < SENIOR_CITIZEN_MIN_AGE)
        return { passed: false, reason: "Scheme for senior citizens only" };
    if (tg.includes("Senior Citizens") && age < SENIOR_CITIZEN_MIN_AGE)
        return { passed: false, reason: "Scheme for senior citizens only" };
    if (tg.includes("Students") && !userProfile.isStudent)
        return { passed: false, reason: "Student status required" };
    if (tg.includes("Farmers") && !userProfile.landOwnership)
        return { passed: false, reason: "Scheme for farmers only" };
    if (tg.includes("Working Women") && userProfile.gender !== "Female")
        return { passed: false, reason: "Gender restriction" };
    return { passed: true, reason: null };
};

const checkEligibility = (userProfile, scheme) => {
    const rules = scheme.eligibilityRules ?? {};
    const age = calculateAge(userProfile.dateOfBirth);

    if (rules.minAge != null && age < rules.minAge)
        return { isEligible: false, reason: "Age below minimum requirement" };
    if (rules.maxAge != null && age > rules.maxAge)
        return { isEligible: false, reason: "Age exceeds maximum limit" };
    if (rules.incomeLimit != null && userProfile.annualIncome > rules.incomeLimit)
        return { isEligible: false, reason: "Income exceeds scheme limit" };
    if (Array.isArray(rules.allowedCategories) && rules.allowedCategories.length > 0) {
        if (!rules.allowedCategories.includes("ALL") && !rules.allowedCategories.includes(userProfile.category))
            return { isEligible: false, reason: "Category not eligible" };
    }
    if (rules.gender != null && rules.gender !== "Any" && userProfile.gender !== rules.gender)
        return { isEligible: false, reason: "Gender restriction" };
    if (rules.disabilityRequired === true && !userProfile.isDisabled)
        return { isEligible: false, reason: "Disability required" };
    if (rules.studentOnly === true && !userProfile.isStudent)
        return { isEligible: false, reason: "Student status required" };
    if (rules.employmentStatus != null && rules.employmentStatus !== "Any" && userProfile.employmentStatus !== rules.employmentStatus)
        return { isEligible: false, reason: "Employment status mismatch" };
    if (rules.state != null && rules.state !== "ALL" && userProfile.state !== rules.state)
        return { isEligible: false, reason: "State restriction" };

    const guard = applyTargetGroupGuards(userProfile, scheme, age);
    if (!guard.passed) return { isEligible: false, reason: guard.reason };

    return { isEligible: true, reason: null };
};

// ─── Test runner ──────────────────────────────────────────────────────────────

let passed = 0, failed = 0;
const test = (name, result, expectedEligible, expectedReason = undefined) => {
    const eligibleOk = result.isEligible === expectedEligible;
    const reasonOk = expectedReason === undefined || result.reason === expectedReason;
    if (eligibleOk && reasonOk) {
        console.log(`  ✅ PASS: ${name}`);
        passed++;
    } else {
        console.log(`  ❌ FAIL: ${name}`);
        if (!eligibleOk) console.log(`         isEligible → got ${result.isEligible}, expected ${expectedEligible}`);
        if (!reasonOk) console.log(`         reason     → got "${result.reason}", expected "${expectedReason}"`);
        failed++;
    }
};

const profile = {
    dateOfBirth: "2003-06-15",   // age ~22 in 2026
    annualIncome: 150000,
    category: "OBC",
    state: "Tamil Nadu",
    gender: "Male",
    isDisabled: false,
    isStudent: true,
    landOwnership: false,
    employmentStatus: "Unemployed",
};

console.log("\n── Rule 1-2: Age ──");
test("within age range", checkEligibility(profile, { eligibilityRules: { minAge: 18, maxAge: 25, state: "ALL" } }), true, null);
test("below minAge", checkEligibility(profile, { eligibilityRules: { minAge: 25, state: "ALL" } }), false, "Age below minimum requirement");
test("above maxAge", checkEligibility(profile, { eligibilityRules: { maxAge: 20, state: "ALL" } }), false, "Age exceeds maximum limit");
test("null age rules", checkEligibility(profile, { eligibilityRules: { minAge: null, maxAge: null, state: "ALL" } }), true, null);

console.log("\n── Rule 3: Income ──");
test("within limit", checkEligibility(profile, { eligibilityRules: { incomeLimit: 200000, state: "ALL" } }), true, null);
test("exceeds limit", checkEligibility(profile, { eligibilityRules: { incomeLimit: 100000, state: "ALL" } }), false, "Income exceeds scheme limit");

console.log("\n── Rule 4: Category ──");
test("category in list", checkEligibility(profile, { eligibilityRules: { allowedCategories: ["OBC", "SC"], state: "ALL" } }), true, null);
test("category rejected", checkEligibility(profile, { eligibilityRules: { allowedCategories: ["SC", "ST"], state: "ALL" } }), false, "Category not eligible");
test("ALL wildcard", checkEligibility(profile, { eligibilityRules: { allowedCategories: ["ALL"], state: "ALL" } }), true, null);

console.log("\n── Rule 5: Gender ──");
test("gender matches", checkEligibility(profile, { eligibilityRules: { gender: "Male", state: "ALL" } }), true, null);
test("gender mismatch", checkEligibility(profile, { eligibilityRules: { gender: "Female", state: "ALL" } }), false, "Gender restriction");
test("gender Any", checkEligibility(profile, { eligibilityRules: { gender: "Any", state: "ALL" } }), true, null);

console.log("\n── Rule 6-7: Disability / Student ──");
test("disability fails", checkEligibility(profile, { eligibilityRules: { disabilityRequired: true, state: "ALL" } }), false, "Disability required");
test("disability null", checkEligibility(profile, { eligibilityRules: { disabilityRequired: null, state: "ALL" } }), true, null);
test("studentOnly pass", checkEligibility(profile, { eligibilityRules: { studentOnly: true, state: "ALL" } }), true, null);
test("studentOnly fail", checkEligibility({ ...profile, isStudent: false }, { eligibilityRules: { studentOnly: true, state: "ALL" } }), false, "Student status required");

console.log("\n── Rule 8: Employment ──");
test("employment match", checkEligibility(profile, { eligibilityRules: { employmentStatus: "Unemployed", state: "ALL" } }), true, null);
test("employment fail", checkEligibility(profile, { eligibilityRules: { employmentStatus: "Employed", state: "ALL" } }), false, "Employment status mismatch");

console.log("\n── Rule 9: State ──");
test("state matches", checkEligibility(profile, { eligibilityRules: { state: "Tamil Nadu" } }), true, null);
test("state mismatch", checkEligibility(profile, { eligibilityRules: { state: "Kerala" } }), false, "State restriction");
test("state ALL", checkEligibility(profile, { eligibilityRules: { state: "ALL" } }), true, null);

console.log("\n── Guard: Pension / Senior Citizens ──");
test("Pension age 22", checkEligibility(profile, { schemeCategory: "Pension", eligibilityRules: { state: "ALL" } }), false, "Scheme for senior citizens only");
test("Pension age 65", checkEligibility({ ...profile, dateOfBirth: "1960-01-01" }, { schemeCategory: "Pension", eligibilityRules: { state: "ALL" } }), true, null);
test("Senior age 22", checkEligibility(profile, { targetGroup: ["Senior Citizens"], eligibilityRules: { state: "ALL" } }), false, "Scheme for senior citizens only");
test("Senior age 65", checkEligibility({ ...profile, dateOfBirth: "1960-01-01" }, { targetGroup: ["Senior Citizens"], eligibilityRules: { state: "ALL" } }), true, null);

console.log("\n── Guard: Students / Farmers / Working Women ──");
test("Students pass", checkEligibility(profile, { targetGroup: ["Students"], eligibilityRules: { state: "ALL" } }), true, null);
test("Students fail", checkEligibility({ ...profile, isStudent: false }, { targetGroup: ["Students"], eligibilityRules: { state: "ALL" } }), false, "Student status required");
test("Farmers fail", checkEligibility(profile, { targetGroup: ["Farmers"], eligibilityRules: { state: "ALL" } }), false, "Scheme for farmers only");
test("Farmers pass", checkEligibility({ ...profile, landOwnership: true }, { targetGroup: ["Farmers"], eligibilityRules: { state: "ALL" } }), true, null);
test("WorkingWomen fail", checkEligibility(profile, { targetGroup: ["Working Women"], eligibilityRules: { state: "ALL" } }), false, "Gender restriction");
test("WorkingWomen pass", checkEligibility({ ...profile, gender: "Female" }, { targetGroup: ["Working Women"], eligibilityRules: { state: "ALL" } }), true, null);

console.log(`\n  Total: ${passed} passed, ${failed} failed.\n`);
