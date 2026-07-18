<template>
  <div class="actions-bento-grid">
    <div class="action-bento" @click="$emit('buy-points')">
      <div class="action-icon icon-blue">
        <i class="fas fa-shopping-cart"></i>
      </div>
      <div class="action-info">
        <h3>{{ isRus ? 'Покупка коинов' : 'TP Coin xarid qilish' }}</h3>
        <p>{{ isRus ? 'Пополнить баланс кошелька' : 'Hamyon balansini to\'ldirish' }}</p>
      </div>
      <div class="action-arrow"><i class="fas fa-arrow-right"></i></div>
    </div>

    <div class="action-bento" @click="$emit('share-referral')">
      <div class="action-icon icon-green">
        <i class="fas fa-share-nodes"></i>
      </div>
      <div class="action-info">
        <h3>{{ isRus ? 'Пригласить друга' : 'Do\'stlarni taklif etish' }}</h3>
        <p>{{ isRus ? 'Получить бонус по ссылке' : 'Havola orqali bonus olish' }}</p>
      </div>
      <div class="action-arrow"><i class="fas fa-arrow-right"></i></div>
    </div>

    <div class="action-bento" @click="$emit('show-users')">
      <div class="action-icon icon-purple">
        <i class="fas fa-users"></i>
      </div>
      <div class="action-info">
        <h3>{{ isRus ? 'Приглашенные друзья' : 'Taklif etilganlar ro\'yxati' }}</h3>
        <p>{{ isRus ? 'Список приглашенных учеников' : 'Siz taklif qilgan o\'quvchilar' }}</p>
      </div>
      <div class="action-arrow"><i class="fas fa-arrow-right"></i></div>
    </div>

    <div class="action-bento" @click="$emit('enter-code')">
      <div class="action-icon icon-orange">
        <i class="fas fa-ticket"></i>
      </div>
      <div class="action-info">
        <h3>{{ isRus ? 'Активировать код' : 'Taklif kodini kiritish' }}</h3>
        <p>{{ isRus ? 'Ввести промокод от друга' : 'Do\'stingizdan kelgan kodni faollash' }}</p>
      </div>
      <div class="action-arrow"><i class="fas fa-arrow-right"></i></div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isRus: { type: Boolean, required: true }
});

const emit = defineEmits(['buy-points', 'share-referral', 'show-users', 'enter-code']);
</script>

<style scoped>
.actions-bento-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.action-bento {
  background: #ffffff;
  border-radius: 99px; /* Pill shape */
  border: 1px solid rgba(226, 232, 240, 0.8);
  padding: 0.75rem 1.5rem 0.75rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  flex: 1 1 200px; /* Flex grow */
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
  z-index: 1;
}

.action-bento::before {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(120deg, transparent, rgba(255,255,255,0.8), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
  z-index: -1;
}

.action-bento:hover::before {
  transform: translateX(100%);
}

.action-bento:hover {
  transform: translateY(-6px) scale(1.02);
  border-color: #cbd5e1;
  box-shadow: 0 15px 30px -10px rgba(0,0,0,0.1);
}

.action-bento::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; width: 100%; height: 4px;
  background: transparent;
  transition: background 0.3s ease;
}

.action-bento:nth-child(1):hover::after { background: #3b82f6; box-shadow: 0 -5px 15px rgba(59, 130, 246, 0.4); }
.action-bento:nth-child(2):hover::after { background: #10b981; box-shadow: 0 -5px 15px rgba(16, 185, 129, 0.4); }
.action-bento:nth-child(3):hover::after { background: #8b5cf6; box-shadow: 0 -5px 15px rgba(139, 92, 246, 0.4); }
.action-bento:nth-child(4):hover::after { background: #f59e0b; box-shadow: 0 -5px 15px rgba(245, 158, 11, 0.4); }

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%; /* Circle for pill */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
  transition: transform 0.3s ease;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.action-bento:hover .action-icon {
  transform: scale(1.15) rotate(8deg);
}

.icon-blue { background: linear-gradient(135deg, #eff6ff, #bfdbfe); color: #2563eb; }
.icon-green { background: linear-gradient(135deg, #ecfdf5, #a7f3d0); color: #059669; }
.icon-purple { background: linear-gradient(135deg, #f5f3ff, #ddd6fe); color: #7c3aed; }
.icon-orange { background: linear-gradient(135deg, #fffbeb, #fde68a); color: #d97706; }

.action-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.action-info h3 {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.action-info p {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
  font-weight: 500;
  line-height: 1.4;
}

.action-arrow {
  color: #cbd5e1;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.action-bento:hover .action-arrow {
  color: #0f172a;
  transform: translateX(4px);
}
</style>
