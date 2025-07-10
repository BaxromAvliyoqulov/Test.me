import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

export const generateReferralCode = async (user) => {
  if (!user) return null;

  const referralCode = user.uid.slice(0, 6).toUpperCase();

  await setDoc(
    doc(db, 'users', user.uid),
    {
      displayName: user.displayName || 'No Name',
      email: user.email,
      referralCode,
      points: 0,
    },
    { merge: true }
  );

  return referralCode;
};
