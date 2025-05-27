const fs = require("fs");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");
const { getGeminiModel } = require("./ai");

/**
 * Clean text by removing unwanted characters
 * @param {string} text - Text to clean
 * @returns {string} - Cleaned text
 */
function cleanText(text) {
  if (!text || typeof text !== "string") {
    console.warn("cleanText received non-string input:", text);
    return "";
  }
  return text.replace(/[^\w\s.,!?'-]/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Summarize text content using Gemini
 * @param {string} text - Text to summarize
 * @returns {Promise<string>} - Summarized text
 */
async function summarizeTextWithGemini(text) {
  try {
    if (!text || typeof text !== "string") {
      throw new Error("Invalid text input for summarization");
    }

    const model = getGeminiModel("gemini-2.0-flash");

    const prompt = `
Please provide a detailed summary with explanations and key points from the following content:
---
${text}
`;

    console.log("Sending text to Gemini for summarization");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    if (!response || !response.text) {
      throw new Error("Invalid response from Gemini API");
    }

    const summaryText = response.text();
    if (!summaryText) {
      throw new Error("Empty summary returned from Gemini");
    }

    console.log("Received text summary from Gemini");
    return summaryText;
  } catch (error) {
    console.error("Error in summarizeTextWithGemini:", error);
    throw new Error(`Failed to summarize text: ${error.message}`);
  }
}

/**
 * Extract content from image using Gemini
 * @param {string} imagePath - Path to image file
 * @param {string} mimeType - MIME type of image
 * @returns {Promise<string>} - Extracted and summarized content
 */
async function summarizeImageWithGemini(imagePath, mimeType = "image/png") {
  try {
    const model = getGeminiModel("gemini-1.5-pro")

    console.log(`Reading image file: ${imagePath}`);
    const imageData = fs.readFileSync(imagePath);
    const base64Data = imageData.toString('base64');

    const model = getGeminiModel("gemini-1.5-pro");

    console.log("Sending image to Gemini for analysis");
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType,
        },
      },
      "Give a detailed summary or description of the image content.",
    ]);

    const response = await result.response;
    
    if (!response || !response.text) {
      throw new Error("Invalid response from Gemini API");
    }

    const summaryText = response.text();
    if (!summaryText) {
      throw new Error("Empty summary returned from Gemini");
    }

    console.log("Received image analysis from Gemini");
    return summaryText;
  } catch (error) {
    console.error("Error in summarizeImageWithGemini:", error);
    throw new Error(`Failed to analyze image: ${error.message}`);
  }
}

/**
 * Truncate text to a specified number of sentences
 * @param {string} text - Text to truncate
 * @param {number} minSentences - Minimum number of sentences to keep
 * @returns {string} - Truncated text
 */
function truncateToSentences(text, minSentences = 10) {
  if (!text || typeof text !== "string") {
    console.warn("truncateToSentences received non-string input:", text);
    return "";
  }

  const sentences = text.split(/(?<=[.!?])\s+/);
  let truncatedText = sentences.slice(0, minSentences).join(" ");

  // Add period if it doesn't end with punctuation
  if (truncatedText && !/[.!?]$/.test(truncatedText)) {
    truncatedText += ".";
  }

  if (truncatedText.length > 600) {
    truncatedText = truncatedText.slice(0, 597) + "...";
  }

  return truncatedText;
}

/**
 * Extract text from PDF file
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromPDF(filePath) {
  try {
    if (!filePath || !fs.existsSync(filePath)) {
      throw new Error("Invalid PDF file path");
    }

    console.log(`Reading PDF file: ${filePath}`);
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    
    if (!data.text) {
      throw new Error("No text extracted from PDF");
    }

    console.log(`Successfully extracted text from PDF. Character count: ${data.text.length}`);
    return data.text;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

/**
 * Extract text from image using OCR
 * @param {string} filePath - Path to image file
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromImage(filePath) {
  try {
    if (!filePath || !fs.existsSync(filePath)) {
      throw new Error("Invalid image file path");
    }

    console.log(`Processing image with Tesseract OCR: ${filePath}`);
    const result = await Tesseract.recognize(filePath, "eng", {
      logger: (m) => console.log(`Tesseract: ${m.status} - ${Math.floor(m.progress * 100)}%`),
    });
    
    if (!result?.data?.text) {
      throw new Error("No text extracted from image");
    }

    console.log(`OCR completed. Character count: ${result.data.text.length}`);
    return result.data.text;
  } catch (error) {
    console.error("Error in OCR processing:", error);
    throw new Error(`OCR processing failed: ${error.message}`);
  }
}

/**
 * Check if OCR-extracted text contains meaningful content
 * @param {string} text - Text to analyze
 * @returns {boolean} - True if text appears to contain meaningful content
 */
function containsMeaningfulText(text) {
  if (!text || typeof text !== "string") {
    return false;
  }

  const trimmedText = text.trim();
  if (trimmedText.length < 10) {
    return false;
  }

  // Count words (at least 3 chars) to filter out random character noise
  const wordCount = trimmedText
    .split(/\s+/)
    .filter((word) => word.length > 2).length;

  // Check for presence of proper sentences
  const containsRealSentences = /[A-Z][^.!?]*[.!?]/.test(trimmedText);

  // Check for common words that indicate real content
  const commonWordsRegex = /\b(the|and|this|that|with|from|have|for|not|are|was|were)\b/i;
  const containsCommonWords = commonWordsRegex.test(trimmedText);

  // Ratio of alphanumeric to special characters
  const alphanumericCount = (trimmedText.match(/[a-zA-Z0-9]/g) || []).length;
  const totalChars = trimmedText.length;
  const alphanumericRatio = totalChars > 0 ? alphanumericCount / totalChars : 0;

  console.log(
    `Text analysis - Word count: ${wordCount}, Contains sentences: ${containsRealSentences}, Contains common words: ${containsCommonWords}, Alphanumeric ratio: ${alphanumericRatio.toFixed(2)}`
  );

  return (wordCount >= 5 && containsRealSentences) || (wordCount >= 10 && alphanumericRatio > 0.7);
}

module.exports = {
  cleanText,
  summarizeTextWithGemini,
  summarizeImageWithGemini,
  truncateToSentences,
  extractTextFromPDF,
  extractTextFromImage,
  containsMeaningfulText,
};
