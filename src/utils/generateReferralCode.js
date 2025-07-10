import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { getAuth } from 'firebase/auth';

export const generateReferralCode = async () => {
  const user = getAuth().currentUser;
  if (!user) return null;

  const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  const userRef = doc(db, 'users', user.uid);
  const existingDoc = await getDoc(userRef);

  if (existingDoc.exists() && existingDoc.data().referralCode) {
    return existingDoc.data().referralCode;
  }

  await setDoc(
    userRef,
    {
      referralCode,
      points: 0,
    },
    { merge: true }
  );

  return referralCode;
};
