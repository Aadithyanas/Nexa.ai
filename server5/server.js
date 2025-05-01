require('dotenv').config();
const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Configuration
const SESSION_PATH = path.join(__dirname, 'whatsapp-sessions');
const PORT = process.env.PORT || 3001;
const MAX_INIT_ATTEMPTS = 5;
const RECONNECT_DELAY = 5000; // 5 seconds

// Ensure session directory exists
if (!fs.existsSync(SESSION_PATH)) {
  fs.mkdirSync(SESSION_PATH, { recursive: true });
}

// WhatsApp Client Configuration
const clientConfig = {
  authStrategy: new LocalAuth({
    dataPath: SESSION_PATH,
    clientId: 'api-server'
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--single-process',
      '--no-zygote',
      '--disable-accelerated-2d-canvas',
      '--disable-software-rasterizer'
    ],
    executablePath: process.env.CHROME_PATH || undefined,
    timeout: 60000
  },
  webVersionCache: {
    type: 'remote',
    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
  },
  takeoverOnConflict: true,
  restartOnAuthFail: true
};

const client = new Client(clientConfig);

// State management
let initializationAttempts = 0;
let isReconnecting = false;
let isClientReady = false;

// Improved initialization flow
async function initializeWhatsAppClient() {
  try {
    if (isReconnecting) return;
    
    initializationAttempts++;
    isReconnecting = true;
    console.log(`Initializing WhatsApp client (attempt ${initializationAttempts})`);
    
    await client.initialize();
    
    initializationAttempts = 0;
    isReconnecting = false;
    isClientReady = true;
  } catch (err) {
    console.error('Initialization failed:', err);
    isReconnecting = false;
    
    if (initializationAttempts < MAX_INIT_ATTEMPTS) {
      setTimeout(initializeWhatsAppClient, RECONNECT_DELAY * initializationAttempts);
    } else {
      console.error('Max initialization attempts reached');
      process.exit(1);
    }
  }
}

// Event listeners with better error handling
client.on('qr', (qr) => {
  console.log('New QR code generated');
  qrcode.generate(qr, { small: true });
  isClientReady = false;
});

client.on('authenticated', () => {
  console.log('Successfully authenticated');
});

client.on('ready', () => {
  console.log('Client is ready');
  isClientReady = true;
});

client.on('auth_failure', (msg) => {
  console.error('Authentication failure:', msg);
  isClientReady = false;
});

client.on('disconnected', async (reason) => {
  console.log('Disconnected:', reason);
  isClientReady = false;
  try {
    await client.destroy();
    setTimeout(initializeWhatsAppClient, RECONNECT_DELAY);
  } catch (err) {
    console.error('Cleanup error:', err);
  }
});

client.on('error', (err) => {
  console.error('Client error:', err);
  if (!isReconnecting) {
    isClientReady = false;
    setTimeout(initializeWhatsAppClient, RECONNECT_DELAY);
  }
});

// Heartbeat monitoring
setInterval(() => {
  if (!isClientReady && !isReconnecting) {
    console.log('Client not ready, attempting reinitialization...');
    initializeWhatsAppClient();
  }
}, 30000);

// Validate WhatsApp number format
function validateNumber(number) {
  const digits = number.replace(/\D/g, '');
  
  if (digits.length < 10 || digits.length > 15) {
    return false;
  }
  
  return `${digits}@c.us`;
}

// API Endpoints

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    status: isClientReady ? 'ready' : 'initializing',
    qrRequired: !isClientReady && initializationAttempts > 0
  });
});

// Send message to WhatsApp
app.post('/api/send-whatsapp', async (req, res) => {
  const { message, to } = req.body;

  if (!message || !to) {
    return res.status(400).json({ error: 'Both "to" and "message" are required.' });
  }

  try {
    const chatId = validateNumber(to);
    if (!chatId) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    if (!isClientReady) {
      return res.status(503).json({ 
        error: 'WhatsApp client is not ready yet',
        status: 'initializing'
      });
    }

    const isRegistered = await client.isRegisteredUser(chatId);
    if (!isRegistered) {
      return res.status(400).json({ error: 'The provided number is not registered on WhatsApp' });
    }

    const sentMsg = await client.sendMessage(chatId, message);
    console.log('Message sent:', sentMsg.id._serialized);
    res.json({ 
      success: true, 
      id: sentMsg.id._serialized,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error sending message:', err);
    
    // Check if error is due to disconnected client
    if (err.message.includes('disconnected') || err.message.includes('closed')) {
      isClientReady = false;
      initializeWhatsAppClient();
      return res.status(503).json({ 
        error: 'WhatsApp connection lost, reconnecting...',
        reconnecting: true
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to send message',
      details: err.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Express server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  initializeWhatsAppClient();
});

// Handle shutdown gracefully
const shutdown = async () => {
  console.log('Shutting down server...');
  try {
    await client.destroy();
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  } catch (err) {
    console.error('Shutdown error:', err);
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Memory monitoring
if (process.env.MONITOR_MEMORY === 'true') {
  setInterval(() => {
    const memoryUsage = process.memoryUsage();
    console.log('Memory usage:', {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
    });
    
    if (global.gc) {
      global.gc();
      console.log('Manual garbage collection performed');
    }
  }, 60000); // Every minute
}