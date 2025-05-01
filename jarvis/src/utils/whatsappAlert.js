const createWhatsAppSender = () => {
  const lastAlertTime = { current: 0 };
  const pendingRequest = { current: null };
  const RATE_LIMIT_MS = 300000; // 5 minutes

  // Define the server URL - adjust this to where your Express server is running
  const SERVER_URL = "http://localhost:3001"; // Change this if your server runs on a different port

  return async (message = "🚨 ALERT: Unauthorized person detected in Adithyan's seat!") => {
    const now = Date.now();

    // Check rate limiting
    if (now - lastAlertTime.current < RATE_LIMIT_MS) {
      console.log(
        `WhatsApp alert skipped: rate limited (${Math.ceil((RATE_LIMIT_MS - (now - lastAlertTime.current)) / 1000)}s remaining)`,
      );
      return false;
    }

    // Avoid duplicate requests
    if (pendingRequest.current) {
      return pendingRequest.current;
    }

    try {
      // Use the full URL to the Express server
      pendingRequest.current = fetch(`${SERVER_URL}/api/send-whatsapp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          to: "918590361932", // Fixed recipient
        }),
      });

      const response = await pendingRequest.current;

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      lastAlertTime.current = now;
      console.log("WhatsApp alert sent successfully:", data);
      return true;
    } catch (error) {
      console.error("Failed to send WhatsApp alert:", error);
      return false;
    } finally {
      pendingRequest.current = null;
    }
  };
};

export const sendWhatsAppAlert = createWhatsAppSender(); 