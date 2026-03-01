import { checkEligibility } from "../services/eligibility.service.js";

const profile = {
    age: 21,
    income: 150000,
    category: "OBC",
    state: "Tamil Nadu"
};

const scheme = {
    minAge: 18,
    maxAge: 25,
    incomeLimit: 200000,
    allowedCategories: ["OBC", "SC"],
    state: "Tamil Nadu"
};

console.log(checkEligibility(profile, scheme));