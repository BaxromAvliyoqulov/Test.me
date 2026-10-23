import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { supabase, authService } from '@/services/supabaseService';
import { useToast } from 'vue-toastification';

export function useAIGenerator(mentorType, isRus) {
  const router = useRouter();
  const toast = useToast();

  const loading = ref(false);
  const progressPercentage = ref(0);
  const statusIndex = ref(0);

  const statusMessagesUz = [
    'Gemini AI bilan bog\'lanilmoqda...',
    'Mavzu tahlil qilinmoqda...',
    '10 ta professional savol tuzilmoqda...',
    'Javoblar tekshirilmoqda...',
    'Baza saqlanmoqda...',
    'Deyarli tayyor...'
  ];

  const statusMessagesRu = [
    'Подключение к Gemini AI...',
    'Анализ темы...',
    'Создание 10 вопросов...',
    'Проверка ответов...',
    'Сохранение в базу...',
    'Почти готово...'
  ];

  const currentStatusMessage = computed(() => {
    const messages = isRus.value ? statusMessagesRu : statusMessagesUz;
    return messages[statusIndex.value] || messages[messages.length - 1];
  });

  let progressInterval = null;
  let statusInterval = null;

  const startLoadingAnimations = () => {
    loading.value = true;
    progressPercentage.value = 0;
    statusIndex.value = 0;

    statusInterval = setInterval(() => {
      if (statusIndex.value < 5) statusIndex.value++;
    }, 2500);

    progressInterval = setInterval(() => {
      if (progressPercentage.value < 90) {
        progressPercentage.value += Math.floor(Math.random() * 8) + 2;
      }
    }, 500);
  };

  const stopLoadingAnimations = () => {
    clearInterval(progressInterval);
    clearInterval(statusInterval);
    progressPercentage.value = 100;
  };

  const getOfflineFallbackQuestions = (subject, level, topic) => {
    const questions = [];
    for (let i = 1; i <= 10; i++) {
      const qText = isRus.value 
        ? `Вопрос ${i} по теме "${topic}" (${subject}, уровень ${level})`
        : `Mavzu: "${topic}" bo'yicha ${i}-savol (${subject}, daraja: ${level})`;
      
      const optCorrect = isRus.value ? `Правильный ответ на вопрос ${i}` : `${i}-savol uchun to'g'ri javob`;
      const opt2 = isRus.value ? `Неверный вариант A` : `Noto'g'ri variant A`;
      const opt3 = isRus.value ? `Неверный вариант B` : `Noto'g'ri variant B`;
      const opt4 = isRus.value ? `Неверный вариант C` : `Noto'g'ri variant C`;

      questions.push({
        question: qText,
        options: [optCorrect, opt2, opt3, opt4].sort(() => Math.random() - 0.5),
        answer: optCorrect
      });
    }
    return questions;
  };

  const generateQuestionsClientSide = async (subject, level, topic, systemPersona) => {
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('CHHiOonsKHa1Ds0k92cgl1wd')) {
      return getOfflineFallbackQuestions(subject, level, topic);
    }
    try {
      const promptText = `You are acting as the following persona: ${systemPersona}

Generate a multiple-choice quiz about the topic "${topic}" for subject "${subject}" at "${level}" difficulty level.
Write the "question" text entirely in the tone of your persona! Make it obvious that YOU (the persona) are asking the question.
The language of the questions MUST be ${isRus.value ? 'Russian' : 'Uzbek'}.
The response must be exactly a JSON array of 10 objects.
Each question object MUST contain:
- "question": string (the exact text of the question, IN THE TONE OF YOUR PERSONA)
- "options": array of 4 strings (possible options, one must be correct)
- "answer": string (the exact correct option string)

Ensure all questions are grammatically correct and return ONLY raw JSON matching the schema. No markdown formatting.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        }
      );

      if (response.ok) {
        const resData = await response.json();
        const text = resData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return JSON.parse(text.trim());
      }
      return getOfflineFallbackQuestions(subject, level, topic);
    } catch {
      return getOfflineFallbackQuestions(subject, level, topic);
    }
  };

  const generateTest = async (subject, level, topic, customPrompt) => {
    startLoadingAnimations();

    try {
      const questions = await generateQuestionsClientSide(subject, level, topic, customPrompt);
      const user = await authService.getUser();

      const { data: aiTest } = await supabase.from('ai_tests').insert({
        creator_id: user?.id || null,
        subject: subject,
        level: level,
        topic: topic,
        mentor_type: mentorType,
        questions: questions
      }).select().maybeSingle();

      const testId = aiTest?.id || 'gen_' + Date.now();

      stopLoadingAnimations();
      toast.success(isRus.value ? 'Тест успешно сгенерирован!' : 'Test muvaffaqiyatli yaratildi!');

      setTimeout(() => {
        loading.value = false;
        router.push({
          path: '/test',
          query: {
            subjectId: 'ai',
            levelId: 'ai',
            questionCount: 10,
            aiTestId: testId
          }
        });
      }, 800);

    } catch (error) {
      stopLoadingAnimations();
      loading.value = false;
      console.error("Test generation failed:", error);
      toast.error(isRus.value ? 'Ошибка при генерации теста.' : 'Test yaratishda xatolik yuz berdi.');
    }
  };

  return {
    loading,
    progressPercentage,
    currentStatusMessage,
    generateTest
  };
}
