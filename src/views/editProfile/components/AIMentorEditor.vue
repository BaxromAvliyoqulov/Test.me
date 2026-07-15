<template>
  <div class="ai-mentor-wrap">
    <div class="mentor-cards">
      <div 
        v-for="mentor in mentors" 
        :key="mentor.id"
        :class="['mentor-card', { active: localMentorType === mentor.id, locked: mentor.premium && !isPremium }]"
        :style="{ '--mentor-color': mentor.color }"
        @click="selectMentor(mentor)"
      >
        <div class="card-header-area">
          <div class="mentor-icon">
            <i :class="mentor.icon"></i>
          </div>
          <div v-if="mentor.premium && !isPremium" class="pro-badge">
            <i class="fas fa-lock"></i> PRO
          </div>
          <div v-else-if="mentor.premium" class="pro-badge unlocked">
            <i class="fas fa-unlock"></i> PRO
          </div>
        </div>
        <div class="mentor-info">
          <h4>{{ mentor.name[currentLocale] }}</h4>
          <p>{{ mentor.desc[currentLocale] }}</p>
        </div>
        <div class="active-indicator">
          <i class="fas fa-check-circle"></i>
        </div>
      </div>
    </div>

    <div class="mentor-preview" v-if="selectedMentorData">
      <div class="chat-bubble" :style="{ '--mentor-color': selectedMentorData.color }">
        <div class="bubble-header">
          <div class="bubble-avatar">
            <i :class="selectedMentorData.icon"></i>
          </div>
          <span>{{ selectedMentorData.name[currentLocale] }}</span>
        </div>
        <p class="bubble-text">"{{ selectedMentorData.greeting[currentLocale] }}"</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AIMentorEditor',
  props: {
    modelValue: {
      type: String,
      default: 'friendly'
    },
    isPremium: {
      type: Boolean,
      default: false
    },
    currentLocale: {
      type: String,
      default: 'UZB'
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      localMentorType: this.modelValue || 'friendly',
      mentors: [
        {
          id: 'standard',
          icon: 'fas fa-robot',
          color: '#64748b',
          premium: false,
          name: { UZB: 'Standart AI', RUS: 'Стандартный ИИ' },
          desc: { UZB: 'Oddiy, xolis va aniq maslahatlar beruvchi standart klassik yordamchi.', RUS: 'Обычный классический помощник, дающий объективные и четкие советы.' },
          greeting: { UZB: 'Assalomu alaykum! Men standart yordamchiman, sizga qanday yordam bera olaman?', RUS: 'Здравствуйте! Я стандартный помощник, чем могу вам помочь?' }
        },
        {
          id: 'friendly',
          icon: 'fas fa-smile-beam',
          color: '#3b82f6',
          premium: false,
          name: { UZB: 'Do\'stona Ustoz', RUS: 'Дружелюбный Наставник' },
          desc: { UZB: 'Xatolarni muloyimlik bilan tushuntiradi va doim qo\'llab-quvvatlaydi.', RUS: 'Мягко объясняет ошибки и всегда поддерживает.' },
          greeting: { UZB: 'Salom! Xato qilsangiz xavotir olmang, biz birga o\'rganamiz!', RUS: 'Привет! Не переживай из-за ошибок, мы учимся вместе!' }
        },
        {
          id: 'strict',
          icon: 'fas fa-user-tie',
          color: '#ef4444',
          premium: true,
          name: { UZB: 'Qattiqqo\'l Professor', RUS: 'Строгий Профессор' },
          desc: { UZB: 'Faqat faktlar va qat\'iy qoidalar. Bosh qotirishga majbur qiladi.', RUS: 'Только факты и строгие правила. Заставляет думать.' },
          greeting: { UZB: 'Vaqtni behuda sarflamaylik. Xatolaringizni darhol tahlil qilamiz.', RUS: 'Не будем терять время. Немедленно разберем твои ошибки.' }
        },
        {
          id: 'socratic',
          icon: 'fas fa-brain',
          color: '#a855f7',
          premium: true,
          name: { UZB: 'Sokratik Faylasuf', RUS: 'Сократический Философ' },
          desc: { UZB: 'To\'g\'ri javobni aytmaydi, o\'zingiz topishingiz uchun savollar beradi.', RUS: 'Не дает готовых ответов, а задает наводящие вопросы.' },
          greeting: { UZB: 'Sizningcha, nima uchun bu javob xato bo\'lishi mumkin? Keling, o\'ylab ko\'ramiz.', RUS: 'Как ты думаешь, почему этот ответ неверный? Давай поразмыслим.' }
        },
        {
          id: 'motivator',
          icon: 'fas fa-rocket',
          color: '#f59e0b',
          premium: true,
          name: { UZB: 'Motivator Kouch', RUS: 'Мотиватор Коуч' },
          desc: { UZB: 'Tinimsiz harakatga undaydi. Qisqa, aniq va energiya beruvchi maslahatlar.', RUS: 'Побуждает к действию. Краткие, четкие и заряжающие энергией советы.' },
          greeting: { UZB: 'Vaqt ketdi! Xatolar - bu shunchaki navbatdagi pog\'ona. Qani, yana bir bor olg\'a! 🚀', RUS: 'Время пошло! Ошибки - это просто ступень к успеху. Давай еще раз, вперед! 🚀' }
        },
        {
          id: 'innovator',
          icon: 'fas fa-lightbulb',
          color: '#10b981',
          premium: true,
          name: { UZB: 'Kreativ Daho', RUS: 'Креативный Гений' },
          desc: { UZB: 'Muammolarga noan\'anaviy va qiziqarli yechimlar topishni o\'rgatadi.', RUS: 'Учит находить нестандартные и интересные решения проблем.' },
          greeting: { UZB: 'Ajoyib urinish! Ammo bu muammoni butunlay boshqacha usulda yechish haqida o\'ylab ko\'rganmisiz? 💡', RUS: 'Отличная попытка! Но думал ли ты о совершенно другом подходе к этой задаче? 💡' }
        }
      ]
    }
  },
  computed: {
    selectedMentorData() {
      return this.mentors.find(m => m.id === this.localMentorType) || this.mentors[0];
    }
  },
  watch: {
    modelValue(newVal) {
      this.localMentorType = newVal || 'friendly';
    }
  },
  methods: {
    selectMentor(mentor) {
      if (mentor.premium && !this.isPremium) {
        // Here you could emit an event to show a "Buy Premium" modal
        alert(this.currentLocale === 'RUS' ? 'Этот наставник доступен только в Premium!' : 'Bu ustoz faqat Premium obunada mavjud!');
        return;
      }
      this.localMentorType = mentor.id;
      this.$emit('update:modelValue', mentor.id);
    }
  }
}
</script>

