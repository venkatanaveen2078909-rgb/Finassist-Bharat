import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { emiCalculator } from "../src/tools/emiCalculator.js";
import { sipCalculator } from "../src/tools/sipCalculator.js";
import { fdCalculator } from "../src/tools/fdCalculator.js";
import { budgetAnalyzer } from "../src/tools/budgetAnalyzer.js";
import { loanEligibility } from "../src/tools/loanEligibility.js";

describe("Deterministic Financial Tools Suite", () => {
  describe("EMI Calculator", () => {
    it("calculates correct EMI for 500,000 at 10% for 5 years", () => {
      const res = emiCalculator(500000, 10, 5);
      // Standard formula: 500000 * (0.10/12) * (1 + 0.10/12)^60 / ((1 + 0.10/12)^60 - 1) = 10623.52
      assert.equal(res.emi, 10624);
      assert.equal(res.principal, 500000);
      assert.equal(res.totalPayment, 637440);
      assert.equal(res.totalInterest, 137440);
      assert.ok(res.disclaimer.includes("not financial advice"));
    });

    it("handles 0% interest rate without NaN", () => {
      const res = emiCalculator(120000, 0, 1);
      // 120,000 / 12 = 10,000 per month
      assert.equal(res.emi, 10000);
      assert.equal(res.totalInterest, 0);
      assert.equal(res.totalPayment, 120000);
      assert.ok(!Number.isNaN(res.emi));
    });

    it("throws error on invalid principal or tenure", () => {
      assert.throws(() => emiCalculator(-5000, 10, 5), /Principal must be greater than 0/);
      assert.throws(() => emiCalculator(50000, 10, 0), /Tenure must be greater than 0/);
      assert.throws(() => emiCalculator(50000, -5, 2), /Interest rate cannot be negative/);
    });
  });

  describe("SIP Calculator", () => {
    it("calculates known SIP returns for 5000/month at 12% for 10 years", () => {
      const res = sipCalculator(5000, 12, 10);
      // 5000 invested per month for 120 months = 600,000
      // Future value approx: 5000 * ((1 + 0.01)^120 - 1)/0.01 * 1.01 = ~1,161,695
      assert.equal(res.investedAmount, 600000);
      assert.ok(res.totalValue >= 1150000 && res.totalValue <= 1170000);
      assert.equal(res.estimatedReturns, res.totalValue - res.investedAmount);
      assert.ok(res.disclaimer.includes("not financial advice"));
      assert.ok(res.assumption.includes("Compounded monthly"));
    });

    it("handles 0% return rate safely", () => {
      const res = sipCalculator(1000, 0, 2);
      assert.equal(res.investedAmount, 24000);
      assert.equal(res.totalValue, 24000);
      assert.equal(res.estimatedReturns, 0);
    });

    it("throws error on invalid parameters", () => {
      assert.throws(() => sipCalculator(0, 12, 5), /Monthly amount must be greater than 0/);
      assert.throws(() => sipCalculator(5000, 12, -1), /Years must be greater than 0/);
    });
  });

  describe("FD Calculator", () => {
    it("calculates maturity for 100,000 at 7% for 2 years with annual compounding", () => {
      const res = fdCalculator(100000, 7, 2);
      // 100,000 * 1.07^2 = 114,490
      assert.equal(res.maturityAmount, 114490);
      assert.equal(res.interestEarned, 14490);
      assert.ok(res.assumption.includes("Annual compounding"));
      assert.ok(res.disclaimer.includes("not financial advice"));
    });

    it("handles 0% rate safely", () => {
      const res = fdCalculator(50000, 0, 3);
      assert.equal(res.maturityAmount, 50000);
      assert.equal(res.interestEarned, 0);
    });

    it("validates positive amount and tenure", () => {
      assert.throws(() => fdCalculator(-100, 7, 1), /Amount must be greater than 0/);
      assert.throws(() => fdCalculator(1000, 7, 0), /Tenure must be greater than 0/);
    });
  });

  describe("Budget Analyzer", () => {
    it("evaluates healthy budget correctly", () => {
      const res = budgetAnalyzer(75000, 25000);
      assert.equal(res.monthlyIncome, 75000);
      assert.equal(res.monthlyExpenses, 25000);
      assert.equal(res.savings, 50000);
      assert.equal(res.savingsRate, 66.67);
      assert.equal(res.status, "Healthy");
      assert.ok(res.disclaimer.includes("not financial advice"));
    });

    it("evaluates risky budget when expenses exceed savings benchmark", () => {
      const res = budgetAnalyzer(50000, 48000);
      assert.equal(res.savings, 2000);
      assert.equal(res.savingsRate, 4.0);
      assert.equal(res.status, "Risky");
    });

    it("handles 0 income safely without NaN or division by zero", () => {
      const res = budgetAnalyzer(0, 15000);
      assert.equal(res.monthlyIncome, 0);
      assert.equal(res.savings, -15000);
      assert.equal(res.savingsRate, 0);
      assert.equal(res.status, "Deficit");
      assert.ok(!Number.isNaN(res.savingsRate));
    });

    it("throws on negative income or expenses", () => {
      assert.throws(() => budgetAnalyzer(-500, 100), /Income cannot be negative/);
      assert.throws(() => budgetAnalyzer(500, -100), /Expenses cannot be negative/);
    });
  });

  describe("Loan Eligibility Calculator", () => {
    it("computes standard FOIR-based loan eligibility", () => {
      const res = loanEligibility(60000, 10000);
      // 50% FOIR of 60,000 = 30,000. Less 10,000 obligations = 20,000 eligible EMI
      assert.equal(res.eligibleEMI, 20000);
      assert.ok(res.eligible);
      assert.ok(res.estimatedLoanAmount > 1000000);
      assert.ok(res.assumption.includes("FOIR"));
      assert.ok(res.disclaimer.includes("not financial advice"));
    });

    it("marks ineligible if obligations exceed FOIR capacity", () => {
      const res = loanEligibility(40000, 25000);
      // 50% of 40,000 is 20,000. Obligations are 25,000 -> 0 capacity
      assert.equal(res.eligibleEMI, 0);
      assert.equal(res.eligible, false);
      assert.equal(res.estimatedLoanAmount, 0);
    });

    it("validates non-negative salary and obligations", () => {
      assert.throws(() => loanEligibility(0, 0), /Monthly salary must be greater than 0/);
      assert.throws(() => loanEligibility(50000, -100), /Obligations cannot be negative/);
    });
  });
});
