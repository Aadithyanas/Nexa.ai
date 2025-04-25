
const { sendEmail, sendSMS, sendPushNotification, saveIntruderImage } = require('./notificationServices');

async function handleNotification(req, res) {
  try {
    const { intruderImage, confidence } = req.body;
    
    // Save intruder image
    const imagePath = await saveIntruderImage(intruderImage);
    
    // Send all notifications in parallel
    await Promise.all([
      sendEmail({
        imagePath,
        confidence,
        timestamp: new Date().toISOString()
      }),
      sendSMS(),
      sendPushNotification({
        title: "Unauthorized Access!",
        body: `Someone is trying to sit in your chair (${100 - confidence}% different)`
      })
    ]);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Notification error:', error);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
}

module.exports = handleNotification;