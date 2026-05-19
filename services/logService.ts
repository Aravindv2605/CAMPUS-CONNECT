import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";

export async function logChat(userInput: string, aiResponse: string) {
  await addDoc(collection(db, "chat_logs"), {
    userInput,
    aiResponse,
    timestamp: new Date()
  });
}