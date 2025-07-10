import { db } from '@/config/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';

export const handleReferral = async (referralCode, invitedUid) => {
  if (!referralCode) return;

  const q = query(
    collection(db, 'users'),
    where('referralCode', '==', referralCode)
  );
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const referrerDoc = snapshot.docs[0];
    const referrerId = referrerDoc.id;
    const currentPoints = referrerDoc.data().points || 0;

    // Referentga points beriladi (masalan 20 ball)
    await updateDoc(doc(db, 'users', referrerId), {
      points: currentPoints + 20,
    });

    // Optional: invited foydalanuvchiga ham points
    await updateDoc(doc(db, 'users', invitedUid), {
      points: 10,
    });
  }
};
