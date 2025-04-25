importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBASUExejaL6FcJkXqpeaUgrs8WXNxu7Z4",
  authDomain: "notificationseatmonitor.firebaseapp.com",
  projectId: "notificationseatmonitor",
  storageBucket: "notificationseatmonitor.firebasestorage.app",
  messagingSenderId: "1070478109796",
  appId: "1:1070478109796:web:ea2c80dcff8d283da7c371",
  measurementId: "G-RXPX57HY6V"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message: ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/logo192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});