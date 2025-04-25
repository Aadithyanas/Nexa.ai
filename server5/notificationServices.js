// notificationServices.js
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

// Email Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Twilio SMS Configuration
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Web Push Configuration
webpush.setVapidDetails(
  'mailto:adithyanas2694@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Database for push subscriptions (in production use a real database)
let pushSubscriptions = [];

// Save intruder image to disk
async function saveIntruderImage(imageData) {
  const matches = imageData.match(/^data:image\/(\w+);base64,(.*)$/);
  if (!matches) throw new Error('Invalid image data');
  
  const ext = matches[1];
  const data = matches[2];
  const buffer = Buffer.from(data, 'base64');
  const filename = `intruder-${Date.now()}.${ext}`;
  const filePath = path.join(__dirname, 'public', 'intruders', filename);
  
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  await fs.promises.writeFile(filePath, buffer);
  
  return `/intruders/${filename}`;
}

// Send email notification
async function sendEmail({ imagePath, confidence, timestamp }) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADITHYAN_EMAIL,
    subject: '🚨 Unauthorized Chair Access Detected',
    html: `
      <h1>Someone is trying to sit in your chair!</h1>
      <p>Detection time: ${new Date(timestamp).toLocaleString()}</p>
      <p>Confidence difference: ${100 - confidence}%</p>
      ${imagePath ? `<img src="${process.env.BASE_URL}${imagePath}" alt="Intruder" width="400">` : ''}
      <p>Please check your seat immediately.</p>
    `
  };

  await transporter.sendMail(mailOptions);
}

// Send SMS notification
async function sendSMS() {
  await twilioClient.messages.create({
    body: '🚨 Alert: Someone is trying to sit in your chair!',
    from: process.env.TWILIO_PHONE_NUMBER,
    to: process.env.ADITHYAN_PHONE
  });
}

// Send push notification
async function sendPushNotification({ title, body }) {
  const payload = JSON.stringify({ title, body });
  
  await Promise.all(
    pushSubscriptions.map(sub => 
      webpush.sendNotification(sub, payload).catch(err => {
        console.error('Push notification error:', err);
        // Remove invalid subscriptions
        if (err.statusCode === 410) {
          pushSubscriptions = pushSubscriptions.filter(s => s.endpoint !== sub.endpoint);
        }
      })
    )
  );
}

// Handle push subscription
async function handlePushSubscription(req, res) {
  const subscription = req.body;
  
  if (!pushSubscriptions.some(s => s.endpoint === subscription.endpoint)) {
    pushSubscriptions.push(subscription);
  }
  
  res.status(201).json({});
}

module.exports = {
  saveIntruderImage,
  sendEmail,
  sendSMS,
  sendPushNotification,
  handlePushSubscription
};