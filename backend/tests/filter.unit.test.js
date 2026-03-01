/**
 * Isolated unit test for utils/filterSchemes.js
 * No Firebase init. Pure filter logic only.
 */
import { applyFilters } from "../utils/filterSchemes.js";

const schemes = [
    { schemeName: "Post Matric Scholarship", schemeCategory: "Scholarship", state: "Tamil Nadu", description: "For OBC students", tags: ["education", "scholarship"] },
    { schemeName: "Ayushman Bharat PMJAY", schemeCategory: "Health", state: "ALL", description: "Health insurance", tags: ["health", "insurance"] },
    { schemeName: "MGNREGA Employment", schemeCategory: "Employment", state: "ALL", description: "Work guarantee", tags: ["employment", "rural"] },
    { schemeName: "Senior Pension Scheme", schemeCategory: "Pension", state: "Kerala", description: "Old age support", tags: ["welfare", "pension"] },
];

let pass = 0, fail = 0;
const test = (name, got, expectedNames) => {
    const gotNames = got.map((s) => s.schemeName);
    const ok = JSON.stringify(gotNames) === JSON.stringify(expectedNames);
    if (ok) { console.log("  ✅ PASS:", name); pass++; }
    else { console.log("  ❌ FAIL:", name, "\n    got:     ", gotNames, "\n    expected:", expectedNames); fail++; }
};

console.log("\n── schemeCategory filter ──");
test("category=Health", applyFilters(schemes, { schemeCategory: "Health" }), ["Ayushman Bharat PMJAY"]);
test("category=Scholarship", applyFilters(schemes, { schemeCategory: "Scholarship" }), ["Post Matric Scholarship"]);
test("category=Pension", applyFilters(schemes, { schemeCategory: "Pension" }), ["Senior Pension Scheme"]);

console.log("\n── state filter (ALL passes through) ──");
test("state=Tamil Nadu", applyFilters(schemes, { state: "Tamil Nadu" }), ["Post Matric Scholarship", "Ayushman Bharat PMJAY", "MGNREGA Employment"]);
test("state=Kerala", applyFilters(schemes, { state: "Kerala" }), ["Ayushman Bharat PMJAY", "MGNREGA Employment", "Senior Pension Scheme"]);
test("state=ALL-schemes only", applyFilters(schemes, { state: "Delhi" }), ["Ayushman Bharat PMJAY", "MGNREGA Employment"]);

console.log("\n── search filter (case-insensitive, name/desc/tags) ──");
test("search=scholarship", applyFilters(schemes, { search: "scholarship" }), ["Post Matric Scholarship"]);
test("search=HEALTH (caps)", applyFilters(schemes, { search: "HEALTH" }), ["Ayushman Bharat PMJAY"]);
test("search=insurance (tag)", applyFilters(schemes, { search: "insurance" }), ["Ayushman Bharat PMJAY"]);
test("search=rural (tag)", applyFilters(schemes, { search: "rural" }), ["MGNREGA Employment"]);
test("search=old age (desc)", applyFilters(schemes, { search: "old age" }), ["Senior Pension Scheme"]);

console.log("\n── combined filters ──");
test("Health + Tamil Nadu", applyFilters(schemes, { schemeCategory: "Health", state: "Tamil Nadu" }), ["Ayushman Bharat PMJAY"]);
test("Employment + health search", applyFilters(schemes, { schemeCategory: "Employment", search: "health" }), []);

console.log("\n── edge cases ──");
test("no filters → all", applyFilters(schemes, {}), schemes.map(s => s.schemeName));
test("undefined filters", applyFilters(schemes), schemes.map(s => s.schemeName));
test("empty search string", applyFilters(schemes, { search: "" }), schemes.map(s => s.schemeName));

console.log(`\n  Total: ${pass} passed, ${fail} failed.\n`);
