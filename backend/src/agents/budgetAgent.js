import { budgetAnalyzer } from "../tools/budgetAnalyzer.js";
import { askAgent } from "../services/agentService.js";

export const budgetAgent = async (message) => {
  const budgetRegex =
    /(?:salary|income|earn)\s*(?:is|=)?\s*₹?\s*(\d+)[\s\S]*?(?:expense|expenses|spend)\s*(?:is|=)?\s*₹?\s*(\d+)/i;

  const match = message.match(budgetRegex);

  if (match) {
    const income = parseFloat(match[1]);
    const expenses = parseFloat(match[2]);

    const result = budgetAnalyzer(income, expenses);

    return {
      agent: "Budget Agent",
      tool: "Budget Analyzer",
      reply: `📊 Budget Analysis

Monthly Income: ₹${income.toLocaleString("en-IN")}
Monthly Expenses: ₹${expenses.toLocaleString("en-IN")}
Monthly Savings: ₹${result.savings.toLocaleString("en-IN")}
Savings Rate: ${result.savingsRate}%

Financial Status: ${result.status}

This was calculated using the Budget Analyzer Tool.`,
    };
  }

  const reply = await askAgent(
    `You are a Budget Planning Expert. Help users plan income, expenses, savings, emergency fund and financial goals. Use bullet points.`,
    message
  );

  return {
    agent: "Budget Agent",
    tool: "None",
    reply,
  };
};