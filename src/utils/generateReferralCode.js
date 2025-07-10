import { db } from '@/config/firebase';
import { doc, setDoc } from 'firebase/firestore';

export const generateReferralCode = async (user) => {
  const randomCode = user.uid.slice(0, 8).toUpperCase();
  const referralDoc = doc(db, 'referralCodes', randomCode);

  await setDoc(referralDoc, {
    code: randomCode,
    userId: user.uid,
    createdAt: new Date(),
  });

  return randomCode;
};
