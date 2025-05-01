let Gemini_Api = "AIzaSyCTVtWact-y76MTpujnerE0CmgQsBl2KT0";

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(Gemini_Api);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

const generationConfig = {
  temperature: 0.8,          // slightly more focused responses
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 300,      // room for 5 sentences
  responseMimeType: "text/plain",
};

async function run(prompt, history = []) {
  const chatSession = model.startChat({
    generationConfig,
    history: history || [],
  });

  // Instruct the model to reply concisely in 3–5 complete sentences
  const conditionedPrompt = `${prompt}\n\nPlease answer in 3 to 5 complete sentences. Be friendly and clear.`;

  // Retry configuration
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await chatSession.sendMessage(conditionedPrompt);
      const responseText = await result.response.text();

      // Optional cleanup: Remove excessive whitespace and trim
      const cleanedText = responseText.trim().replace(/\s+/g, ' ');

      return cleanedText;
    } catch (error) {
      console.error(`Gemini API Error (Attempt ${attempt}/${maxRetries}):`, error);
      lastError = error;

      // If it's a 503 error and we haven't reached max retries, wait and try again
      if ((error.message.includes('503') || error.message.includes('overloaded')) && attempt < maxRetries) {
        console.log(`Retrying in ${retryDelay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }

      // Handle specific error cases
      if (error.message.includes('503') || error.message.includes('overloaded')) {
        return "I'm currently experiencing high demand. Please try again in a few moments.";
      } else if (error.message.includes('429') || error.message.includes('quota')) {
        return "I've reached my usage limit. Please try again later.";
      } else {
        return "I'm having trouble processing your request right now. Please try again later.";
      }
    }
  }

  // If we've exhausted all retries, return a friendly error message
  console.error('All retry attempts failed:', lastError);
  return "I'm having trouble processing your request right now. Please try again in a few minutes.";
}

export default run;


//