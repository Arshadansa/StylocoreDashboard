// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAPKeA90m_gdbBEtSejTz2MXnPXOaiRbEE",
  authDomain: "rangstone-8a3e8.firebaseapp.com",
  databaseURL: "https://rangstone-8a3e8-default-rtdb.firebaseio.com",
  projectId: "rangstone-8a3e8",
  storageBucket: "rangstone-8a3e8.appspot.com",
  messagingSenderId: "303718575005",
  appId: "1:303718575005:web:d02e45d190d12be607dd74",
  measurementId: "G-PGMZ4E0NJC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
