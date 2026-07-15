<template>
  <div class="goals-editor-wrap">
    <!-- Header -->
    <div class="goals-header">
      <div class="header-icon-wrap">
        <i class="fas fa-bullseye"></i>
      </div>
      <div class="header-text-wrap">
        <h3>{{ t('myGoals') }}</h3>
        <p>{{ t('goalsDesc') }}</p>
      </div>
    </div>

    <!-- Active Goals Grid -->
    <div class="goals-grid">
      <TransitionGroup name="goal-list">
        <div 
          v-for="(goal, index) in localGoals" 
          :key="goal.id || index" 
          :class="['goal-pro-card', goal.status]"
        >
          <div class="goal-pro-header">
            <span class="goal-status-chip">
              <i :class="statusIcon(goal.status)"></i> {{ t(`status_${goal.status}`) }}
            </span>
            <div class="goal-pro-actions">
              <button class="action-btn edit" @click="editGoal(index)" :title="t('editGoal')">
                <i class="fas fa-edit"></i>
              </button>
              <button class="action-btn delete" @click="removeGoal(index)" :title="t('cancelBtn')">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
          
          <div class="goal-pro-body">
            <h4 class="goal-pro-title">{{ goal.title }}</h4>
            <p v-if="goal.description" class="goal-pro-desc">{{ goal.description }}</p>
          </div>
          
          <div class="goal-pro-footer">
            <div class="goal-deadline">
              <i class="fas fa-calendar-alt text-blue"></i> 
              <span>{{ goal.targetDate || '-' }}</span>
            </div>
          </div>
        </div>
      </TransitionGroup>

      <!-- Empty State -->
      <div v-if="localGoals.length === 0" class="empty-state-card">
        <div class="empty-icon-wrap"><i class="fas fa-flag-checkered"></i></div>
        <h4>{{ t('noGoals') }}</h4>
        <p>{{ t('goalsDesc') }}</p>
      </div>
    </div>

    <!-- Add / Edit Form -->
    <div class="goal-form-panel">
      <div class="panel-header">
        <h4>
          <i :class="editingIndex === -1 ? 'fas fa-plus-circle text-blue' : 'fas fa-edit text-orange'"></i> 
          {{ editingIndex === -1 ? t('addNewGoal') : t('editGoal') }}
        </h4>
      </div>
      
      <div class="panel-body">
        <div class="form-row">
          <div class="form-group flex-1">
            <label class="group-label"><i class="fas fa-heading"></i> {{ t('goalTitle') }}</label>
            <input type="text" v-model="currentGoal.title" class="goal-input" :placeholder="t('titlePlaceholder')" />
          </div>
          <div class="form-group flex-1">
            <label class="group-label"><i class="fas fa-calendar-day"></i> {{ t('goalDeadline') }}</label>
            <input type="date" v-model="currentGoal.targetDate" class="goal-input" />
          </div>
        </div>
        
        <div class="form-group">
          <label class="group-label"><i class="fas fa-align-left"></i> {{ t('goalDesc') }}</label>
          <textarea v-model="currentGoal.description" class="goal-input textarea" :placeholder="t('descPlaceholder')" rows="2"></textarea>
        </div>

        <div v-if="editingIndex !== -1" class="form-group">
          <label class="group-label"><i class="fas fa-tasks"></i> {{ t('goalStatus') }}</label>
          <select v-model="currentGoal.status" class="goal-input select">
            <option value="active">{{ t('status_active') }}</option>
            <option value="completed">{{ t('status_completed') }}</option>
            <option value="failed">{{ t('status_failed') }}</option>
          </select>
        </div>
      </div>
      
      <div class="panel-footer">
        <button type="button" class="btn-cancel" v-if="editingIndex !== -1" @click="cancelEdit">{{ t('cancelBtn') }}</button>
        <button type="button" class="btn-primary" @click="saveGoal" :disabled="!currentGoal.title">
          <i class="fas fa-save"></i> {{ editingIndex === -1 ? t('addBtn') : t('saveBtn') }}
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
      default: (key) => key
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
        this.currentGoal.id = Date.now().toString();
        this.localGoals.push({ ...this.currentGoal });
      } else {
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
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Header */
.goals-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}
.header-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #eff6ff;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}
.header-text-wrap h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.25rem;
}
.header-text-wrap p {
  color: #64748b;
  font-size: 0.9rem;
}

