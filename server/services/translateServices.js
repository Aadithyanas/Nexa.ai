// services/translateServices.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyCTVtWact-y76MTpujnerE0CmgQsBl2KT0"; // Ensure this is in your .env file

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const generationConfig = {
  temperature: 0.8,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 1000,
  responseMimeType: "text/plain",
};

const chatSession = model.startChat({
  generationConfig,
  history: [],
});

export async function translateText(text, targetLang) {
  const prompt = `Translate the following text into ${targetLang.toUpperCase()}:\n\n"${text}"`;

  const result = await chatSession.sendMessage(prompt);
  const responseText = await result.response.text();
  return responseText.trim();
}
