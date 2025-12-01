// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD22fI7B44b9uW9Y7-TTzOMNvegRuvvysk",
  authDomain: "flipkart-84869764-28b7a.firebaseapp.com",
  projectId: "flipkart-84869764-28b7a",
  storageBucket: "flipkart-84869764-28b7a.firebasestorage.app",
  messagingSenderId: "961874933748",
  appId: "1:961874933748:web:18674259850e868618eba1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
