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

/**
 * Certificate trigger – User testni yechganda uning sertifikat olish
 * shartlariga to'g'ri kelishini tekshiradi va avtomatik sertifikat yaratadi.
 */
exports.checkAndIssueCertificates = functions.firestore
  .document('results/{resultId}')
  .onCreate(async (snapshot, context) => {
    const resultData = snapshot.data();
    if (!resultData) return null;

    const { userId, username, score, total } = resultData;

    // Sertifikat olish uchun kamida 80% to'g'ri javob yozilgan bo'lishi kerak
    const passingRatio = score / total;
    if (passingRatio < 0.8) {
      console.log(`User ${userId} score is below 80% (${score}/${total}). No certificate evaluated.`);
      return null;
    }

    try {
      const resultsRef = db.collection('results');
      const userResultsQuery = await resultsRef.where('userId', '==', userId).get();
      const userResults = userResultsQuery.docs.map(doc => doc.data());

      const totalCount = userResults.length;
      const elementaryCount = userResults.filter(r => r.test_level && r.test_level.toLowerCase().includes('elem')).length;
      const intermediateCount = userResults.filter(r => r.test_level && r.test_level.toLowerCase().includes('inter')).length;
      const advancedCount = userResults.filter(r => r.test_level && r.test_level.toLowerCase().includes('adv')).length;

      // Sertifikat turlari va shartlari
      const certsToCheck = [
        {
          id: 'elementary_graduate',
          condition: elementaryCount >= 3,
          nameUz: 'Boshlang\'ich Savodxon',
          nameRu: 'Начальный Грамотей',
          descUz: 'Elementary darajasida kamida 3 ta test yechganda beriladi.',
          descRu: 'Выдается за решение не менее 3 тестов на уровне Elementary.'
        },
        {
          id: 'intermediate_expert',
          condition: intermediateCount >= 5,
          nameUz: 'O\'rta darajali Mutaxassis',
          nameRu: 'Средний Эксперт',
          descUz: 'Intermediate darajasida kamida 5 ta test yechganda beriladi.',
          descRu: 'Выдается за решение не менее 5 тестов на уровне Intermediate.'
        },
        {
          id: 'advanced_professional',
          condition: advancedCount >= 3,
          nameUz: 'Professional Bilimdon',
          nameRu: 'Продвинутый Профи',
          descUz: 'Advanced darajasida kamida 3 ta test yechganda beriladi.',
          descRu: 'Выдается за решение не менее 3 тестов на уровне Advanced.'
        },
        {
          id: 'ai_enthusiast',
          condition: totalCount >= 5,
          nameUz: 'Aktiv Bilim Oluvchi',
          nameRu: 'Активный Ученик',
          descUz: 'Platformada jami 5 tadan ortiq test yechganingizda beriladi.',
          descRu: 'Выдается за прохождение более 5 тестов на платформе.'
        }
      ];

      const certsCollection = db.collection('certificates');

      for (const cert of certsToCheck) {
        if (cert.condition) {
          // Avval berilganligini tekshiramiz
          const existingQuery = await certsCollection
            .where('userId', '==', userId)
            .where('certType', '==', cert.id)
            .limit(1)
            .get();

          if (existingQuery.empty) {
            const uidPart = userId.substring(0, 8).toUpperCase();
            const certCode = `CERT-${uidPart}-${cert.id.substring(0, 4).toUpperCase()}`;

            await certsCollection.add({
              certId: certCode,
              userId: userId,
              userName: username || 'Foydalanuvchi',
              certType: cert.id,
              nameUz: cert.nameUz,
              nameRu: cert.nameRu,
              descUz: cert.descUz,
              descRu: cert.descRu,
              issuedAt: admin.firestore.FieldValue.serverTimestamp(),
              triggerResultId: snapshot.id
            });
            console.log(`Successfully issued certificate ${cert.id} for user ${userId}`);
          }
        }
      }
    } catch (err) {
      console.error('Error during certificate evaluation:', err);
    }

    return null;
  });

/**
 * AI Test Generator - Foydalanuvchi tanlagan fan va mavzu asosida
 * Gemini AI orqali test savollarini generatsiya qiladi va Firestorega yozadi.
 */
