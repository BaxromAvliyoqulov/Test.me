import { db } from '@/config/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';

export const handleReferral = async (referralCode, newUserId) => {
  try {
    const q = query(
      collection(db, 'users'),
      where('referralCode', '==', referralCode)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const referrerDoc = querySnapshot.docs[0];
      const referrerId = referrerDoc.id;

      // Referrerga 50 point qo‘shish
      await updateDoc(doc(db, 'users', referrerId), {
        points: (referrerDoc.data().points || 0) + 50,
      });

      // Yangi userga 100 point va kim uni taklif qilganini yozib qo‘yamiz
      await updateDoc(doc(db, 'users', newUserId), {
        points: 100,
        invitedBy: referrerId,
      });

      return true;
    }

    return false;
  } catch (error) {
    console.error('Referral error:', error);
    return false;
  }
};
