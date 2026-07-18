// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyCHHiOonsKHa1Ds0k92cgl1wd-syjEZK4g',
  authDomain: 'test-6621d.firebaseapp.com',
  projectId: 'test-6621d',
  storageBucket: 'test-6621d.appspot.com', //
  messagingSenderId: '628489695688',
  appId: '1:628489695688:web:c57206dbfd3841346c90fd',
  measurementId: 'G-DF5EDXLMRP',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//
// Services
const db = getFirestore(app);

// Enable local persistence for faster repeated loads and offline support
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a a time.');
  } else if (err.code == 'unimplemented') {
    console.warn('The current browser does not support all of the features required to enable persistence');
  }
});

const auth = getAuth(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Initialize Messaging only if supported by the browser
let messaging = null;
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  }
});

// Export services
export { db, auth, storage, functions, messaging };