exports.generateAiTest = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Foydalanuvchi tizimga kirmagan.'
    );
  }

  const { subject, level, topic, mentorType } = data;
  if (!subject || !level || !topic) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Fan (subject), daraja (level) va mavzu (topic) bo\'lishi shart.'
    );
  }

  const creatorId = context.auth.uid;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyCHHiOonsKHa1Ds0k92cgl1wd-syjEZK4g";

  const personas = {
    standard: "You are an objective, academic examiner. Write clear, unambiguous, and formally structured multiple-choice questions. Ensure precise language.",
    friendly: "You are a supportive, friendly teacher. Frame the questions warmly, adding small words of encouragement or gentle context to make the test feel less intimidating. Use a few pleasant emojis (e.g., 🌸, ✨).",
    strict: "You are a rigorous, elite professor. Write questions that are highly challenging, strictly formal, and academically dense. Use advanced vocabulary and complex sentence structures. Absolutely no emojis.",
    socratic: "You are a Socratic philosopher. Frame the questions as deep, philosophical inquiries or scenarios that require profound critical thinking rather than just rote memorization.",
    motivator: "You are an intense motivational coach! Frame the questions with high energy, challenge the student to 'crush' the problem, and use hype-filled scenarios. 🚀🔥",
    innovator: "You are a highly creative genius. Frame every question using bizarre, imaginative, out-of-the-box scenarios (e.g., time travel, aliens, futuristic inventions) to test the core concept. 💡🛸",
    analyst: "You are a Cyber-Analyst AI. Frame the questions as 'system diagnostics', 'mission logs', or 'data decryption tasks'. Use a robotic, highly technical, and precise tone. 💻📡",
    sage: "You are an ancient wise elder. Frame the questions as ancient riddles, fables, or moral dilemmas happening in nature or old kingdoms. 📜🏔️",
    comedian: "You are a sarcastic stand-up comedian. Write the questions as funny scenarios, absurd everyday situations, or slightly sarcastic observations. Inject humor into the options as well! 😂🎭"
  };
  const systemPersona = personas[mentorType] || personas.standard;

  let questions = [];

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are acting as the following persona: ${systemPersona}\n\nGenerate a multiple-choice quiz about the topic "${topic}" for subject "${subject}" at "${level}" difficulty level.\nWrite the "question" text entirely in the tone of your persona! Make it obvious that YOU (the persona) are asking the question.\nThe response must be exactly a JSON array of 10 objects.\nEach question object MUST contain:\n- "question": string (the exact text of the question, IN THE TONE OF YOUR PERSONA)\n- "options": array of 4 strings (possible options, one must be correct)\n- "answer": string (the exact correct option string)\n\nEnsure all questions are grammatically correct and return ONLY raw JSON matching the schema. No markdown formatting.`
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (response.ok) {
      const resData = await response.json();
      const text = resData.candidates[0].content.parts[0].text;
      questions = JSON.parse(text);
    } else {
      throw new Error(`Gemini API returned status ${response.status}`);
    }
  } catch (error) {
    console.error("Gemini API call failed, using offline fallback generator:", error);
    questions = generateFallbackQuestions(subject, level, topic);
  }

  // Test savollarini Firestorega saqlash
  const aiTestRef = await db.collection('ai_tests').add({
    creatorId,
    subject,
    level,
    topic,
    questions,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return { testId: aiTestRef.id };
});

function generateFallbackQuestions(subject, level, topic) {
  return [
    {
      question: `What is the primary concept behind ${topic} in ${subject} (${level})?`,
      options: [
        `Core principles of ${topic}`,
        `Secondary effects of ${topic}`,
        `Historical context of ${subject}`,
        `Alternative theories`
      ],
      answer: `Core principles of ${topic}`
    },
    {
      question: `Which of the following is a key characteristic of ${topic}?`,
      options: [
        `Increased efficiency and precision`,
        `Random distribution of elements`,
        `Complete isolation from ${subject}`,
        `Static state preservation`
      ],
      answer: `Increased efficiency and precision`
    },
    {
      question: `How does ${topic} relate to the foundations of ${subject}?`,
      options: [
        `It is a fundamental component`,
        `It has no direct relationship`,
        `It was recently deprecated`,
        `It serves as a cosmetic overlay`
      ],
      answer: `It is a fundamental component`
    },
    {
      question: `What is a common misconception about ${topic}?`,
      options: [
        `That it is easy to master without practice`,
        `That it requires high computing power`,
        `That it is only applicable to English`,
        `That it has been replaced entirely`
      ],
      answer: `That it is easy to master without practice`
    },
    {
      question: `In a practical scenario, where would you apply ${topic}?`,
      options: [
        `To solve advanced problems in ${subject}`,
        `To format simple user interfaces`,
        `Only during introductory lessons`,
        `In unrelated academic fields`
      ],
      answer: `To solve advanced problems in ${subject}`
    }
  ];
}
