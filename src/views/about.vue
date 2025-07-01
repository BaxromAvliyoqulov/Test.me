<template>
  <div class="about-container">
    <div class="aboutText">
      <h1 class="aboutTitle">
        <span class="gradient-text">Test.me</span> platformasiga xush kelibsiz!
      </h1>
      <div class="about-content">
        <p>
          Bizning innovatsion test platformamizga xush kelibsiz – bu yerda
          ta'lim qiziqarli va samarali bo'ladi! Bizning platforma quyidagilarni
          taklif etadi:
        </p>
        <ul>
          <li>Turli mavzular va murakkablik darajalari bo'yicha testlar</li>
          <li>Tezkor natijalar va batafsil tahlil</li>
          <li>Shaxsiy yondashuv asosida o'qitish</li>
          <li>O'z yutuqlaringizni kuzatish imkoniyati</li>
          <li>Qulay va sodda interfeys</li>
        </ul>
        <p>
          Imtihonga tayyorgarlik ko'rayotgan bo'lsangiz, bilimingizni
          tekshirmoqchi bo'lsangiz yoki shunchaki o'rganishni yaxshi ko'rsangiz
          – bizning platforma aynan siz uchun yaratilgan!
        </p>
      </div>
      <div class="button-container">
        <button class="button" @click="navigateToTest">Start Test</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    navigateToTest() {
      this.$router.push('/');
    },
  },
};
</script>

<style scoped>
.about-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.aboutText {
  background: #ffffff;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.aboutTitle {
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-align: center;
}

.about-content {
  margin-bottom: 2rem;
}

.about-content p {
  font-size: 1rem;
  line-height: 1.6;
  color: #4a4a4a;
  margin-bottom: 1.2rem;
}

.about-content ul {
  list-style-type: none;
  padding-left: 0;
  margin-bottom: 1.5rem;
}

.about-content li {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #4a4a4a;
  margin-bottom: 0.8rem;
  padding-left: 1.5rem;
  position: relative;
}

.about-content li::before {
  content: '•';
  color: #007bff;
  font-weight: bold;
  position: absolute;
  left: 0;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .about-container {
    padding: 1rem;
  }

  .aboutText {
    padding: 1.5rem;
  }

  .aboutTitle {
    font-size: 2rem;
  }

  .about-content p,
  .about-content li {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .aboutTitle {
    font-size: 1.5rem;
  }

  .aboutText {
    padding: 1rem;
  }

  .about-content p,
  .about-content li {
    font-size: 0.9rem;
  }
}
</style>
