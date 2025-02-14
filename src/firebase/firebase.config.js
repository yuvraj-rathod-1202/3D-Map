// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAyn6CVUVF7GQe7s_nmD9EtQjL9NqEf0Ok",
  authDomain: "jk-shop-website.firebaseapp.com",
  projectId: "jk-shop-website",
  storageBucket: "jk-shop-website.firebasestorage.app",
  messagingSenderId: "674561210696",
  appId: "1:674561210696:web:e0d2a872c326f32ce05b7d"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);