/**
 * Deterministic Equated Monthly Installment (EMI) Calculator.
 *
 * @param {number} principal - Loan amount in rupees
 * @param {number} annualRate - Annual interest rate in percent (e.g., 8.5 for 8.5%)
 * @param {number} years - Loan tenure in years
 * @returns {Object}
 */
export const emiCalculator = (principal, annualRate, years) => {
  const p = Number(principal);
  const r = Number(annualRate);
  const y = Number(years);

  if (Number.isNaN(p) || p <= 0) {
    throw new Error("Principal must be greater than 0");
  }
  if (Number.isNaN(r) || r < 0) {
    throw new Error("Interest rate cannot be negative");
  }
  if (Number.isNaN(y) || y <= 0) {
    throw new Error("Tenure must be greater than 0");
  }

  const months = Math.round(y * 12);

  let emi = 0;
  if (r === 0) {
    // 0% interest case
    emi = Math.round(p / months);
  } else {
    const monthlyRate = r / 12 / 100;
    const factor = Math.pow(1 + monthlyRate, months);
    emi = Math.round((p * monthlyRate * factor) / (factor - 1));
  }

  const totalPayment = emi * months;
  const totalInterest = Math.max(0, totalPayment - p);

  return {
    principal: p,
    annualRate: r,
    years: y,
    months,
    emi,
    totalInterest,
    totalPayment,
    assumption: "Fixed interest rate, monthly reducing balance",
    disclaimer: "This calculation is an estimate and not financial advice.",
  };
};