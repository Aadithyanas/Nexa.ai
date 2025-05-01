const lastSpokenMessage = { current: null };
let isCameraOn = false;

export const setCameraState = (state) => {
  isCameraOn = state;
};

export const speak = (text, force = false) => {
  // Skip speech if camera is off or SpeechSynthesis is not available
  if (!isCameraOn || !window.speechSynthesis) {
    console.warn('Speech synthesis skipped: camera is off or not available');
    return;
  }

  const now = Date.now();
  // Don't repeat the same message within 10 seconds unless forced
  if (
    !force &&
    lastSpokenMessage.current &&
    lastSpokenMessage.current.text === text &&
    now - lastSpokenMessage.current.timestamp < 10000
  ) {
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.volume = 0.8;

  // Try to get a better voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find((voice) => voice.lang === "en-US" && !voice.localService);

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  window.speechSynthesis.speak(utterance);

  lastSpokenMessage.current = {
    text,
    timestamp: now,
  };
}; 