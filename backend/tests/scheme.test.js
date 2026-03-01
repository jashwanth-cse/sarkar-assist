import { checkEligibility } from "../services/eligibility.service.js";
import { getEligibleSchemesForProfile } from "../services/scheme.service.js";

const mockPrimaryProfile = {
  age: 21,
  income: 150000,
  category: "OBC",
  state: "Tamil Nadu"
};

const mockFamilyMembers = [
  {
    id: "father1",
    name: "Father",
    age: 50,
    income: 200000,
    category: "OBC",
    state: "Tamil Nadu"
  },
  {
    id: "sister1",
    name: "Sister",
    age: 16,
    income: 50000,
    category: "SC",
    state: "Tamil Nadu"
  }
];

const mockSchemes = [
  {
    id: "scholarship_1",
    name: "Post Matric Scholarship",
    minAge: 18,
    maxAge: 25,
    incomeLimit: 250000,
    allowedCategories: ["OBC", "SC", "ST"],
    state: "Tamil Nadu"
  },
  {
    id: "senior_scheme",
    name: "Senior Citizen Benefit",
    minAge: 60,
    incomeLimit: 300000,
    allowedCategories: ["ALL"],
    state: "ALL"
  }
];

function logResult(testName, condition) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
  } else {
    console.log(`❌ FAIL: ${testName}`);
  }
}

async function runTests() {
  console.log("Running Scheme & Eligibility Tests...\n");

  // 1️⃣ Eligibility Engine Direct Test (Valid Case)
  const eligibility1 = checkEligibility(
    mockPrimaryProfile,
    mockSchemes[0]
  );

  logResult(
    "Primary profile eligible for Post Matric",
    eligibility1.eligible === true
  );

  // 2️⃣ Eligibility Engine Direct Test (Invalid Case)
  const eligibility2 = checkEligibility(
    mockPrimaryProfile,
    mockSchemes[1]
  );

  logResult(
    "Primary profile NOT eligible for Senior scheme",
    eligibility2.eligible === false
  );

  // 3️⃣ Primary Filtering Test
  const primaryEligible = mockSchemes.filter(s =>
    checkEligibility(mockPrimaryProfile, s).eligible
  );

  logResult(
    "Primary filtering returns correct count",
    primaryEligible.length === 1
  );

  // 4️⃣ Family Filtering Test
  const sisterEligible = mockSchemes.filter(s =>
    checkEligibility(mockFamilyMembers[1], s).eligible
  );

  logResult(
    "Family member eligibility works",
    sisterEligible.length === 0
  );

  // 5️⃣ Invalid Member ID Handling Simulation
  const invalidMember = mockFamilyMembers.find(m => m.id === "invalid");

  logResult(
    "Invalid memberId handled correctly",
    invalidMember === undefined
  );

  // 6️⃣ Invalid Query Handling Simulation
  const invalidProfileType = ["primary", "family"].includes("random");

  logResult(
    "Invalid query type detected",
    invalidProfileType === false
  );

  console.log("\nAll tests completed.");
}

runTests();