/* Grid & Cards */
.goals-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.goal-pro-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}
.goal-pro-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 4px 0 0 4px;
}
.goal-pro-card.active::before { background: #3b82f6; }
.goal-pro-card.completed::before { background: #10b981; }
.goal-pro-card.failed::before { background: #ef4444; }

.goal-pro-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e1;
}

.goal-pro-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}
.goal-status-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}
.goal-pro-card.active .goal-status-chip { background: #eff6ff; color: #3b82f6; }
.goal-pro-card.completed .goal-status-chip { background: #ecfdf5; color: #10b981; }
.goal-pro-card.failed .goal-status-chip { background: #fef2f2; color: #ef4444; }

.goal-pro-actions {
  display: flex;
  gap: 0.4rem;
  opacity: 0.6;
  transition: opacity 0.2s;
}
.goal-pro-card:hover .goal-pro-actions {
  opacity: 1;
}
.action-btn {
  background: transparent;
  border: 1px solid transparent;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}
.action-btn.edit:hover { background: #eff6ff; color: #3b82f6; border-color: #bfdbfe; }
.action-btn.delete:hover { background: #fef2f2; color: #ef4444; border-color: #fecaca; }

.goal-pro-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}
.goal-pro-desc {
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.4;
  margin-bottom: 1rem;
}

.goal-pro-footer {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}
.goal-deadline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f8fafc;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
.text-blue { color: #3b82f6; }
.text-orange { color: #f97316; }
.text-green-500 { color: #10b981; }
.text-red-500 { color: #ef4444; }

/* Empty State */
.empty-state-card {
  text-align: center;
  padding: 3rem 1rem;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 16px;
  color: #64748b;
}
.empty-icon-wrap {
  width: 64px;
  height: 64px;
  background: #ffffff;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
}
.empty-state-card h4 {
  font-size: 1.1rem;
  color: #334155;
  margin-bottom: 0.25rem;
}

/* Form Panel */
.goal-form-panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.02);
  overflow: hidden;
  margin-top: 1rem;
}
.panel-header {
  padding: 1.25rem 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}
.panel-header h4 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.panel-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: flex;
  gap: 1.5rem;
}
@media (max-width: 640px) {
  .form-row { flex-direction: column; gap: 1.25rem; }
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.flex-1 { flex: 1; }

.group-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.group-label i { color: #94a3b8; }

.goal-input {
  width: 100%;
  padding: 0.85rem 1rem;
  font-size: 0.95rem;
  color: #0f172a;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  transition: all 0.2s ease;
  font-family: inherit;
}
.goal-input:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}
.goal-input.textarea {
  resize: vertical;
  min-height: 80px;
}
.goal-input.select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2394a3b8'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'/%3E%3C/svg%3E");
  background-position: right 0.75rem center;
  background-repeat: no-repeat;
  background-size: 1.25rem;
  padding-right: 2.5rem;
}

.panel-footer {
  padding: 1.25rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* Buttons */
.btn-primary {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 15px rgba(37, 99, 235, 0.3);
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #94a3b8;
  box-shadow: none;
}
.btn-cancel {
  padding: 0.75rem 1.5rem;
  background: #ffffff;
  color: #475569;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-cancel:hover {
  background: #f1f5f9;
  color: #0f172a;
}

/* Animations */
.goal-list-enter-active,
.goal-list-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.goal-list-enter-from,
.goal-list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
