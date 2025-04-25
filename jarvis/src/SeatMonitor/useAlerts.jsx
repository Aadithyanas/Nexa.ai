import { useRef } from "react";

export const useAlerts = () => {
  const lastAlertTime = useRef(0);
  const RATE_LIMIT_MS = 300000; // 5 minutes

  const sendWhatsAppAlert = async (message = "🚨 ALERT: Unauthorized person detected in Adithyan's seat!") => {
    const now = Date.now();
    if (now - lastAlertTime.current < RATE_LIMIT_MS) {
        console.log(`Rate limited: ${Math.ceil((RATE_LIMIT_MS - (now - lastAlertTime.current)) / 1000)}s remaining`);
        return false;
      }

    try {
      const response = await fetch("/api/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, to: "918590361932" }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      lastAlertTime.current = now;
      return true;
    } catch (error) {
      console.error("Alert error:", error);
      return false;
    }
  };

  return { sendWhatsAppAlert };
};