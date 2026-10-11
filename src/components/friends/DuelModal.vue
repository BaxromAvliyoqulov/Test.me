<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="duel-modal-card animate-pop-in">
      <div class="modal-header">
        <div class="header-icon">⚔️</div>
        <div>
          <h3>1v1 Test Duel Musobaqasi</h3>
          <p class="subtitle">Do'stingizni test jangiga chaqiring va o'zaro bilim sinashuvida bellashing!</p>
        </div>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <!-- Opponent Select -->
        <div class="form-group">
          <label class="form-label"><i class="fas fa-user"></i> Raqib Do'stingiz</label>
          <select v-model="selectedFriendUid" class="input-select" :disabled="isPreselected">
            <option value="" disabled>-- Do'stni tanlang --</option>
            <option v-for="f in friends" :key="f.uid" :value="f.uid">
              {{ f.displayName || f.email }} ({{ f.points || 0 }} TP)
            </option>
          </select>
        </div>

        <!-- Subject Select -->
        <div class="form-group">
          <label class="form-label"><i class="fas fa-book-open"></i> Sinov Fani</label>
          <div class="subject-chips">
            <button 
              v-for="sub in subjects" 
              :key="sub.id"
              type="button"
              class="chip-btn"
              :class="{ active: selectedSubject === sub.id }"
              @click="selectedSubject = sub.id"
            >
              <span>{{ sub.icon }}</span>
              <span>{{ sub.name }}</span>
            </button>
          </div>
        </div>

        <!-- Question Count & Wager Grid -->
        <div class="options-grid">
          <div class="form-group">
            <label class="form-label"><i class="fas fa-list-ol"></i> Savollar Soni</label>
            <div class="radio-pill-group">
              <button 
                v-for="cnt in [5, 10, 15]" 
                :key="cnt"
                type="button"
                class="pill-btn"
                :class="{ active: questionCount === cnt }"
                @click="questionCount = cnt"
              >
                {{ cnt }} ta
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label"><i class="fas fa-coins"></i> Tikiladigan TP Coin</label>
            <div class="radio-pill-group">
              <button 
                v-for="w in [0, 25, 50, 100]" 
                :key="w"
                type="button"
                class="pill-btn"
                :class="{ active: wager === w, 'free': w === 0 }"
                @click="wager = w"
              >
                {{ w === 0 ? "Do'stona (0)" : w + ' TP' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Duel Terms Notice -->
        <div class="terms-card">
          <i class="fas fa-shield-halved"></i>
          <div>
            <strong>Qoida:</strong> Ikkala o'yinchi bir xil savollarni yechadi. Kim ko'p va tez to'g'ri topsa, g'olib bo'ladi va tikilgan mukofotga ega bo'ladi!
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="cancel-btn" @click="$emit('close')">Bekor qilish</button>
        <button 
          class="submit-duel-btn" 
          :disabled="!selectedFriendUid || isSubmitting"
          @click="handleSubmit"
        >
          <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
          <span v-else>🔥 Duel Chaqiruvini Yuborish</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  show: { type: Boolean, default: false },
  friends: { type: Array, default: () => [] },
  preselectedFriend: { type: Object, default: null },
  currentUser: { type: Object, default: null }
});

const emit = defineEmits(['close', 'create-duel']);

const selectedFriendUid = ref('');
const selectedSubject = ref('matematika');
const questionCount = ref(10);
const wager = ref(25);
const isSubmitting = ref(false);

const isPreselected = computed(() => !!props.preselectedFriend?.uid);

const subjects = [
  { id: 'matematika', name: 'Matematika', icon: '📐' },
  { id: 'english', name: 'Ingliz Tili', icon: '🇬🇧' },
  { id: 'tarix', name: 'Tarix', icon: '🏛️' },
  { id: 'informatika', name: 'Informatika & AI', icon: '💻' },
  { id: 'ona-tili', name: 'Ona Tili', icon: '📚' }
];

watch(() => props.preselectedFriend, (newVal) => {
  if (newVal?.uid) {
    selectedFriendUid.value = newVal.uid;
  } else if (props.friends.length > 0 && !selectedFriendUid.value) {
    selectedFriendUid.value = props.friends[0].uid;
  }
}, { immediate: true });

watch(() => props.show, (newVal) => {
  if (newVal && props.preselectedFriend?.uid) {
    selectedFriendUid.value = props.preselectedFriend.uid;
  }
});

const handleSubmit = () => {
  if (!selectedFriendUid.value) return;
  const friendObj = props.friends.find(f => f.uid === selectedFriendUid.value) || props.preselectedFriend;
  const subjectObj = subjects.find(s => s.id === selectedSubject.value);

  emit('create-duel', {
    opponentUid: selectedFriendUid.value,
    opponentName: friendObj?.displayName || friendObj?.email || 'Do\'st',
    opponentImage: friendObj?.profileImage || null,
    subjectId: selectedSubject.value,
    subjectName: subjectObj?.name || 'Matematika',
    questionCount: questionCount.value,
    wager: wager.value
  });
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.duel-modal-card {
  background: white;
  border-radius: 28px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.35);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 1.75rem;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-bottom: 1px solid #e2e8f0;
  position: relative;
}

.header-icon {
  font-size: 2.2rem;
  width: 54px;
  height: 54px;
  background: #fee2e2;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
}

.subtitle {
  margin: 0.25rem 0 0 0;
  font-size: 0.8rem;
  color: #64748b;
}

.close-btn {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: white;
  border: 1px solid #e2e8f0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 1.25rem;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

.modal-body {
  padding: 1.5rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.input-select {
  padding: 0.75rem 1rem;
  border-radius: 14px;
  border: 1.5px solid #cbd5e1;
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
  background: white;
  outline: none;
}

.input-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.subject-chips {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.5rem;
}

.chip-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.8rem;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.chip-btn.active {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #1d4ed8;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.radio-pill-group {
  display: flex;
  gap: 0.4rem;
  background: #f1f5f9;
  padding: 0.3rem;
  border-radius: 12px;
}

.pill-btn {
  flex: 1;
  padding: 0.5rem 0.2rem;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.pill-btn.active {
  background: white;
  color: #0f172a;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.terms-card {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 14px;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.78rem;
  color: #92400e;
  line-height: 1.4;
}

.terms-card i {
  color: #d97706;
  font-size: 1.1rem;
  margin-top: 0.1rem;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.75rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.cancel-btn {
  padding: 0.7rem 1.25rem;
  background: white;
  border: 1.5px solid #cbd5e1;
  border-radius: 12px;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
}

.submit-duel-btn {
  padding: 0.75rem 1.75rem;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border: none;
  border-radius: 12px;
  font-weight: 800;
  color: white;
  cursor: pointer;
  box-shadow: 0 8px 20px -4px rgba(239, 68, 68, 0.4);
  transition: all 0.2s;
}

.submit-duel-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -4px rgba(239, 68, 68, 0.5);
}

.submit-duel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.animate-pop-in {
  animation: popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}
</style>
