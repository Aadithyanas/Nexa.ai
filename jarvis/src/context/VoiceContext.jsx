import React, { createContext, useEffect, useState } from 'react';
import run from '../GeminiApi';

export const datacontext = createContext();

function VoiceContext({ children }) {
  const [status, setStatus] = useState("Initializing");
  const [isListening, setIsListening] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [youtubeQuery, setYoutubeQuery] = useState("");
  const [showYoutube, setShowYoutube] = useState(false);
  const [sessionId, setSessionId] = useState(() => {
    return `session-${Date.now()}`;
  });
  const [lastError, setLastError] = useState(null);

  let wakeWordTriggered = false;

  // Check browser support and initialize
  useEffect(() => {
    const checkSupport = () => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        setLastError("Speech recognition not supported in this browser");
        setStatus("Error: Unsupported Browser");
        return false;
      }
      return true;
    };

    const checkPermissions = async () => {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
        if (permissionStatus.state === 'denied') {
          setLastError("Microphone access denied. Please enable in browser settings.");
          setStatus("Error: Mic Blocked");
          return false;
        }
        return true;
      } catch (e) {
        console.warn("Permission API not supported, continuing anyway");
        return true;
      }
    };

    const initialize = async () => {
      const isSupported = checkSupport();
      const hasPermission = await checkPermissions();
      
      if (isSupported && hasPermission) {
        safeStart();
        const welcomeMsg = "Nexa is now active. Say 'Nexa' to begin.";
        setConversations([{ type: 'ai', text: welcomeMsg }]);
        SpeakAi(welcomeMsg);
        setStatus("Passive");
      }
    };

    initialize();
  }, []);

  // Load available voices
  useEffect(() => {
    const handleVoicesChanged = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      console.log("Available voices:", voices);
    };

    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    handleVoicesChanged();

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  function SpeakAi(text) {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.pitch = 0.9;
    utterance.rate = 1;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.includes('en'));
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onerror = (e) => {
      console.error("Speech synthesis error:", e);
      setLastError(`Speech error: ${e.error}`);
    };

    utterance.onend = () => {
      if (status === "Speaking") {
        setStatus("Listening");
      }
    };

    setStatus("Speaking");
    window.speechSynthesis.speak(utterance);
  }

  async function saveChat(userMessage, aiResponse) {
    try {
      await fetch('http://localhost:3000/save-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'guest',
          session_id: sessionId,
          message: userMessage,
          response: aiResponse,
        }),
      });
    } catch (error) {
      console.error("Error saving chat:", error);
      setLastError("Failed to save chat");
    }
  }

  async function aiResponse(prompt) {
    if (status === "Passive") {
      setStatus("Awake");
      setConversations(prev => [
        ...prev,
        { type: 'system', text: 'Nexa activated via text input' }
      ]);
    }

    setStatus("Thinking...");
    const newMessages = [{ type: 'user', text: prompt }];

    if (prompt.toLowerCase().includes("sleep")) {
      const sleepMsg = sleepResponses[Math.floor(Math.random() * sleepResponses.length)];
      newMessages.push({ type: 'ai', text: sleepMsg });

      setConversations(prev => [...prev, ...newMessages]);
      SpeakAi(sleepMsg);
      setStatus("Passive");
      wakeWordTriggered = false;

      await saveChat(prompt, sleepMsg);
      return;
    } else if (prompt.toLowerCase().includes("play")) {
      const query = prompt.slice(prompt.toLowerCase().indexOf("play") + 5);
      setYoutubeQuery(query);
      setShowYoutube(true);
      setConversations(prev => [
        ...prev,
        { type: 'user', text: prompt },
        { type: 'system', text: `Playing ${query} on YouTube` },
        { type: 'youtube', query: query }
      ]);
      return;
    }

    try {
      const text = await run(prompt);
      const cleaned = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/Google/gi, 'Nexa');

      newMessages.push({ type: 'ai', text: cleaned });
      setConversations(prev => [...prev, ...newMessages]);
      SpeakAi(cleaned);
      setStatus("Listening");

      await saveChat(prompt, cleaned);
    } catch (error) {
      console.error("AI response error:", error);
      setLastError("Failed to get AI response");
      setStatus("Error");
      const errorMsg = "Sorry, I encountered an error processing your request.";
      setConversations(prev => [...prev, { type: 'ai', text: errorMsg }]);
      SpeakAi(errorMsg);
    }
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = 'en-IN';
  recognition.maxAlternatives = 3; // Get more alternatives for better wake word detection

  const greetResponses = [
    "Yes, I'm here. What do you need?",
    "Hello! How can I help you?",
    "I'm ready and listening.",
    "Hey, what's up?",
    "At your service."
  ];

  const sleepResponses = [
    "Alright, going to sleep now. Just say my name if you need me.",
    "Okay, taking a nap. Say 'Nexa' to wake me up.",
    "Going quiet now.",
    "Sleeping. Call me if you need anything."
  ];

  recognition.onresult = (e) => {
    const result = e.results[e.resultIndex];
    const transcript = result[0].transcript.toLowerCase();
    const alternatives = Array.from(result).map(alt => alt.transcript.toLowerCase());
    
    console.log("Heard:", transcript, "Alternatives:", alternatives);

    const wakeWords = ["nexa", "next", "next up", "nexta", "nexus", "neck sa"];
    const detectedWakeWord = alternatives.some(alt => 
      wakeWords.some(word => alt.includes(word))
    );

    if (!wakeWordTriggered && detectedWakeWord) {
      wakeWordTriggered = true;
      setStatus("Awake");
      const greeting = greetResponses[Math.floor(Math.random() * greetResponses.length)];
      setConversations(prev => [
        ...prev,
        { type: 'system', text: `Wake word detected in: "${transcript}"` },
        { type: 'ai', text: greeting }
      ]);
      SpeakAi(greeting);
      return;
    }

    if (transcript.includes("play")) {
      const query = transcript.slice(transcript.indexOf("play") + 5);
      setYoutubeQuery(query);
      setShowYoutube(true);
      setConversations(prev => [
        ...prev,
        { type: 'user', text: transcript },
        { type: 'system', text: `Playing ${query} on YouTube` },
        { type: 'youtube', query: query }
      ]);
      return;
    } else if (transcript.includes("sleep")) {
      const sleepMsg = sleepResponses[Math.floor(Math.random() * sleepResponses.length)];
      setConversations(prev => [
        ...prev,
        { type: 'user', text: transcript },
        { type: 'ai', text: sleepMsg }
      ]);
      SpeakAi(sleepMsg);
      setStatus("Passive");
      wakeWordTriggered = false;
    } else if (wakeWordTriggered || status === "Awake") {
      aiResponse(transcript);
    }
  };

  recognition.onerror = (e) => {
    console.error("Recognition error:", e);
    setLastError(`Recognition error: ${e.error}`);
    
    if (e.error === 'no-speech') {
      setStatus("No speech detected");
    } else if (e.error === 'audio-capture') {
      setStatus("Error: No microphone");
    } else if (e.error === 'not-allowed') {
      setStatus("Error: Mic blocked");
    } else {
      setStatus("Error");
    }
    
    setIsListening(false);
    setTimeout(() => safeStart(), e.error === 'not-allowed' ? 5000 : 1000);
  };

  recognition.onend = () => {
    console.log("Recognition ended");
    setIsListening(false);
    if (status !== "Error" && status !== "Passive") {
      safeStart();
    }
  };

  const safeStart = () => {
    if (!isListening && status !== "Error") {
      try {
        recognition.start();
        setIsListening(true);
        setStatus("Listening");
      } catch (err) {
        console.warn("Recognition start error:", err);
        setTimeout(() => safeStart(), 1000);
      }
    }
  };

  const goToSleep = () => {
    const sleepMsg = sleepResponses[Math.floor(Math.random() * sleepResponses.length)];
    setConversations(prev => [
      ...prev,
      { type: 'system', text: 'Nexa going to sleep mode' },
      { type: 'ai', text: sleepMsg }
    ]);
    SpeakAi(sleepMsg);
    setStatus("Passive");
    wakeWordTriggered = false;
  };

  const wakeUp = () => {
    setStatus("Awake");
    wakeWordTriggered = true;
    const greeting = greetResponses[Math.floor(Math.random() * greetResponses.length)];
    setConversations(prev => [
      ...prev,
      { type: 'system', text: 'Nexa manually activated' },
      { type: 'ai', text: greeting }
    ]);
    SpeakAi(greeting);
  };

  const clearConversations = () => {
    setConversations([]);
    setSessionId(`session-${Date.now()}`);
  };

  const value = {
    recognition,
    SpeakAi,
    aiResponse,
    status,
    safeStart,
    conversations,
    setConversations,
    clearConversations,
    goToSleep,
    wakeUp,
    youtubeQuery,
    showYoutube,
    setShowYoutube,
    sessionId,
    setSessionId,
    lastError,
    setLastError,
    isListening
  };

  return (
    <datacontext.Provider value={value}>
      {children}
    </datacontext.Provider>
  );
}

export default VoiceContext;