<style scoped>
.ai-mentor-wrap {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1rem;
}

.mentor-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.25rem;
}

.mentor-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px -2px rgba(15, 23, 42, 0.03);
  z-index: 1;
}

.mentor-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(circle at top right, color-mix(in srgb, var(--mentor-color) 10%, transparent), transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: -1;
}

.mentor-card:hover:not(.locked) {
  transform: translateY(-6px);
  box-shadow: 0 20px 25px -5px color-mix(in srgb, var(--mentor-color) 15%, transparent), 0 8px 10px -6px color-mix(in srgb, var(--mentor-color) 10%, transparent);
  border-color: color-mix(in srgb, var(--mentor-color) 30%, transparent);
}
.mentor-card:hover:not(.locked)::before {
  opacity: 1;
}

.mentor-card.active {
  border-color: var(--mentor-color);
  background: #ffffff;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--mentor-color) 30%, transparent), 0 15px 35px -5px color-mix(in srgb, var(--mentor-color) 20%, transparent);
}
.mentor-card.active::before {
  opacity: 1;
  background: radial-gradient(circle at top right, color-mix(in srgb, var(--mentor-color) 15%, transparent), transparent 80%);
}

.card-header-area {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.mentor-icon {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: color-mix(in srgb, var(--mentor-color) 12%, transparent);
  color: var(--mentor-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.mentor-card:hover:not(.locked) .mentor-icon,
.mentor-card.active .mentor-icon {
  transform: scale(1.1) rotate(-5deg);
  background: linear-gradient(135deg, var(--mentor-color), color-mix(in srgb, var(--mentor-color) 60%, white));
  color: white;
  box-shadow: 0 10px 20px -5px color-mix(in srgb, var(--mentor-color) 40%, transparent);
}

.mentor-info h4 {
  color: #0f172a;
  font-size: 1.2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  letter-spacing: -0.3px;
}

.mentor-info p {
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pro-badge {
  background: linear-gradient(135deg, #f59e0b, #ea580c);
  color: white;
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 10px -2px rgba(234, 88, 12, 0.4);
}

.pro-badge.unlocked {
  background: #f1f5f9;
  color: #64748b;
  box-shadow: none;
}

.active-indicator {
  position: absolute;
  bottom: 1.5rem;
  right: 1.5rem;
  color: var(--mentor-color);
  font-size: 1.4rem;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.mentor-card.active .active-indicator {
  opacity: 1;
  transform: scale(1);
}

.mentor-card.locked {
  opacity: 0.65;
  filter: grayscale(0.8);
}
.mentor-card.locked:hover {
  filter: grayscale(0.6);
  opacity: 0.8;
}

.mentor-preview {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-start;
}

.chat-bubble {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px 20px 20px 0;
  padding: 1.75rem 2rem;
  position: relative;
  max-width: 90%;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05);
}

.chat-bubble::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: -10px;
  width: 20px;
  height: 20px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  border-left: 1px solid #e2e8f0;
  border-bottom-left-radius: 15px;
  clip-path: polygon(100% 0, 0% 100%, 100% 100%);
}

.bubble-header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.bubble-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  background: linear-gradient(135deg, var(--mentor-color), color-mix(in srgb, var(--mentor-color) 60%, white));
  color: white;
  box-shadow: 0 4px 10px -2px color-mix(in srgb, var(--mentor-color) 40%, transparent);
}

.bubble-text {
  color: #334155;
  font-size: 1.05rem;
  line-height: 1.6;
  font-weight: 500;
}
</style>
