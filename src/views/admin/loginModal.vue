<template>
  <div class="modal-overlay" v-if="show">
    <div class="modal-glass-content">
      <div class="auth-header">
        <div class="lock-icon-container">
          <i class="fas fa-user-shield"></i>
        </div>
        <h2>Super Admin</h2>
        <p>Tizimni boshqarish uchun kiring</p>
      </div>

      <form @submit.prevent="login" class="auth-form">
        <div class="input-group">
          <i class="fas fa-user input-icon"></i>
          <input
            type="text"
            v-model="username"
            class="glass-input"
            placeholder="Username"
            required
            autocomplete="off"
          />
        </div>
        
        <div class="input-group">
          <i class="fas fa-lock input-icon"></i>
          <input
            type="password"
            v-model="password"
            class="glass-input"
            placeholder="Password"
            required
            autocomplete="new-password"
          />
        </div>

        <button type="submit" class="glass-login-btn">
          <span>Tizimga Kirish</span>
          <i class="fas fa-arrow-right"></i>
        </button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  props: ["show"],
  data() {
    return {
      username: "",
      password: "",
    };
  },
  methods: {
    login() {
      if (this.username === "boss" && this.password === "1") {
        this.$emit("authenticated", true);
      } else {
        this.$emit("authenticated", false);
        alert("Foydalanuvchi nomi yoki parol noto'g'ri");
      }
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 9999;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.modal-glass-content {
  background: rgba(255, 255, 255, 0.9);
  padding: 40px 30px;
  border-radius: 24px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.5);
  animation: modalIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalIn {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.auth-header {
  margin-bottom: 30px;
}

.lock-icon-container {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px auto;
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3);
  transform: rotate(-10deg);
}

.lock-icon-container i {
  font-size: 32px;
  color: white;
  transform: rotate(10deg);
}

.auth-header h2 {
  font-size: 1.8rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 5px 0;
}

.auth-header p {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  position: relative;
  width: 100%;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 1.1rem;
  transition: color 0.3s;
}

.glass-input {
  width: 100%;
  padding: 16px 16px 16px 45px;
  border-radius: 14px;
  border: 2px solid #e2e8f0;
  background: #f8fafc;
  font-family: inherit;
  font-size: 1rem;
  color: #334155;
  transition: all 0.3s;
  box-sizing: border-box;
}

.glass-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.glass-input:focus + .input-icon,
.glass-input:not(:placeholder-shown) + .input-icon {
  color: #3b82f6;
}

.glass-login-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 14px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);
  margin-top: 10px;
}

.glass-login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 25px -5px rgba(16, 185, 129, 0.4);
}

.glass-login-btn:active {
  transform: translateY(1px);
}
</style>
