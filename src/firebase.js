import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAs8h8xl-CZXbCJuqYM21mS9hWi_NJXHRU",
  authDomain: "travelapp-75882.firebaseapp.com",
  projectId: "travelapp-75882",
  storageBucket: "travelapp-75882.firebasestorage.app",
  messagingSenderId: "60800802449",
  appId: "1:60800802449:web:86a11bf48ee8a81976a930",
  measurementId: "G-3S814ZRH6V"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
