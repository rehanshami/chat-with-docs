import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA24qqxIldOv7mdTQ74_ZIrof4xr-Ji1WM",
  authDomain: "chat-with-pdfs-8c7e5.firebaseapp.com",
  projectId: "chat-with-pdfs-8c7e5",
  storageBucket: "chat-with-pdfs-8c7e5.firebasestorage.app",
  messagingSenderId: "539252175314",
  appId: "1:539252175314:web:b4b4e144cea8335e55980b",
  measurementId: "G-9QRMEW0RK6",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
