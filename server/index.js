// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { YoutubeTranscript } from "youtube-transcript";
import {summarizeWithGemini} from "./gemini.js";

import translateRoutes from "./routes/translateRoutes.js";


const app = express();
const PORT = 5000;

app.use(cors({
  origin: 'https://nexa-ai-beta.vercel.app', // or "*" for all origins (not recommended for production)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(bodyParser.json());

app.post("/summarize", async (req, res) => {
  const { videoId } = req.body;

  if (!videoId) {
    return res.status(400).json({ error: "Missing video ID" });
  }

  try {
    // Step 1: Get YouTube transcript
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const fullText = transcript.map((t) => t.text).join(" ");

    // Step 2: Create a summarization prompt
    const prompt = `Summarize this YouTube transcript:\n\n${fullText}`;

    // Step 3: Call Gemini AI to get summary
    const summary = await summarizeWithGemini(prompt);

    res.json({ summary });
  } catch (error) {
    console.error("Summarization failed:", error);
    res.status(500).json({ error: "Failed to summarize video." });
  }
});
app.use('/translate', translateRoutes);


app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
