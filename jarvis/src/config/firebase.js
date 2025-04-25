import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBASUExejaL6FcJkXqpeaUgrs8WXNxu7Z4",
  authDomain: "notificationseatmonitor.firebaseapp.com",
  projectId: "notificationseatmonitor",
  storageBucket: "notificationseatmonitor.firebasestorage.app",
  messagingSenderId: "1070478109796",
  appId: "1:1070478109796:web:ea2c80dcff8d283da7c371",
  measurementId: "G-RXPX57HY6V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

// VAPID key for push notifications (replace with your own)
const vapidKey = "BFog4lrwJNMIlLmVVAePoqpviAS6M3G8GKJ1VMQHTwcbpbAWe32BgRNOSaTVlvDVsBMY-bPOru-UwiFIZ_fXExA";

export { messaging, vapidKey };

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const currentToken = await getToken(messaging, { vapidKey });
      if (currentToken) {
        console.log("FCM Token:", currentToken);
        return currentToken;
      } else {
        console.log('No registration token available.');
        return null;
      }
    } else {
      console.log('Notification permission denied.');
      return null;
    }
  } catch (err) {
    console.log('Error getting notification permission:', err);
    return null;
  }
};

export const setupNotificationListener = () => {
  onMessage(messaging, (payload) => {
    console.log("Message received:", payload);
    // Display notification
    new Notification(payload.notification.title, {
      body: payload.notification.body,
      icon: payload.notification.icon
    });
  });
};