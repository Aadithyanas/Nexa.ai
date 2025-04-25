// controllers/translateController.js
import { translateText } from "../services/translateServices.js";

export const translate = async (req, res) => {
  const { text, targetLang } = req.body;

  if (!text || !targetLang) {
    return res.status(400).json({ error: "Missing text or targetLang" });
  }

  try {
    const translatedText = await translateText(text, targetLang);
    res.json({ translated: translatedText });
  } catch (error) {
    console.error("Translation failed:", error);
    res.status(500).json({ error: "Translation failed" });
  }
};
