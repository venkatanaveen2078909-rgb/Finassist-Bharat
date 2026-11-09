/**
 * Deterministic Fixed Deposit (FD) Calculator.
 *
 * @param {number} amount - Principal deposit amount in rupees
 * @param {number} rate - Annual interest rate in percent (e.g. 7 for 7%)
 * @param {number} years - Tenure in years
 * @returns {Object}
 */
export const fdCalculator = (amount, rate, years) => {
  const p = Number(amount);
  const r = Number(rate);
  const y = Number(years);

  if (Number.isNaN(p) || p <= 0) {
    throw new Error("Amount must be greater than 0");
  }
  if (Number.isNaN(r) || r < 0) {
    throw new Error("Interest rate cannot be negative");
  }
  if (Number.isNaN(y) || y <= 0) {
    throw new Error("Tenure must be greater than 0");
  }

  // Annual compounding: A = P * (1 + r/100)^y
  const maturityAmount = Math.round(p * Math.pow(1 + r / 100, y));
  const interestEarned = Math.max(0, maturityAmount - p);

  return {
    amount: p,
    rate: r,
    years: y,
    maturityAmount,
    interestEarned,
    compounding: "annual",
    assumption: "Annual compounding on fixed deposit",
    disclaimer: "Actual bank returns may vary based on compounding frequency and applicable TDS. This is not financial advice.",
  };
};