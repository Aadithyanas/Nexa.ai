const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Set up Express app
const app = express();
const PORT = 3002;

// Configure file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json());

// Check for API key
const API_KEY = "AIzaSyCTVtWact-y76MTpujnerE0CmgQsBl2KT0"
if (!API_KEY) {
  console.error("ERROR: Missing GOOGLE_GENERATIVE_AI_KEY in .env file");
  process.exit(1);
}

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Clean text by removing unwanted characters
 * @param {string} text - Text to clean
 * @returns {string} - Cleaned text
 */
function cleanText(text) {
  if (!text || typeof text !== 'string') {
    return "";
  }
  return text.replace(/[^\w\s.,!?'-]/g, "");
}

/**
 * Summarize text content using Gemini
 * @param {string} text - Text to summarize
 * @returns {Promise<string>} - Summarized text
 */
async function summarizeTextWithGemini(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
Please provide a detailed summary with explanations and key points from the following content:
---
${text}
`;

    console.log("Sending text to Gemini for summarization");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log("Received text summary from Gemini");
    return response.text();
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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    console.log(`Reading image file: ${imagePath}`);
    const imageData = fs.readFileSync(imagePath).toString("base64");
    
    console.log("Sending image to Gemini for analysis");
    const result = await model.generateContent([
      {
        inlineData: {
          data: imageData,
          mimeType,
        },
      },
      "Give a detailed summary or description of the image content."
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
  if (!text || typeof text !== 'string') {
    return "";
  }
  
  const sentences = text.split(/[.!?]\s+/);
  let truncatedText = sentences.slice(0, minSentences).join(". ");
  
  // Add period if it doesn't end with punctuation
  if (truncatedText && !truncatedText.match(/[.!?]$/)) {
    truncatedText += ".";
  }

  if (truncatedText.length > 600) {
    truncatedText = truncatedText.slice(0, 600) + "...";
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
    console.log(`Reading PDF file: ${filePath}`);
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
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
    console.log(`Processing image with Tesseract OCR: ${filePath}`);
    const result = await Tesseract.recognize(filePath, "eng", {
      logger: m => console.log(`Tesseract: ${m.status} - ${Math.floor(m.progress * 100)}%`)
    });
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
  if (!text || typeof text !== 'string') {
    return false;
  }

  // Count words (at least 3 chars) to filter out random character noise
  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 2).length;
  
  // Check for presence of proper sentences (starts with capital, ends with punctuation)
  const containsRealSentences = /[A-Z][a-z]+[,.!?](\s|$)/.test(text);
  
  // Check for common words that indicate real content
  const commonWordsRegex = /\b(the|and|this|that|with|from|have|for|not|are|was|were|what|when|where|why|how)\b/i;
  const containsCommonWords = commonWordsRegex.test(text);
  
  // Ratio of alphanumeric to special characters - gibberish often has many special chars
  const alphanumericCount = (text.match(/[a-zA-Z0-9]/g) || []).length;
  const totalChars = text.length;
  const alphanumericRatio = totalChars > 0 ? alphanumericCount / totalChars : 0;
  
  console.log(`Text analysis - Word count: ${wordCount}, Contains sentences: ${containsRealSentences}, Contains common words: ${containsCommonWords}, Alphanumeric ratio: ${alphanumericRatio.toFixed(2)}`);
  
  // Decision logic for what constitutes "meaningful" text
  return (wordCount >= 5 && containsRealSentences && containsCommonWords) || 
         (wordCount >= 10 && alphanumericRatio > 0.7);
}

// File upload endpoint
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    console.error("No file received");
    return res.status(400).json({ error: "No file uploaded" });
  }
  
  const file = req.file;
  console.log(`File received: ${file.originalname}, Type: ${file.mimetype}, Size: ${file.size} bytes`);
  
  try {
    let text = "";
    let summary = "";
    
    // Process file based on type
    if (file.mimetype === "application/pdf") {
      text = await extractTextFromPDF(file.path);
      console.log("Extracted text from PDF, now summarizing");
      summary = await summarizeTextWithGemini(text);
    } 
    else if (file.mimetype.startsWith("image/")) {
      // Try OCR first
      text = await extractTextFromImage(file.path);
      
      // Check if the extracted text is meaningful or just noise
      if (containsMeaningfulText(text)) {
        // If we got substantial text from OCR, summarize it
        console.log("Meaningful text found in image via OCR, summarizing text content");
        const cleanedText = cleanText(text);
        summary = await summarizeTextWithGemini(cleanedText);
      } else {
        // If OCR didn't yield meaningful text, use image analysis
        console.log("No meaningful text found in image via OCR, analyzing image content instead");
        summary = await summarizeImageWithGemini(file.path, file.mimetype);
      }
    } 
    else {
      console.error(`Unsupported file type: ${file.mimetype}`);
      return res.status(400).json({ error: "Unsupported file type" });
    }

    // Clean and truncate summary
    const cleanedSummary = cleanText(summary);
    const truncatedSummary = truncateToSentences(cleanedSummary, 10);
    
    console.log("Processing complete, returning results");
    
    // Return results
    res.json({
      summary: truncatedSummary,
      fullSummary: cleanedSummary,
    });
  } catch (error) {
    console.error(`Error processing file: ${error.message}`, error.stack);
    res.status(500).json({ 
      error: `Failed to process file: ${error.message}`,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    // Clean up uploaded file
    try {
      if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
        console.log(`Deleted temporary file: ${file.path}`);
      }
    } catch (unlinkError) {
      console.error(`Failed to delete temporary file: ${unlinkError.message}`);
    }
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`- Health check available at http://localhost:${PORT}/health`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});