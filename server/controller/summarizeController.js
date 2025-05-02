import { YoutubeTranscript } from "youtube-transcript";
import {summarizeWithGemini} from "../services/geminiServices.js";

export const summarizeVideo = async (req, res) => {
  const { videoId } = req.body;

  if (!videoId) {
    return res.status(400).json({ error: "Missing video ID" });
  }

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const fullText = transcript.map((t) => t.text).join(" ");
    const prompt = `Summarize this YouTube transcript:\n\n${fullText}`;
    const summary = await summarizeWithGemini(prompt);
    res.json({ summary });
  } catch (error) {
    console.error("Summarization failed:", error);
    if (
      error.name === "YoutubeTranscriptDisabledError" ||
      (error.message && error.message.includes("Transcript is disabled"))
    ) {
      return res.status(400).json({
        error: "Transcripts are disabled for this video. Summarization is not possible."
      });
    }
    res.status(500).json({ error: "Failed to summarize video." });
  }
};
