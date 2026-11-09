/**
 * Deterministic Systematic Investment Plan (SIP) Calculator.
 *
 * @param {number} monthlyAmount - Monthly SIP contribution in rupees
 * @param {number} expectedAnnualRate - Expected annual return rate in percent (e.g. 12 for 12%)
 * @param {number} years - Investment tenure in years
 * @returns {Object}
 */
export const sipCalculator = (monthlyAmount, expectedAnnualRate = 12, years = 5) => {
  const p = Number(monthlyAmount);
  const r = Number(expectedAnnualRate);
  const y = Number(years);

  if (Number.isNaN(p) || p <= 0) {
    throw new Error("Monthly amount must be greater than 0");
  }
  if (Number.isNaN(r) || r < 0) {
    throw new Error("Expected return rate cannot be negative");
  }
  if (Number.isNaN(y) || y <= 0) {
    throw new Error("Years must be greater than 0");
  }

  const months = Math.round(y * 12);
  const investedAmount = p * months;

  let totalValue = 0;
  if (r === 0) {
    totalValue = investedAmount;
  } else {
    const monthlyRate = r / 12 / 100;
    // FV = P * [((1 + i)^n - 1) / i] * (1 + i)
    totalValue = Math.round(
      p * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate)
    );
  }

  const estimatedReturns = Math.max(0, totalValue - investedAmount);

  return {
    monthlyAmount: p,
    expectedRate: r,
    years: y,
    months,
    investedAmount,
    estimatedReturns,
    totalValue,
    assumption: "Compounded monthly, assumes constant return rate throughout tenure",
    disclaimer: "Mutual fund investments are subject to market risks. This is not financial advice.",
  };
};
