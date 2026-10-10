# 🎓 Test.me — Zamonaviy Gamifikatsiyalangan AI Test Platformasi

Test.me — O'zbekistondagi maktab o'quvchilari, abituriyentlar va bilimga chanqoq yoshlar uchun sun'iy intellekt (Gemini 2.5 Flash), gamifikatsiya (TP Coins, Lootboxlar, Nishonlar, 1v1 Duellar) va rasmiy sertifikatlash imkoniyatlariga ega bo'lgan zamonaviy EdTech platforma.

---

## ⚡ Asosiy Imkoniyatlar

- 🤖 **AI Mentors (9 xil xarakter):** Qattiqqo'l professor, do'stona murabbiy, kulgili komik va sokratik faylasuf uslubidagi avtomatik test savollari generatsiyasi.
- 💰 **TP Coins & Shop:** Test yechib tanga ishlash, neon temalar va profil ramkalarini xarid qilish, interaktiv qutilar (lootboxes) ochish.
- ⚔️ **1v1 Duel & Friends:** Do'stlar orttirish, o'zaro chat va 1-ga-1 test bellashuvlari.
- 📜 **Rasmiy Sertifikatlar:** 80%+ natija bilan fan va darajani tugatganda avtomatik beriluvchi va chop etiluvchi chiroyli sertifikatlar.
- 🔥 **Daily Streak:** Foydalanuvchini har kuni kirib bilimini oshirishga undovchi doimiy faollik hisoblagichi.
- 📱 **PWA & Offline:** Mobil qurilmalarga ilova sifatida o'rnatish va tarmoqsiz ishlash imkoniyati.

---

## 🛠️ Texnologik Stack

- **Frontend:** Vue.js 3 (Composition API, `<script setup>`), Vite 6, Vuex 4, Vue Router 4.
- **Dizayn:** Glassmorphism, Tailwind CSS, Vanilla CSS, FontAwesome 6, Chart.js.
- **Ma'lumotlar Bazasi:** Supabase (PostgreSQL + Row Level Security + Auth).
- **AI Dvigateli:** Google Gemini 2.5 Flash API.
- **Testlash & CI/CD:** Vitest, GitHub Actions.
- **Telegram Bot:** Node.js long-polling & webhook support (`bot/runner.js`).

---

## 🚀 Ishga Tushirish (Quick Start)

### 1. Repozitoriyni klonlash:
```bash
git clone https://github.com/BaxromAvliyoqulov/Test.me.git
cd Test.me
```

### 2. Bog'liqliklarni o'rnatish:
```bash
npm install
```

### 3. Muhit o'zgaruvchilarini sozlash (`.env`):
Loyiha ildizida `.env` faylini yarating:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### 4. Dasturni ishga tushirish:
```bash
npm run dev
```
Brauzeringizda `http://localhost:5173` manziliga kiring.

---

## 🧪 Sinovlar va Ishlab Chiqarish (Scripts)

- **Unit testlarni yurgizish:**
  ```bash
  npm run test
  ```
- **Production build yaratish:**
  ```bash
  npm run build
  ```
- **Build natijasini sinash:**
  ```bash
  npm run preview
  ```
- **Telegram yordamchi botni ishga tushirish:**
  ```bash
  npm run bot
  ```

---

## 📄 Litsenziya

Ushbu loyiha [MIT License](LICENSE) asosida litsenziyalangan. Muallif: **Baxrom Avliyoqulov**.
