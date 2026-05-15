import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDBkmQKI9HP2tA3LnPviOuknIeRIhdioN0",
  authDomain: "sangeetavarshini-class-hub.firebaseapp.com",
  projectId: "sangeetavarshini-class-hub",
  storageBucket: "sangeetavarshini-class-hub.firebasestorage.app",
  messagingSenderId: "1086654215891",
  appId: "1:1086654215891:web:81ad89d17cff5b4bb88626",
  measurementId: "G-PX61RXYG18",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
