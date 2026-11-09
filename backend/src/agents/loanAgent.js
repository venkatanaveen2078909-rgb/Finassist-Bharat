import { askAgent } from "../services/agentService.js";
import { emiCalculator } from "../tools/emiCalculator.js";

export const loanAgent = async (message) => {
  console.log("Loan Agent received:", message);

  const emiRegex =
    /(\d+)\s*(lakh|lakhs)?[\s\S]*?(\d+\.?\d*)%?[\s\S]*?(\d+)\s*(year|years)/i;

  const match = message.match(emiRegex);

  console.log("EMI Match:", match);

  if (match) {
    let amount = parseFloat(match[1]);

    if (match[2]) {
      amount = amount * 100000;
    }

    const rate = parseFloat(match[3]);
    const years = parseInt(match[4]);

    const result = emiCalculator(amount, rate, years);

    return {
      agent: "Loan Agent",
      tool: "EMI Tool",
      reply: `🏠 EMI Calculation

Loan Amount: ₹${amount.toLocaleString("en-IN")}
Interest Rate: ${rate}%
Tenure: ${years} years

💰 Monthly EMI: ₹${Number(result.emi).toLocaleString("en-IN")}

This result was calculated using the EMI Calculator Tool.`,
    };
  }

  const systemPrompt = `
You are FinAssist AI Loan Advisor.
Help with home loans, personal loans, education loans, vehicle loans, EMI, eligibility, and interest rates.
Use bullet points and suggest next steps.
`;

  const reply = await askAgent(systemPrompt, message);

  return {
    agent: "Loan Agent",
    tool: "None",
    reply,
  };
};