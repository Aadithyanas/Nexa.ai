const { GoogleGenerativeAI } = require("@google/generative-ai")
require("dotenv").config()

// Check for API key
const API_KEY = process.env.GOOGLE_GENERATIVE_AI_KEY || "AIzaSyCTVtWact-y76MTpujnerE0CmgQsBl2KT0"
if (!API_KEY) {
  console.error("ERROR: Missing GOOGLE_GENERATIVE_AI_KEY in .env file")
  process.exit(1)
}

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(API_KEY)

/**
 * Get a Gemini model instance
 * @param {string} modelName - Name of the model to use
 * @returns {Object} - Gemini model instance
 */
function getGeminiModel(modelName) {
  return genAI.getGenerativeModel({ model: modelName })
}

module.exports = {
  getGeminiModel,
}
