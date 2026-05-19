import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyBw_JYAFAdehk-h_NJ33nICkWJoVfjqzk4",
  authDomain: "campus-connect-98bbf.firebaseapp.com",
  projectId: "campus-connect-98bbf",
  storageBucket: "campus-connect-98bbf.firebasestorage.app",
  messagingSenderId: "16989947470",
  appId: "1:16989947470:web:0dbe08482907be90a2e51f",
  measurementId: "G-KQS4NMNPF6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
