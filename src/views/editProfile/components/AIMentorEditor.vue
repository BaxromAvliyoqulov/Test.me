<template>
  <div class="ai-mentor-wrap">
    <div class="mentor-cards">
      <div 
        v-for="mentor in mentors" 
        :key="mentor.id"
        :class="['mentor-card', { active: localMentorType === mentor.id, locked: mentor.premium && !isPremium }]"
        @click="selectMentor(mentor)"
      >
        <div class="mentor-icon" :style="{ color: mentor.color, backgroundColor: mentor.color + '15' }">
          <i :class="mentor.icon"></i>
          <i v-if="mentor.premium && !isPremium" class="fas fa-lock lock-badge"></i>
        </div>
        <div class="mentor-info">
          <h4>{{ mentor.name[currentLocale] }}</h4>
          <p>{{ mentor.desc[currentLocale] }}</p>
        </div>
        <div v-if="mentor.premium && !isPremium" class="premium-label">Premium</div>
      </div>
    </div>

    <div class="mentor-preview" v-if="selectedMentorData">
      <div class="chat-bubble">
        <div class="bubble-header">
          <i :class="selectedMentorData.icon" :style="{ color: selectedMentorData.color }"></i>
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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.mentor-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.mentor-card:hover:not(.locked) {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e1;
}

.mentor-card.active {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.15);
}

.mentor-card.locked {
  opacity: 0.75;
  cursor: not-allowed;
  filter: grayscale(1);
  background: #f8fafc;
}

.mentor-icon {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  flex-shrink: 0;
  position: relative;
}

.lock-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  font-size: 0.7rem;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mentor-info h4 {
  color: #1e293b;
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 0.35rem;
}

.mentor-info p {
  color: #64748b;
  font-size: 0.88rem;
  line-height: 1.5;
}

.premium-label {
  position: absolute;
  top: 0.5rem;
  right: -1.5rem;
  background: linear-gradient(135deg, #f59e0b, #ea580c);
  color: white;
  font-size: 0.65rem;
  font-weight: bold;
  padding: 0.2rem 1.5rem;
  transform: rotate(45deg);
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.mentor-preview {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-start;
}

.chat-bubble {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0 24px 24px 24px;
  padding: 1.5rem 2rem;
  position: relative;
  max-width: 85%;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.bubble-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 0.75rem;
  font-size: 1.05rem;
}

.bubble-text {
  color: #334155;
  font-style: italic;
  line-height: 1.6;
  font-size: 1rem;
}
</style>
