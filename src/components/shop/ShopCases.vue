<template>
  <div class="shop-cases-grid">
    <div 
      v-for="lootbox in cases" 
      :key="lootbox.id" 
      class="lootbox-card"
      :style="{ '--box-color': lootbox.color }"
      @click="$emit('open-case', lootbox)"
    >
      <div class="lootbox-glass">
        <div class="glow-orb"></div>
        <div class="lootbox-icon">
          <i :class="lootbox.icon"></i>
        </div>
        
        <div class="lootbox-info">
          <h3>{{ isRus ? lootbox.nameRu : lootbox.nameUz }}</h3>
          <p>{{ isRus ? lootbox.descRu : lootbox.descUz }}</p>
        </div>

        <div class="lootbox-footer">
          <div class="price-badge">
            <img src="@/assets/img/tpCoin.png" alt="TP Coin" />
            <span>{{ lootbox.price }}</span>
          </div>
          <button 
            class="open-btn" 
            :disabled="userPoints < lootbox.price || isOpening"
          >
            {{ isRus ? 'Открыть' : 'Ochish' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  userPoints: { type: Number, required: true },
  isRus: { type: Boolean, required: true },
  isOpening: { type: Boolean, default: false }
});

const emit = defineEmits(['open-case']);

const cases = [
  {
    id: 'case_common',
    nameUz: "Oddiy G'azna",
    nameRu: 'Обычный Ящик',
    descUz: 'Sertifikat ramkalari va kichik bonuslar.',
    descRu: 'Рамки для сертификатов и мелкие бонусы.',
    price: 150,
    icon: 'fas fa-box',
    color: '#3b82f6'
  },
  {
    id: 'case_rare',
    nameUz: "Nodir G'azna",
    nameRu: 'Редкий Ящик',
    descUz: 'Maxsus nishonlar va premium test ruxsatlari.',
    descRu: 'Специальные значки и допуски к премиум тестам.',
    price: 500,
    icon: 'fas fa-gem',
    color: '#8b5cf6'
  },
  {
    id: 'case_epic',
    nameUz: "Eksklyuziv G'azna",
    nameRu: 'Эксклюзивный Ящик',
    descUz: 'Noyob VIP maqom va noyob profillar.',
    descRu: 'Уникальный VIP статус и профили.',
    price: 1500,
    icon: 'fas fa-crown',
    color: '#f59e0b'
  }
];
</script>

<style scoped>
.shop-cases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  padding: 1rem 0;
}

.lootbox-card {
  position: relative;
  border-radius: 28px;
  padding: 1px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.2) 100%);
  box-shadow: 0 15px 35px -10px rgba(15, 23, 42, 0.08);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 1;
}

.lootbox-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 25px 45px -15px color-mix(in srgb, var(--box-color) 40%, transparent);
}

.lootbox-glass {
  background: #ffffff;
  border-radius: 27px;
  padding: 2.5rem 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.glow-orb {
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
  width: 150px;
  height: 150px;
  background: var(--box-color);
  filter: blur(60px);
  opacity: 0.15;
  z-index: 0;
  transition: opacity 0.3s ease;
}

.lootbox-card:hover .glow-orb {
  opacity: 0.3;
}

.lootbox-icon {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--box-color) 10%, #fff) 0%, color-mix(in srgb, var(--box-color) 30%, #fff) 100%);
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: var(--box-color);
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
  box-shadow: 0 10px 20px -5px color-mix(in srgb, var(--box-color) 40%, transparent);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.lootbox-card:hover .lootbox-icon {
  transform: scale(1.1) rotate(5deg);
}

.lootbox-info {
  flex-grow: 1;
  z-index: 1;
}

.lootbox-info h3 {
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
}

.lootbox-info p {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0 0 2rem 0;
  line-height: 1.5;
}

.lootbox-footer {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1;
  padding-top: 1.5rem;
  border-top: 1px solid #f1f5f9;
}

.price-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  padding: 8px 16px;
  border-radius: 14px;
  font-weight: 800;
  font-size: 1.1rem;
  color: #0f172a;
}

.price-badge img {
  width: 24px;
  height: 24px;
}

.open-btn {
  background: var(--box-color);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.open-btn:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-2px);
  box-shadow: 0 8px 15px -5px color-mix(in srgb, var(--box-color) 50%, transparent);
}

.open-btn:disabled {
  background: #cbd5e1 !important;
  cursor: not-allowed;
  opacity: 0.7;
}
</style>
