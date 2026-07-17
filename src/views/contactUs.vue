<template>
  <div class="contact-wrapper">
    <!-- Glowing background elements -->
    <div class="glow-bg glow-bg-1"></div>
    <div class="glow-bg glow-bg-2"></div>

    <div class="contact-container">
      <div class="contact-hero">
        <h1 class="contact-title" v-html="isRus ? 'Есть вопросы? <span class=\'gradient-text\'>Свяжитесь с нами</span>' : 'Savol bormi? <span class=\'gradient-text\'>Biz bilan bog\'laning</span>'"></h1>
        <p class="contact-subtitle">
          {{ isRus ? 'Напишите нам по вопросам сотрудничества или любых возникших проблем' : 'Hamkorlik yoki biror bir muammo yuzasidan bizga yozing' }}
        </p>
      </div>

      <div class="contact-content-grid">
        <!-- Left Side: Contact Information Cards -->
        <div class="contact-info-panel">
          <div class="info-intro-card">
            <h3>{{ isRus ? 'Наши контакты' : 'Bizning kontaktlar' }}</h3>
            <p>{{ isRus ? 'Отправьте сообщение через форму или свяжитесь с нами напрямую по указанным каналам.' : 'Murojaatingizni form orqali yuboring yoki quyidagi kanallar orqali to\'g\'ridan-to\'g\'ri biz bilan bog\'laning.' }}</p>
          </div>

          <div class="info-cards">
            <a href="https://t.me/Testme_Support_bot" target="_blank" class="info-item-card">
              <div class="info-icon tg-icon">
                <i class="fab fa-telegram-plane"></i>
              </div>
              <div class="info-details">
                <span>Telegram Support</span>
                <strong>@Testme_Support_bot</strong>
              </div>
              <i class="fas fa-external-link-alt info-arrow"></i>
            </a>

            <!-- Developer Telegram card -->
            <a href="https://t.me/Baxrom_Dev" target="_blank" class="info-item-card">
              <div class="info-icon" style="background: #eef2ff; color: #6366f1;">
                <i class="fas fa-code"></i>
              </div>
              <div class="info-details">
                <span>{{ isRus ? 'Разработчик' : 'Dasturchi' }}</span>
                <strong>@Baxrom_Dev</strong>
              </div>
              <i class="fas fa-external-link-alt info-arrow"></i>
            </a>

            <!-- Email copy card -->
            <div class="info-item-card" @click="copyEmail">
              <div class="info-icon email-icon">
                <i class="far fa-envelope"></i>
              </div>
              <div class="info-details">
                <span>{{ isRus ? 'Электронная почта' : 'Elektron pochta' }}</span>
                <strong>avliyoqulovbaxrom99@gmail.com</strong>
              </div>
              <i class="far fa-copy info-arrow"></i>
            </div>

            <!-- Phone copy card -->
            <div class="info-item-card" @click="copyPhone">
              <div class="info-icon" style="background: #e0e7ff; color: #4f46e5;">
                <i class="fas fa-phone-alt"></i>
              </div>
              <div class="info-details">
                <span>{{ isRus ? 'Номер телефона' : 'Telefon raqam' }}</span>
                <strong>+998 99 074 62 57</strong>
              </div>
              <i class="far fa-copy info-arrow"></i>
            </div>

            <!-- Support Time Card -->
            <div class="info-item-card no-click">
              <div class="info-icon time-icon">
                <i class="far fa-clock"></i>
              </div>
              <div class="info-details">
                <span>{{ isRus ? 'Время работы' : 'Ish vaqti' }}</span>
                <strong>{{ isRus ? '24/7 - Круглосуточно' : '24/7 - Istalgan vaqtda' }}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Contact Form -->
        <div class="contact-form-panel">
          <form class="contact-form" @submit.prevent="handleSubmit">
            <div class="form-group">
              <label for="name">{{ isRus ? 'Ваше имя' : 'Ismingiz' }}</label>
              <div class="input-wrapper">
                <i class="far fa-user input-icon"></i>
                <input
                  type="text"
                  id="name"
                  v-model="formData.name"
                  required
                  :placeholder="isRus ? 'Введите ваше имя' : 'Ismingizni kiriting'"
                  maxlength="40"
                  pattern="^[A-Za-zА-Яа-яЁёOʻoʻGʻgʻ\' \-]+$"
                  title="Ismda faqat harflar bo'lishi kerak"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="phone">{{ isRus ? 'Номер телефона' : 'Telefon raqamingiz' }}</label>
              <div class="input-wrapper">
                <i class="fas fa-phone-alt input-icon"></i>
                <input
                  type="tel"
                  id="phone"
                  v-model="formData.phone"
                  @input="formatPhone"
                  required
                  placeholder="+998 90 123 45 67"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="requestType">{{ isRus ? 'Тип обращения' : 'Murojaat turi' }}</label>
              <div class="input-wrapper">
                <i class="far fa-comment-dots input-icon"></i>
                <select
                  id="requestType"
                  v-model="formData.requestType"
                  required
                  @change="handleRequestTypeChange"
                  class="custom-select"
                >
                  <option value="" disabled hidden>{{ isRus ? 'Выберите' : 'Tanlang' }}</option>
                  <option value="partnership">{{ isRus ? 'Предложение о сотрудничестве' : 'Hamkorlik taklifi' }}</option>
                  <option value="test">{{ isRus ? 'Проблема с тестом' : 'Test bo\'yicha muammo' }}</option>
                  <option value="platform">{{ isRus ? 'Проблема с платформой' : 'Platforma bo\'yicha muammo' }}</option>
                </select>
              </div>
            </div>

            <div class="form-group" v-if="formData.requestType === 'test'">
              <label for="subject">{{ isRus ? 'Предмет' : 'Fan' }}</label>
              <div class="input-wrapper">
                <i class="fas fa-book-open input-icon"></i>
                <select id="subject" v-model="formData.subject" required class="custom-select">
                  <option value="" disabled hidden>{{ isRus ? 'Выберите предмет' : 'Fanni tanlang' }}</option>
                  <option v-for="subj in subjectsList" :key="subj" :value="subj">{{ subj }}</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="message">{{ isRus ? 'Сообщение' : 'Xabar' }}</label>
              <div class="input-wrapper textarea-wrapper">
                <i class="far fa-edit input-icon"></i>
                <textarea
                  id="message"
                  v-model="formData.message"
                  required
                  :placeholder="isRus ? 'Напишите ваше сообщение...' : 'Xabaringizni yozing...'"
                  rows="4"
                  maxlength="1000"
                ></textarea>
              </div>
            </div>

            <button type="submit" class="submit-button" :disabled="submitting">
              <span v-if="!submitting">{{ isRus ? 'Отправить сообщение' : 'Yuborish' }}</span>
              <span v-else>{{ isRus ? 'Отправка...' : 'Yuborilmoqda...' }}</span>
              <i class="fas fa-paper-plane" v-if="!submitting"></i>
              <i class="fas fa-circle-notch fa-spin" v-else></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { useToast } from "vue-toastification";
