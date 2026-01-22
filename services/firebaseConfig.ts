
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBfgu2IRTKEBENRKywcZLur2KSY3RWBSy8",
  authDomain: "am-bussiness.firebaseapp.com",
  projectId: "am-bussiness",
  storageBucket: "am-bussiness.firebasestorage.app",
  messagingSenderId: "594485633536",
  appId: "1:594485633536:web:774f30342fcaa3d7e72ee5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);

// Set persistence to local (survives refresh and browser close)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Failed to set auth persistence:", error);
});

export const db_fs = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
