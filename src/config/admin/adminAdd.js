import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import CryptoJS from 'crypto-js';

async function addAdmin(username, password) {
  try {
    const hashedPassword = CryptoJS.SHA256(password).toString();

    const docRef = await addDoc(collection(db, 'admins'), {
      username,
      password: hashedPassword,
      createdAt: new Date(),
      role: 'admin',
    });

    return {
      success: true,
      id: docRef.id,
      message: 'Admin added successfully',
    };
  } catch (e) {
    console.error('Error adding admin: ', e);
    return {
      success: false,
      error: e.message,
    };
  }
}

export { addAdmin };
