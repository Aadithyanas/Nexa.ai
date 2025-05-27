const fs = require("fs")
const pdfParse = require("pdf-parse")
const Tesseract = require("tesseract.js")
const { getGeminiModel } = require("./ai")

/**
 * Clean text by removing unwanted characters
 * @param {string} text - Text to clean
 * @returns {string} - Cleaned text
 */
function cleanText(text) {
  if (!text || typeof text !== "string") {
    return ""
  }
  return text.replace(/[^\w\s.,!?'-]/g, "")
}

/**
 * Summarize text content using Gemini
 * @param {string} text - Text to summarize
 * @returns {Promise<string>} - Summarized text
 */
async function summarizeTextWithGemini(text) {
  try {
    const model = getGeminiModel("gemini-2.0-flash")

    const prompt = `
Please provide a detailed summary with explanations and key points from the following content:
---
${text}
`

    console.log("Sending text to Gemini for summarization")
    const result = await model.generateContent(prompt)
    const response = await result.response
    console.log("Received text summary from Gemini")
    return response.text()
  } catch (error) {
    console.error("Error in summarizeTextWithGemini:", error)
    throw new Error(`Failed to summarize text: ${error.message}`)
  }
}

/**
 * Extract content from image using Gemini
 * @param {string} imagePath - Path to image file
 * @param {string} mimeType - MIME type of image
 * @returns {Promise<string>} - Extracted and summarized content
 */
async function summarizeImageWithGemini(imagePath, mimeType = null) {
  try {
    // Determine MIME type from file extension if not provided
    if (!mimeType) {
      const extension = imagePath.split('.').pop().toLowerCase();
      mimeType = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp'
      }[extension] || 'image/jpeg'; // default to jpeg if unknown
    }

    // Verify file exists and is readable
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found at path: ${imagePath}`);
    }

    const stats = fs.statSync(imagePath);
    if (stats.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('Image file is too large (max 10MB)');
    }

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
    console.log("Received image analysis from Gemini");
    return response.text();
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
    return ""
  }

  const sentences = text.split(/[.!?]\s+/)
  let truncatedText = sentences.slice(0, minSentences).join(". ")

  // Add period if it doesn't end with punctuation
  if (truncatedText && !truncatedText.match(/[.!?]$/)) {
    truncatedText += "."
  }

  if (truncatedText.length > 600) {
    truncatedText = truncatedText.slice(0, 600) + "..."
  }

  return truncatedText
}

/**
 * Extract text from PDF file
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromPDF(filePath) {
  try {
    console.log(`Reading PDF file: ${filePath}`)
    const dataBuffer = fs.readFileSync(filePath)
    const data = await pdfParse(dataBuffer)
    console.log(`Successfully extracted text from PDF. Character count: ${data.text.length}`)
    return data.text
  } catch (error) {
    console.error("Error extracting text from PDF:", error)
    throw new Error(`Failed to extract text from PDF: ${error.message}`)
  }
}

/**
 * Extract text from image using OCR
 * @param {string} filePath - Path to image file
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromImage(filePath) {
  try {
    console.log(`Processing image with Tesseract OCR: ${filePath}`)
    const result = await Tesseract.recognize(filePath, "eng", {
      logger: (m) => console.log(`Tesseract: ${m.status} - ${Math.floor(m.progress * 100)}%`),
    })
    console.log(`OCR completed. Character count: ${result.data.text.length}`)
    return result.data.text
  } catch (error) {
    console.error("Error in OCR processing:", error)
    throw new Error(`OCR processing failed: ${error.message}`)
  }
}

/**
 * Check if OCR-extracted text contains meaningful content
 * @param {string} text - Text to analyze
 * @returns {boolean} - True if text appears to contain meaningful content
 */
function containsMeaningfulText(text) {
  if (!text || typeof text !== "string") {
    return false
  }

  // Count words (at least 3 chars) to filter out random character noise
  const wordCount = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 2).length

  // Check for presence of proper sentences (starts with capital, ends with punctuation)
  const containsRealSentences = /[A-Z][a-z]+[,.!?](\s|$)/.test(text)

  // Check for common words that indicate real content
  const commonWordsRegex = /\b(the|and|this|that|with|from|have|for|not|are|was|were|what|when|where|why|how)\b/i
  const containsCommonWords = commonWordsRegex.test(text)

  // Ratio of alphanumeric to special characters - gibberish often has many special chars
  const alphanumericCount = (text.match(/[a-zA-Z0-9]/g) || []).length
  const totalChars = text.length
  const alphanumericRatio = totalChars > 0 ? alphanumericCount / totalChars : 0

  console.log(
    `Text analysis - Word count: ${wordCount}, Contains sentences: ${containsRealSentences}, Contains common words: ${containsCommonWords}, Alphanumeric ratio: ${alphanumericRatio.toFixed(2)}`,
  )

  // Decision logic for what constitutes "meaningful" text
  return (
    (wordCount >= 5 && containsRealSentences && containsCommonWords) || (wordCount >= 10 && alphanumericRatio > 0.7)
  )
}

module.exports = {
  cleanText,
  summarizeTextWithGemini,
  summarizeImageWithGemini,
  truncateToSentences,
  extractTextFromPDF,
  extractTextFromImage,
  containsMeaningfulText,
}
