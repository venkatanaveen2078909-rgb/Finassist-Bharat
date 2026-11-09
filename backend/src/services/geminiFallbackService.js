import { GoogleGenerativeAI } from "@google/generative-ai";
import { getMemory } from "../memory/userProfileMemory.js";
import { makeVoiceSafe } from "../utils/spokenFormat.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function geminiFinanceFallback(userQuestion) {
  if (!process.env.GEMINI_API_KEY) {
    return "Gemini API key is missing. Add it in your env file.";
  }

  const memory = getMemory();

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const prompt = `
You are FinAssist AI voice agent.

Rules:
Speak short.
No markdown.
No bullets.
No symbols.
Use rupees in words.
Give safe financial guidance.
Do not guarantee returns.
For tax or investment decisions, suggest expert advice.

User memory:
Income: ${memory.income || "unknown"}
Expenses: ${memory.expenses || "unknown"}
EMI: ${memory.emi || "unknown"}
Goal: ${memory.goal || "unknown"}
Target amount: ${memory.targetAmount || "unknown"}

User asked:
${userQuestion}

Answer:
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return makeVoiceSafe(text);
}