const fs = require("fs")
const {
  extractTextFromPDF,
  extractTextFromImage,
  containsMeaningfulText,
  summarizeTextWithGemini,
  summarizeImageWithGemini,
  cleanText,
  truncateToSentences,
} = require("../utils/fileProcessing")

/**
 * Process uploaded file and return summary
 */
const processFile = async (req, res) => {
  if (!req.file) {
    console.error("No file received")
    return res.status(400).json({ error: "No file uploaded" })
  }

  const file = req.file
  console.log(`File received: ${file.originalname}, Type: ${file.mimetype}, Size: ${file.size} bytes`)

  try {
    let text = ""
    let summary = ""

    // Process file based on type
    if (file.mimetype === "application/pdf") {
      text = await extractTextFromPDF(file.path)
      console.log("Extracted text from PDF, now summarizing")
      summary = await summarizeTextWithGemini(text)
    } else if (file.mimetype.startsWith("image/")) {
      // Try OCR first
      text = await extractTextFromImage(file.path)

      // Check if the extracted text is meaningful or just noise
      if (containsMeaningfulText(text)) {
        // If we got substantial text from OCR, summarize it
        console.log("Meaningful text found in image via OCR, summarizing text content")
        const cleanedText = cleanText(text)
        summary = await summarizeTextWithGemini(cleanedText)
      } else {
        // If OCR didn't yield meaningful text, use image analysis
        console.log("No meaningful text found in image via OCR, analyzing image content instead")
        summary = await summarizeImageWithGemini(file.path, file.mimetype)
      }
    } else {
      console.error(`Unsupported file type: ${file.mimetype}`)
      return res.status(400).json({ error: "Unsupported file type" })
    }

    // Clean and truncate summary
    const cleanedSummary = cleanText(summary)
    const truncatedSummary = truncateToSentences(cleanedSummary, 10)

    console.log("Processing complete, returning results")

    // Return results
    res.json({
      summary: truncatedSummary,
      fullSummary: cleanedSummary,
    })
  } catch (error) {
    console.error(`Error processing file: ${error.message}`, error.stack)
    res.status(500).json({
      error: `Failed to process file: ${error.message}`,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  } finally {
    // Clean up uploaded file
    try {
      if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path)
        console.log(`Deleted temporary file: ${file.path}`)
      }
    } catch (unlinkError) {
      console.error(`Failed to delete temporary file: ${unlinkError.message}`)
    }
  }
}

module.exports = {
  processFile,
}
