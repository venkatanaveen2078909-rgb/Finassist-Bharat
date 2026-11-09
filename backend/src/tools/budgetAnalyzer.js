/**
 * Deterministic Monthly Budget & Savings Analyzer.
 *
 * @param {number} monthlyIncome - Monthly income in rupees
 * @param {number} monthlyExpenses - Monthly expenses in rupees
 * @returns {Object}
 */
export const budgetAnalyzer = (monthlyIncome, monthlyExpenses = 0) => {
  const inc = Number(monthlyIncome);
  const exp = Number(monthlyExpenses);

  if (Number.isNaN(inc) || inc < 0) {
    throw new Error("Income cannot be negative");
  }
  if (Number.isNaN(exp) || exp < 0) {
    throw new Error("Expenses cannot be negative");
  }

  const savings = inc - exp;

  if (inc === 0) {
    return {
      monthlyIncome: 0,
      monthlyExpenses: exp,
      savings,
      savingsRate: 0,
      status: "Deficit",
      suggestion: "Income is zero. Prioritize establishing an income stream or emergency support.",
      disclaimer: "This budget analysis is for informational purposes and not financial advice.",
    };
  }

  const savingsRate = Number(((savings / inc) * 100).toFixed(2));

  let status = "Healthy";
  let suggestion = "Great job! You are saving over 25% of your income. Consider investing surplus in SIP or FD.";
  if (savingsRate < 10) {
    status = "Risky";
    suggestion = "High expenses relative to income. Review discretionary spending to improve savings buffer.";
  } else if (savingsRate < 25) {
    status = "Moderate";
    suggestion = "Moderate savings. Aiming for 20-30% savings according to the 50-30-20 rule will strengthen your safety net.";
  }

  return {
    monthlyIncome: inc,
    monthlyExpenses: exp,
    savings,
    savingsRate,
    status,
    suggestion,
    disclaimer: "This budget analysis is for informational purposes and not financial advice.",
  };
};