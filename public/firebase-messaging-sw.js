// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
  apiKey: 'AIzaSyCHHiOonsKHa1Ds0k92cgl1wd-syjEZK4g',
  authDomain: 'test-6621d.firebaseapp.com',
  projectId: 'test-6621d',
  storageBucket: 'test-6621d.appspot.com',
  messagingSenderId: '628489695688',
  appId: '1:628489695688:web:c57206dbfd3841346c90fd',
  measurementId: 'G-DF5EDXLMRP',
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title || 'Yangi Xabar (Test.me)';
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/pwa-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
