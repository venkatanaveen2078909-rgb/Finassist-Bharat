import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const getIntentFromGemini = async (message) => {

  const prompt = `

You are an Intent Detection AI.

Classify the user query into ONLY ONE category.

Categories:

BANKING

LOAN

INVESTMENT

INSURANCE

GENERAL

Return ONLY ONE WORD.

User:

${message}

`;

  try {

    const response = await ai.models.generateContent({

      model:"gemini-2.5-flash",

      contents:prompt

    });

    return response.text.trim().toUpperCase();

  }

  catch(error){

    console.log(error);

    return "GENERAL";

  }

};