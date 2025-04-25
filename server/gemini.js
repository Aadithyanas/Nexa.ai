import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const Gemini_Api = "AIzaSyCTVtWact-y76MTpujnerE0CmgQsBl2KT0"; // 🔐 Move to .env in production

const genAI = new GoogleGenerativeAI(Gemini_Api);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

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

/**
 * General prompt-based Gemini call
 * @param {string} prompt - Full prompt string
 * @returns {Promise<string>}
 */
export async function askGemini(prompt) {
  const result = await chatSession.sendMessage(prompt);
  const responseText = await result.response.text();
  return responseText.trim().replace(/\s+/g, ' ');
}

/**
 * Summarize a YouTube transcript or long text (15–20 sentence style)
 * @param {string} rawTranscript
 * @returns {Promise<string>}
 */
export async function summarizeTranscript(rawTranscript) {
  const prompt = `${rawTranscript}

Please summarize this transcript into a clear, friendly summary in 15 to 20 full sentences. Do not use bullet points or special formatting. Just natural language.`;

  return await askGemini(prompt);
}

/**
 * Summarize with a conditioned template (your original version)
 * Adds paragraph-style instruction automatically
 * @param {string} prompt - raw input (like a transcript)
 * @returns {Promise<string>}
 */
export async function summarizeWithGemini(prompt) {
  const conditionedPrompt = `${prompt}

Please summarize this YouTube transcript into a clear, friendly summary in **15 to 20 full sentences**, without using bullet points, numbering, or special symbols. Just write it as a paragraph.`;

  const result = await chatSession.sendMessage(conditionedPrompt);
  const responseText = await result.response.text();
  return responseText.trim().replace(/\s+/g, ' ');
}
