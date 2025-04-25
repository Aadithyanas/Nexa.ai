let Gemini_Api = "AIzaSyCTVtWact-y76MTpujnerE0CmgQsBl2KT0";

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(Gemini_Api);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

const generationConfig = {
  temperature: 0.8,          // slightly more focused responses
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 300,      // room for 5 sentences
  responseMimeType: "text/plain",
};

async function run(prompt) {
  const chatSession = model.startChat({
    generationConfig,
    history: [],
  });

  // Instruct the model to reply concisely in 3–5 complete sentences
  const conditionedPrompt = `${prompt}\n\nPlease answer in 3 to 5 complete sentences. Be friendly and clear.`;

  const result = await chatSession.sendMessage(conditionedPrompt);
  const responseText = await result.response.text();

  // Optional cleanup: Remove excessive whitespace and trim
  const cleanedText = responseText.trim().replace(/\s+/g, ' ');

  return cleanedText;
}

export default run;


//
