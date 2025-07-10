const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

/**
 * Referral function – yangi foydalanuvchi referral bilan kelganini aniqlaydi.
 * Uni va referral bergan userni point bilan mukofotlaydi.
 */
exports.handleReferral = functions.https.onCall(async (data, context) => {
  // ❗ Auth bo‘lishi shart
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Foydalanuvchi tizimga kirmagan.'
    );
  }

  const referredUserId = context.auth.uid;
  const referralCode = data.referralCode;

  if (!referralCode) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Referral code yuborilmagan.'
    );
  }

  // Referral kod egasini topamiz
  const refQuery = await db
    .collection('users')
    .where('referralCode', '==', referralCode)
    .limit(1)
    .get();

  if (refQuery.empty) {
    throw new functions.https.HttpsError(
      'not-found',
      'Referral code topilmadi.'
    );
  }

  const referrerDoc = refQuery.docs[0];
  const referrerId = referrerDoc.id;

  if (referrerId === referredUserId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'O‘zingizni referral qilolmaysiz.'
    );
  }

  // Yangi userning documentiga referral ma'lumotlarini qo‘shamiz
  const referredUserRef = db.collection('users').doc(referredUserId);
  await referredUserRef.set(
    {
      referredBy: referrerId,
      referredAt: admin.firestore.FieldValue.serverTimestamp(),
      points: admin.firestore.FieldValue.increment(100),
    },
    { merge: true }
  );

  // Referral bergan userga ham 50 point
  await db
    .collection('users')
    .doc(referrerId)
    .update({
      points: admin.firestore.FieldValue.increment(50),
    });

  return { message: 'Referral muvaffaqiyatli bajarildi.' };
});
