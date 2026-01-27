import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
    apiKey: "AIzaSyBNDE__MXUJsA6WfYh2Dk2IqOmfNyT78AE",
    authDomain: "community-hero-app-2025.firebaseapp.com",
    projectId: "community-hero-app-2025",
    storageBucket: "community-hero-app-2025.firebasestorage.app",
    messagingSenderId: "692496327540",
    appId: "1:692496327540:web:1f7aa743236a5de9a38221"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
