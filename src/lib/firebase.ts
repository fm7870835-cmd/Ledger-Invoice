import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAhlAlmch7V40juMGmislfhQ2aQERMB5hY",
  authDomain: "legder-debad.firebaseapp.com",
  projectId: "legder-debad",
  storageBucket: "legder-debad.firebasestorage.app",
  messagingSenderId: "11031549692",
  appId: "1:11031549692:web:2e1aef411f4ae43a0c2979",
  measurementId: "G-JSQZT3ZV6H"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

