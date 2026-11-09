import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const askAgent = async (systemPrompt, userMessage) => {
  try {
    const response = await openai.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error("LLM API Error:", error.message || error);
    return "I'm unable to answer at the moment. (Error: " + (error.message || "Unknown Error") + ")";
  }
};