import { useI18n } from "@/utils/i18n";



export default {
  name: "ContactUs",
  setup() {
    const toast = useToast();
    const { locale } = useI18n();

    const isRus = computed(() => locale.value === "RUS");

    const formData = ref({
      name: "",
      phone: "+998 ",
      requestType: "",
      subject: "",
      message: "",
    });

    const subjectsList = ['English', 'O\'zbek tili', 'Matematika', 'Tarix', 'Fizika', 'Informatika', 'Dasturlash', 'Kimyo'];

    const submitting = ref(false);

    const handleRequestTypeChange = () => {
      if (formData.value.requestType !== "test") {
        formData.value.subject = "";
      }
    };

    const copyEmail = () => {
      navigator.clipboard.writeText("avliyoqulovbaxrom99@gmail.com");
      toast.success(
        isRus.value
          ? "Email скопирован в буфер обмена!"
          : "Elektron pochta nusxalandi!"
      );
    };

    const copyPhone = () => {
      navigator.clipboard.writeText("+998990746257");
      toast.success(
        isRus.value
          ? "Номер телефона скопирован в буфер обмена!"
          : "Telefon raqam nusxalandi!"
      );
    };

    const resetForm = () => {
      formData.value = {
        name: "",
        phone: "+998 ",
        requestType: "",
        subject: "",
        message: "",
      };
    };

    const formatPhone = (event) => {
      let val = event.target.value.replace(/\D/g, ""); 
      
      if (val.startsWith("998")) {
        val = val.substring(3);
      }
      
      val = val.substring(0, 9);
      
      let formatted = "+998 ";
      if (val.length > 0) formatted += val.substring(0, 2);
      if (val.length >= 3) formatted += " " + val.substring(2, 5);
      if (val.length >= 6) formatted += " " + val.substring(5, 7);
      if (val.length >= 8) formatted += " " + val.substring(7, 9);
      
      formData.value.phone = formatted.trim();
    };

    const handleSubmit = async () => {
      submitting.value = true;
      try {
        const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
        const { db } = await import('@/config/firebase');

        await addDoc(collection(db, 'supportMessages'), {
          name: formData.value.name,
          phone: formData.value.phone,
          requestType: formData.value.requestType,
          subject: formData.value.subject || null,
          message: formData.value.message,
          createdAt: serverTimestamp(),
          status: 'new'
        });

        toast.success(
          isRus.value
            ? "Ваше сообщение успешно отправлено!"
            : "Xabaringiz muvaffaqiyatli yuborildi!"
        );
        resetForm();
      } catch (error) {
        console.error("Error:", error);
        toast.error(
          isRus.value
            ? "Произошла ошибка при отправке сообщения."
            : "Xatolik yuz berdi. Iltimos qayta urinib ko'ring"
        );
      } finally {
        submitting.value = false;
      }
    };

    return {
      formData,
      isRus,
      submitting,
      handleRequestTypeChange,
      copyEmail,
      copyPhone,
      formatPhone,
      handleSubmit,
      subjectsList,
    };
  },
};
</script>

