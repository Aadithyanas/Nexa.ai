const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize WhatsApp client with persistent storage
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // Needed for some environments
  }
});

// Display QR code in terminal
client.on('qr', (qr) => {
  console.log('Scan this QR code with WhatsApp:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('WhatsApp client is ready!');
});

client.on('authenticated', () => {
  console.log('Authenticated');
});

client.on('auth_failure', (msg) => {
  console.error('Authentication failure:', msg);
});

client.on('disconnected', (reason) => {
  console.log('Client was logged out', reason);
});

// Error handling
client.on('error', (err) => {
  console.error('WhatsApp client error:', err);
});

// Validate WhatsApp number format
function validateNumber(number) {
  // Remove all non-digit characters
  const digits = number.replace(/\D/g, '');
  
  // Check if number is valid (adjust for your country's requirements)
  if (digits.length < 10 || digits.length > 15) {
    return false;
  }
  
  return `${digits}@c.us`;
}

// Send message to WhatsApp from API request
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

    // Check if client is ready
    if (!client.info) {
      return res.status(503).json({ error: 'WhatsApp client is not ready yet' });
    }

    // Check if number exists on WhatsApp
    const isRegistered = await client.isRegisteredUser(chatId);
    if (!isRegistered) {
      return res.status(400).json({ error: 'The provided number is not registered on WhatsApp' });
    }

    const sentMsg = await client.sendMessage(chatId, message);
    console.log('Message sent:', sentMsg.id._serialized);
    res.json({ success: true, id: sentMsg.id._serialized });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Failed to send message', details: err.message });
  }
});

// Health check endpoint
app.get('/api/status', (req, res) => {
  const status = client.info ? 'ready' : 'initializing';
  res.json({ status });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start Express server
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  client.destroy();
  server.close(() => {
    process.exit(0);
  });
});

// Initialize WhatsApp client
client.initialize();