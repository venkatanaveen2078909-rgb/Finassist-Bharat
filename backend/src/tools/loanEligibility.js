/**
 * Deterministic Loan Eligibility Calculator based on Banking FOIR (Fixed Obligation to Income Ratio).
 *
 * @param {number} monthlySalary - Net monthly in-hand salary in rupees
 * @param {number} currentObligations - Existing monthly EMI/obligations in rupees
 * @param {number} [foirPercent=50] - Standard FOIR limit (default 50%)
 * @param {number} [tenureYears=20] - Assumed loan tenure in years
 * @param {number} [interestRate=9.5] - Assumed annual interest rate in percent
 * @returns {Object}
 */
export const loanEligibility = (
  monthlySalary,
  currentObligations = 0,
  foirPercent = 50,
  tenureYears = 20,
  interestRate = 9.5
) => {
  const salary = Number(monthlySalary);
  const obligations = Number(currentObligations);
  const foir = Number(foirPercent);
  const years = Number(tenureYears);
  const rate = Number(interestRate);

  if (Number.isNaN(salary) || salary <= 0) {
    throw new Error("Monthly salary must be greater than 0");
  }
  if (Number.isNaN(obligations) || obligations < 0) {
    throw new Error("Obligations cannot be negative");
  }

  const maxTotalEmi = Math.round(salary * (foir / 100));
  const eligibleEMI = Math.max(0, maxTotalEmi - obligations);

  let estimatedLoanAmount = 0;
  if (eligibleEMI > 0) {
    const monthlyRate = rate / 12 / 100;
    const months = years * 12;
    // Loan Amount = EMI * [(1 + r)^n - 1] / [r * (1 + r)^n]
    const factor = Math.pow(1 + monthlyRate, months);
    estimatedLoanAmount = Math.round((eligibleEMI * (factor - 1)) / (monthlyRate * factor));
  }

  return {
    monthlySalary: salary,
    currentObligations: obligations,
    foirPercent: foir,
    eligibleEMI,
    eligible: eligibleEMI > 0,
    estimatedLoanAmount,
    assumedTenureYears: years,
    assumedRatePercent: rate,
    assumption: `Based on standard banking ${foir}% FOIR at ${rate}% annual interest over ${years} years tenure`,
    disclaimer: "Final loan sanction depends on CIBIL score, employer category, and lender underwriting policies. This is not financial advice.",
  };
};