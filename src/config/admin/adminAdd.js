import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

async function addAdmin(username, password) {
  try {
    const docRef = await addDoc(collection(db, "admins"), {
      username: username,
      password: password,
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export { addAdmin };
