import { getMentorConfig } from '@/config/mentors';

const GEMINI_API_KEY = "AIzaSyCHHiOonsKHa1Ds0k92cgl1wd-syjEZK4g";

/**
 * Calls Gemini API to generate dynamic AI mentor responses.
 */
export const generateMentorMessage = async ({ mentorId, context, locale, data }) => {
  const mentor = getMentorConfig(mentorId);
  const isRus = locale === 'RUS';

  // For simple dashboard greeting, use static text to save API calls
  if (context === 'dashboard_greeting') {
    const responses = {
      friendly: isRus ? "Привет! Готов к новым знаниям сегодня?" : "Salom! Bugun yangi bilimlarni o'rganishga tayyormisan?",
      strict: isRus ? "Хватит отдыхать. Время учиться. Открывай тесты." : "Dam olganing yetadi. O'qish vaqti keldi. Testlarni och.",
      sarcastic: isRus ? "О, кто к нам пришел! Я уж думал, ты забыл пароль." : "Oho, kimlar kelibdi! Parolingni esdan chiqarding deb o'ylagandim.",
      genius: isRus ? "Приветствую. Каждый день — это возможность познать тайны вселенной." : "Salom. Har bir kun — bu koinot sirlarini anglash uchun bir imkoniyatdir."
    };
    return {
      text: responses[mentor.id] || responses['friendly'],
      badge: isRus ? 'Начать' : 'Boshlash',
      mentor
    };
  }

  // Dynamic Generation using Gemini
  try {
    let prompt = `You are an educational AI tutor. Here is your strict persona configuration:
${mentor.systemPrompt}

You MUST stay entirely in character. Answer in ${isRus ? 'Russian' : 'Uzbek'} language. Keep your response very concise (max 2-3 sentences).

`;

    if (context === 'hint' && data?.question) {
      const q = data.question;
      const ans = q.answer || q.correctAnswer;
      prompt += `The student is taking a test and is stuck on this question:
Question: "${q.question}"
Options: ${JSON.stringify(q.options)}

The correct answer is: "${ans}".
Your task: Give a clever, short hint that guides the student to the correct answer WITHOUT saying the answer explicitly. Use your persona's tone.`;
    } 
    else if (context === 'dashboard_analysis' && data) {
      prompt += `The student is looking at their dashboard.
Overall Average Score: ${data.overallAvg}%.
Weakest Subject: ${data.wSubject} (${data.wPct}%).
Strongest Subject: ${data.sSubject} (${data.sPct}%).
Recent Test: ${data.lastTestSubject} (${data.lastTestPct}%).

Your task: Give a very short, 2-sentence advice based on these stats. If their score is low (<60%), tell them to focus on their weakest subject. If high (>85%), praise them and suggest advanced levels. If average, encourage them to keep going. Stay strictly in your persona.`;
    }
    else if (context === 'post_test' && data) {
      prompt += `The student just finished a test. 
Score: ${data.score} out of ${data.totalQuestions}.
Time spent: ${data.timeSpent}.

Your task: Provide a brief review and emotional reaction to this score based entirely on your persona. If the score is perfect, react accordingly. If it is low, react according to your strict/friendly/sarcastic personality.`;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    if (!response.ok) throw new Error('API Error');

    const resData = await response.json();
    const generatedText = resData.candidates[0].content.parts[0].text;

    return {
      text: generatedText.trim(),
      mentor
    };
  } catch (error) {
    console.error("AI Generation Error:", error);
    return {
      text: isRus ? "Извините, у меня временные технические проблемы." : "Uzur, menda hozircha texnik nosozlik bor.",
      mentor
    };
  }
};
