import { db } from '@/config/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  increment,
} from 'firebase/firestore';

/**
 * Referral code activation utility.
 * - Referrer (taklif qilgan): +50 TP
 * - Invited (taklif qilingan): +50 TP
 * 
 * @param {string} referralCode - The referral code entered by the invited user
 * @param {string} invitedUid   - The UID of the user who is activating the code
 */
export const handleReferral = async (referralCode, invitedUid) => {
  if (!referralCode || !invitedUid) return;

  const q = query(
    collection(db, 'users'),
    where('referralCode', '==', referralCode.toUpperCase())
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.warn('Referral code not found:', referralCode);
    return;
  }

  const referrerDoc = snapshot.docs[0];
  const referrerId = referrerDoc.id;

  // Prevent self-referral
  if (referrerId === invitedUid) {
    console.warn('Self-referral attempted, skipping.');
    return;
  }

  // Award referrer (taklif qilgan): +50 TP
  await updateDoc(doc(db, 'users', referrerId), {
    points: increment(50),
  });

  // Award invited user (taklif qilingan): +50 TP
  await updateDoc(doc(db, 'users', invitedUid), {
    points: increment(50),
    referredBy: referralCode.toUpperCase(),
  });
};
