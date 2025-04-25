import { useRef } from "react";

export const useSpeech = (miniMode = false) => {
  const lastSpokenMessage = useRef(null);

  const speak = (text, force = false) => {
    if (miniMode) return;

    const now = Date.now();
    if (!force && lastSpokenMessage.current?.text === text && 
        now - lastSpokenMessage.current.timestamp < 10000) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.volume = 0.8;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang === "en-US" && !v.localService);
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
    lastSpokenMessage.current = { text, timestamp: now };
  };

  return { speak };
};