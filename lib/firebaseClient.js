// Firebase client initializer — only runs in the browser
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyBDLETQKFec0XJ8ZWT01JP5ITff08T0yZI",
  authDomain: "farexo-3ac88.firebaseapp.com",
  projectId: "farexo-3ac88",
  storageBucket: "farexo-3ac88.firebasestorage.app",
  messagingSenderId: "714176775228",
  appId: "1:714176775228:web:e14819b6516419f20b2f39",
  measurementId: "G-3R342SZLP9",
};

let firebaseApp = null;
if (typeof window !== 'undefined') {
  try {
    firebaseApp = initializeApp(firebaseConfig);
  } catch (e) {
    // ignore if already initialized
  }
}

export default firebaseApp;
