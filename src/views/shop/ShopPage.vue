<template>
  <div class="shop-coming-soon">
    <div class="glow-bg glow-1"></div>
    <div class="glow-bg glow-2"></div>
    
    <div class="coming-soon-content">
      <div class="icon-container">
        <i class="fas fa-store"></i>
      </div>
      <h2>Tez Kunda...</h2>
      <p>Do'kon sahifasi hozirda yangilanmoqda. Biz tez orada yanada ajoyib narsalar bilan qaytamiz!</p>
      
      <button class="back-btn" @click="$router.push('/dashboard')">
        <i class="fas fa-arrow-left"></i> Orqaga qaytish
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ShopPage'
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.shop-coming-soon {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Plus Jakarta Sans', sans-serif;
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.glow-bg {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  z-index: 0;
  opacity: 0.15;
}
.glow-1 {
  width: 400px;
  height: 400px;
  background: #3b82f6;
  top: 10%;
  left: 10%;
}
.glow-2 {
  width: 300px;
  height: 300px;
  background: #8b5cf6;
  bottom: 10%;
  right: 10%;
}

.coming-soon-content {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  padding: 50px 40px;
  border-radius: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.5);
  text-align: center;
  max-width: 500px;
  width: 100%;
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-container {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 25px;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.5), 0 10px 20px rgba(56, 189, 248, 0.2);
}

.icon-container i {
  font-size: 40px;
  background: linear-gradient(135deg, #0284c7 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

h2 {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 15px 0;
  letter-spacing: -0.5px;
}

p {
  color: #64748b;
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0 0 35px 0;
}

.back-btn {
  background: #1e293b;
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 20px -5px rgba(30, 41, 59, 0.3);
}

.back-btn:hover {
  background: #0f172a;
  transform: translateY(-2px);
  box-shadow: 0 15px 25px -5px rgba(30, 41, 59, 0.4);
}
</style>
