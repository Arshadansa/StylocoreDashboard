// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA9z67dLECayHwJOim0AuJdldi8iaLr5nQ",
  authDomain: "stylacor.firebaseapp.com",
  projectId: "stylacor",
  storageBucket: "stylacor.appspot.com",
  messagingSenderId: "326785066179",
  appId: "1:326785066179:web:1d8fad5e87cb3fce752e76",
  measurementId: "G-3B1MF40M33"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
