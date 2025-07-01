<template>
  <div class="contact-container">
    <h2>
      If you have Some problems Please
      <span class="gradient-text">Contact Us</span>
    </h2>
    <p class="subtitle">
      Hamkorlik yoki biror bir muammo yuzasidan bizga yozing
    </p>

    <form class="contact-form" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="name">Ismingiz</label>
        <input
          type="text"
          id="name"
          v-model="formData.name"
          required
          placeholder="Ismingizni kiriting"
        />
      </div>

      <div class="form-group">
        <label for="phone">Telefon raqamingiz</label>
        <input
          type="tel"
          id="phone"
          v-model="formData.phone"
          required
          placeholder="+998 90 123 45 67"
        />
      </div>

      <div class="form-group">
        <label for="requestType">Murojaat turi</label>
        <select
          id="requestType"
          v-model="formData.requestType"
          required
          @change="handleRequestTypeChange"
        >
          <option value="">Tanlang</option>
          <option value="partnership">Hamkorlik taklifi</option>
          <option value="test">Test bo'yicha muammo</option>
          <option value="platform">Platforma bo'yicha muammo</option>
        </select>
      </div>

      <div class="form-group" v-if="formData.requestType === 'test'">
        <label for="subject">Fan</label>
        <select id="subject" v-model="formData.subject" required>
          <option value="English">Ingliz Tili</option>
          <option value="">Fanni tanlang</option>
          <option value="math">Matematika</option>
          <option value="physics">Fizika</option>
          <option value="chemistry">Kimyo</option>
        </select>
      </div>

      <div class="form-group">
        <label for="message">Xabar</label>
        <textarea
          id="message"
          v-model="formData.message"
          required
          placeholder="Xabaringizni yozing"
          rows="4"
        ></textarea>
      </div>

      <button type="submit" class="button">Yuborish</button>
    </form>
  </div>
</template>

<script>
const TELEGRAM_BOT_TOKEN = "7070027279:AAGSDOhfMkri0MTn9iFxuYqyCuskZtUw1aI";
const TELEGRAM_CHAT_ID = "587788509";

export default {
  data() {
    return {
      formData: {
        name: "",
        phone: "",
        requestType: "",
        subject: "",
        message: "",
      },
    };
  },
  methods: {
    handleRequestTypeChange() {
      if (this.formData.requestType !== "test") {
        this.formData.subject = "";
      }
    },
    async handleSubmit() {
      try {
        const messageText = `
        🆕 Yangi murojaat:

        👤 Ismi: ${this.formData.name}
        📞 Telefon: ${this.formData.phone}
        📝 Murojaat turi: ${this.formData.requestType}
        ${this.formData.subject ? `📚 Fan: ${this.formData.subject}` : ""}
        💬 Xabar: ${this.formData.message}`;

        const response = await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              text: messageText,
              parse_mode: "HTML",
            }),
          },
        );

        if (response.ok) {
          alert("Xabaringiz muvaffaqiyatli yuborildi!");
          this.resetForm();
        } else {
          throw new Error("Xabar yuborishda xatolik yuz berdi");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Xatolik yuz berdi. Iltimos qayta urinib ko'ring");
      }
    },
    resetForm() {
      this.formData = {
        name: "",
        phone: "",
        requestType: "",
        subject: "",
        message: "",
      };
    },
  },
};
</script>

<style scoped>
* {
  transition: all 0.3s ease-in-out;
  box-sizing: border-box;
}

.contact-container {
  width: 100%;
  max-width: 650px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
}

h2 {
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}
.subtitle {
  text-align: center;
  color: #666;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
}

/* Input, select, textarea styling */
input,
select,
textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e8ed;
  border-radius: 10px;
  font-size: 1rem;
  background: #fff;
  color: #2c3e50;
  transition: border 0.3s ease;
}
textarea {
  resize: vertical;
  min-height: 120px;
}
input:focus,
select:focus,
textarea:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.2);
}

/* Button styles */
.button {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  font-weight: 600;
  background: linear-gradient(145deg, #0056b3, #007bff);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 123, 255, 0.2);
}

/* Responsive Design */
@media (max-width: 768px) {
  .contact-container {
    padding: 1.5rem;
    margin: 1rem;
  }
  h2 {
    font-size: 1.5rem;
  }
  .subtitle {
    font-size: 0.9rem;
  }
  input,
  select,
  textarea {
    font-size: 0.9rem;
    padding: 10px;
  }
  .button {
    font-size: 0.9rem;
    padding: 10px;
  }
}
@media (max-width: 480px) {
  .contact-container {
    padding: 1rem;
    margin: 0.5rem;
  }
  h2 {
    font-size: 1.3rem;
  }
  .subtitle {
    font-size: 0.85rem;
  }
  input,
  select,
  textarea {
    font-size: 0.85rem;
    padding: 8px;
  }
  .button {
    font-size: 0.85rem;
    padding: 10px;
  }
}
</style>