<style scoped>
.contact-wrapper {
  position: relative;
  min-height: 90vh;
  padding: 4rem 1.5rem;
  overflow: hidden;
  background: #f8fafc;
  font-family: 'Outfit', 'Inter', sans-serif;
}

.glow-bg {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.35;
  z-index: 0;
  pointer-events: none;
}

.glow-bg-1 {
  top: 10%;
  left: 5%;
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, #3b82f6 0%, #60a5fa 100%);
}

.glow-bg-2 {
  bottom: 10%;
  right: 5%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #10b981 0%, #34d399 100%);
}

.contact-container {
  position: relative;
  z-index: 1;
  max-width: 1050px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 3.5rem;
}

.contact-hero {
  text-align: center;
}

.contact-title {
  font-size: 2.8rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -1px;
  margin: 0 0 1rem 0;
}

.gradient-text {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.contact-subtitle {
  font-size: 1.15rem;
  color: #64748b;
  max-width: 650px;
  margin: 0 auto;
  line-height: 1.6;
}

.contact-content-grid {
  display: grid;
  grid-template-columns: 1fr 1.25fr;
  gap: 2.5rem;
  align-items: stretch;
}

/* Left Panel Style */
.contact-info-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
}

.info-intro-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 4px 20px -3px rgba(15, 23, 42, 0.02);
}

.info-intro-card h3 {
  font-size: 1.3rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
}

.info-intro-card p {
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
}

.info-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.info-item-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 20px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  text-decoration: none;
  cursor: pointer;
  box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.02);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.info-item-card:hover:not(.no-click) {
  transform: translateX(4px);
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05);
}

.info-item-card.no-click {
  cursor: default;
}

.info-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.tg-icon { background: #eff6ff; color: #3b82f6; }
.email-icon { background: #fdf2f8; color: #db2777; }
.time-icon { background: #f0fdf4; color: #10b981; }

.info-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-grow: 1;
}

.info-details span {
  font-size: 0.72rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.info-details strong {
  font-size: 0.95rem;
  color: #0f172a;
  word-break: break-all;
}

.info-arrow {
  color: #94a3b8;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.info-item-card:hover .info-arrow {
  color: #3b82f6;
}

/* Right Panel Style (Form) */
.contact-form-panel {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 32px;
  padding: 3rem;
  box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
}

.input-icon {
  position: absolute;
  left: 18px;
  color: #94a3b8;
  font-size: 1.1rem;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2;
}

input,
select,
textarea {
  width: 100%;
  padding: 16px 20px 16px 48px;
  border: 2px solid rgba(226, 232, 240, 0.6);
  border-radius: 20px;
  font-size: 0.98rem;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #0f172a;
  outline: none;
  box-sizing: border-box;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 10px -2px rgba(15, 23, 42, 0.02), inset 0 2px 4px rgba(0, 0, 0, 0.02);
}

select.custom-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%233b82f6' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 18px center;
  background-size: 20px;
  padding-right: 50px;
  cursor: pointer;
}

textarea {
  padding-top: 16px;
  resize: vertical;
  min-height: 120px;
  flex: 1;
}

.textarea-wrapper {
  align-items: start;
  flex: 1;
  display: flex;
}

.textarea-wrapper .input-icon {
  top: 18px;
}

input:hover,
select:hover,
textarea:hover {
  background: #ffffff;
  border-color: #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

input:focus,
select:focus,
textarea:focus {
  background: #ffffff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15), 0 10px 25px -5px rgba(59, 130, 246, 0.2);
  transform: translateY(-2px);
}

input:focus + .input-icon,
select:focus + .input-icon,
textarea:focus + .input-icon {
  color: #3b82f6;
  transform: scale(1.15) translateY(-1px);
}

.submit-button {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 1.25rem;
  font-size: 1.05rem;
  font-weight: 800;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 10px 30px -5px rgba(37, 99, 235, 0.4);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: auto;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px -5px rgba(37, 99, 235, 0.6);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 868px) {
  .contact-wrapper {
    padding: 2.5rem 1rem;
  }

  .contact-container {
    gap: 2.5rem;
  }

  .contact-title {
    font-size: 2.2rem;
  }

  .contact-subtitle {
    font-size: 1rem;
  }

  .contact-content-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .contact-form-panel {
    padding: 1.75rem;
  }
}
</style>
