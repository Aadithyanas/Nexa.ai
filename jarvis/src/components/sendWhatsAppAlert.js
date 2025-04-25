import axios from 'axios';

const FIXED_RECIPIENT = '918848673615'; // Your phone number
const FIXED_MESSAGE = 'Hi Aadithyan! This is a test message from my WhatsApp bot.';

const sendWhatsAppAlert = async () => {
  try {
    const response = await axios.post('/api/send-whatsapp', 
      { 
        message: FIXED_MESSAGE, 
        to: FIXED_RECIPIENT 
      },
      {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    return {
      success: true,
      data: response.data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    let errorMessage = 'Failed to send alert';
    if (error.response) {
      errorMessage = `Server error: ${error.response.status}`;
      if (error.response.data?.error) {
        errorMessage += ` - ${error.response.data.error}`;
      }
    } else if (error.request) {
      errorMessage = 'No response from server';
    } else {
      errorMessage = error.message;
    }

    console.error('WhatsApp alert error:', errorMessage);
    return {
      error: true,
      message: errorMessage,
      timestamp: new Date().toISOString()
    };
  }
};

const createRateLimitedSender = (minInterval) => {
  let lastSentTime = 0;
  let pendingRequest = null;

  return async () => {
    const now = Date.now();
    if (now - lastSentTime < minInterval) {
      const waitTime = Math.ceil((minInterval - (now - lastSentTime)) / 1000);
      return {
        skipped: true,
        message: `Alert skipped (wait ${waitTime}s)`,
        nextAvailableIn: minInterval - (now - lastSentTime)
      };
    }

    if (pendingRequest) {
      return pendingRequest;
    }

    try {
      pendingRequest = sendWhatsAppAlert();
      const result = await pendingRequest;
      lastSentTime = Date.now();
      return result;
    } finally {
      pendingRequest = null;
    }
  };
};

export default {
  sendWhatsAppAlert: createRateLimitedSender(300000), // 5-minute rate limit
  _originalSend: sendWhatsAppAlert
};
