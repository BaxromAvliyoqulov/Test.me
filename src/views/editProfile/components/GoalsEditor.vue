<template>
  <div class="goals-editor-wrap">
    <div class="goals-header">
      <h3><i class="fas fa-bullseye"></i> {{ t('myGoals', 'Mening Maqsadlarim') }}</h3>
      <p>{{ t('goalsDesc', "O'zingiz uchun maqsadlar belgilang va ularga erishish ustida ishlang.") }}</p>
    </div>

    <div class="goals-list">
      <TransitionGroup name="goal-list">
        <div 
          v-for="(goal, index) in localGoals" 
          :key="goal.id || index" 
          :class="['goal-card', goal.status]"
        >
          <div class="goal-info">
            <h4 class="goal-title">{{ goal.title }}</h4>
            <p v-if="goal.description" class="goal-desc">{{ goal.description }}</p>
            <div class="goal-meta">
              <span class="goal-date"><i class="fas fa-calendar-alt"></i> {{ goal.targetDate || 'Sana yo\'q' }}</span>
              <span class="goal-status-badge">
                <i :class="statusIcon(goal.status)"></i> {{ t(`status_${goal.status}`, goal.status) }}
              </span>
            </div>
          </div>
          
          <div class="goal-actions">
            <button type="button" class="icon-btn edit-btn" @click="editGoal(index)" title="Tahrirlash">
              <i class="fas fa-edit"></i>
            </button>
            <button type="button" class="icon-btn delete-btn" @click="removeGoal(index)" title="O'chirish">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </TransitionGroup>

      <div v-if="localGoals.length === 0" class="empty-goals">
        <i class="fas fa-box-open"></i>
        <p>{{ t('noGoals', "Hali maqsadlar qo'shilmagan.") }}</p>
      </div>
    </div>

    <!-- Add/Edit Form -->
    <div class="add-goal-box">
      <h4 v-if="editingIndex === -1">{{ t('addNewGoal', "Yangi maqsad qo'shish") }}</h4>
      <h4 v-else>{{ t('editGoal', "Maqsadni tahrirlash") }}</h4>
      
      <div class="form-row">
        <div class="form-group flex-1">
          <label><i class="fas fa-heading"></i> Sarlavha</label>
          <input type="text" v-model="currentGoal.title" class="styled-input" placeholder="Masalan: Matematikadan 100% olish" />
        </div>
        <div class="form-group flex-1">
          <label><i class="fas fa-calendar-day"></i> Muddat</label>
          <input type="date" v-model="currentGoal.targetDate" class="styled-input" />
        </div>
      </div>
      
      <div class="form-group">
        <label><i class="fas fa-align-left"></i> Tavsif (Ixtiyoriy)</label>
        <textarea v-model="currentGoal.description" class="styled-input" placeholder="Bunga qanday erishmoqchisiz?" rows="2"></textarea>
      </div>

      <div v-if="editingIndex !== -1" class="form-group">
        <label><i class="fas fa-tasks"></i> Holat</label>
        <select v-model="currentGoal.status" class="styled-input">
          <option value="active">Faol</option>
          <option value="completed">Bajarildi</option>
          <option value="failed">O'xshamadi</option>
        </select>
      </div>

      <div class="goal-form-actions">
        <button type="button" class="pro-btn-secondary" v-if="editingIndex !== -1" @click="cancelEdit">Bekor qilish</button>
        <button type="button" class="pro-btn-primary" @click="saveGoal" :disabled="!currentGoal.title">
          <i class="fas fa-save"></i> {{ editingIndex === -1 ? 'Qo\'shish' : 'Saqlash' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GoalsEditor',
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    t: {
      type: Function,
      default: (key, fallback) => fallback
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      localGoals: [],
      editingIndex: -1,
      currentGoal: this.getEmptyGoal()
    }
  },
  watch: {
    modelValue: {
      handler(newVal) {
        // Only update local if it differs to avoid recursive loops
        if (JSON.stringify(newVal) !== JSON.stringify(this.localGoals)) {
          this.localGoals = JSON.parse(JSON.stringify(newVal));
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    getEmptyGoal() {
      return {
        id: '',
        title: '',
        description: '',
        targetDate: '',
        status: 'active'
      }
    },
    statusIcon(status) {
      if (status === 'completed') return 'fas fa-check-circle text-green-500';
      if (status === 'failed') return 'fas fa-times-circle text-red-500';
      return 'fas fa-spinner fa-spin text-blue-500';
    },
    saveGoal() {
      if (!this.currentGoal.title.trim()) return;

      if (this.editingIndex === -1) {
        // Add new
        this.currentGoal.id = Date.now().toString(); // simple ID gen
        this.localGoals.push({ ...this.currentGoal });
      } else {
        // Update existing
        this.localGoals[this.editingIndex] = { ...this.currentGoal };
      }
      
      this.emitUpdate();
      this.cancelEdit();
    },
    editGoal(index) {
      this.editingIndex = index;
      this.currentGoal = { ...this.localGoals[index] };
    },
    removeGoal(index) {
      this.localGoals.splice(index, 1);
      this.emitUpdate();
    },
    cancelEdit() {
      this.editingIndex = -1;
      this.currentGoal = this.getEmptyGoal();
    },
    emitUpdate() {
      this.$emit('update:modelValue', JSON.parse(JSON.stringify(this.localGoals)));
    }
  }
}
</script>

<style scoped>
.goals-editor-wrap {
  margin-top: 1rem;
}
.goals-header {
  margin-bottom: 1.5rem;
}
.goals-header h3 {
  font-size: 1.25rem;
  color: var(--text-color, #e2e8f0);
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.goals-header p {
  color: #94a3b8;
  font-size: 0.9rem;
}

.goals-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.goal-card {
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}
.goal-card:hover {
  background: rgba(30, 41, 59, 0.7);
  border-color: rgba(96, 165, 250, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}

.goal-card.completed {
  border-left: 4px solid #10b981;
}
.goal-card.active {
  border-left: 4px solid #3b82f6;
}
.goal-card.failed {
  border-left: 4px solid #ef4444;
}

.goal-info {
  flex: 1;
}
.goal-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #f8fafc;
}
.goal-desc {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-bottom: 0.75rem;
}
.goal-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #64748b;
}
.goal-meta span {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.text-green-500 { color: #10b981; }
.text-red-500 { color: #ef4444; }
.text-blue-500 { color: #3b82f6; }

.goal-actions {
  display: flex;
  gap: 0.5rem;
}
.icon-btn {
  background: rgba(255, 255, 255, 0.05);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-btn:hover.edit-btn { background: #3b82f6; color: white; }
.icon-btn:hover.delete-btn { background: #ef4444; color: white; }

.empty-goals {
  text-align: center;
  padding: 3rem 1rem;
  background: rgba(0,0,0,0.2);
  border-radius: 12px;
  border: 1px dashed rgba(255,255,255,0.1);
  color: #64748b;
}
.empty-goals i {
  font-size: 2rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.add-goal-box {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 1.5rem;
}
.add-goal-box h4 {
  margin-bottom: 1.25rem;
  color: #e2e8f0;
  font-size: 1.1rem;
}
.form-row {
  display: flex;
  gap: 1rem;
}
.flex-1 { flex: 1; }

.goal-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

/* Animations */
.goal-list-enter-active,
.goal-list-leave-active {
  transition: all 0.4s ease;
}
.goal-list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.goal-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
