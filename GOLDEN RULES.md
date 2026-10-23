# 📌 PROJECT DASHBOARD & STATE — Test.me (World-Class AI Examination & Gamified SaaS)

> **Rasmiy Boshqaruv Fayli (Primary Source of Truth):**
> Ushbu hujjat loyihaning arxitekturasi, joriy holati, kechki avtonom rivojlantirish rejasi (4+ soatlik master reja) va barcha kamchiliklarni bartaraf etish protokolini belgilaydi.
> Global qoidalar va subagentlar: [`C:/Users/user/.gemini/config/AGENTS.md`](file:///C:/Users/user/.gemini/config/AGENTS.md) va `MEMORIES.md`.

---

## 👑 The Sovereign Triad (Boshqaruv Kengashi)
- **🌟 NOVA:** Chief Strategy & Architecture Twin — Supabase/PostgreSQL ekotizimi, B2B SaaS modeli, 100x roadmap va masshtab strategiyasi.
- **🔮 AURA:** Cognitive AI & UX Psychology Overlord — O'zbekiston yoshlari va abituriyentlari psixologiyasi, zero-friction test yechish, "Aha! moment" gamifikatsiyasi va 100% toza mantiq.
- **🤖 EVA:** Sovereign Autonomous CTO & Quality Commander — 7-nuqtali avtonom audit, zero-red-lines, PWA offline-first, Vitest/E2E kafolati va xavfsiz git checkpointlar.

---

## 🎯 Overall Objective & Current Phase
- **Loyiha:** `Test.me` — AI bilan jihozlangan, gamifikatsiyalashgan (TP Coins, Ranks, Do'stlar 1v1 dueli, Sertifikatlar) milliy test va bilim baholash platformasi.
- **Hozirgi Bosqich:** Phase 3 — Enterprise & Mobile-First Hardening (Dual-DB to Unified Supabase, PWA Desktop/Mobile App, Zero-Glitch UI/UX).
- **Status:** Active Overnight Overhaul (Avtonom 4+ soatlik chuqur modernizatsiya).

---

## 🧠 Architecture Decision Log (ADR)
1. **Stack:** Vue 3 (Composition + Options API), Vite, Vuex, Vue Router, Supabase (PostgreSQL + Auth + Storage), Firebase (legacy transitional), Tailwind / Vanilla Glassmorphism CSS, Vitest.
2. **Database Strategiyasi:** Firebase'dagi parchalangan ma'lumotlarni yagona relatsion Supabase (`supabase/schema.sql`) arxitekturasiga bosqichma-bosqich xavfsiz o'tkazish, fallback mexanizmini saqlash.
3. **PWA & Offline-First:** Standart web saytdan to'laqonli o'rnatiladigan Mobile App (Android APK-like PWA / iOS Home Screen WebApp) va Desktop ilovaga aylantirish; Service Worker avto-yangilanishi (`v2.1.0+`).
4. **Xavfsizlik & Defensive Logic:** Admin funksiyalari uchun PIN-kod guard, SQL/NoSQL inyeksiyasiga qarshi Zod/parametrli so'rovlar, bo'sh ma'lumotlarda qotib qolishni (null-pointer) nolga tushirish.

---

## 🗺️ 4-Soatlik Tungi Avtonom Master Reja (Overnight Deep Sprint)

### 🚀 1-Faza: Ma'lumotlar Bazasi va Backend Xavfsizligi (Supabase Unified Pipeline)
- [x] Supabase relatsion sxemasi (`supabase/schema.sql`) va boshlang'ich seeder (`supabase/seed.sql`) ishlab chiqish.
- [x] Foydalanuvchi do'stlari, 1v1 PvP duellari va do'stlar reytingi tizimini ishlab chiqish (`FriendsDashboard`, `DuelModal`, `FriendLeaderboard`, `GiftCoinsModal`).
- [x] Loyiha papkalarini tartibga solish, dead code va ortiqcha fayllarni tozalash (`supabase/`, `firebase/`, `views/auth/`).
- [ ] Profil, Ballar (TP Coins) va Tranzaksiyalar uchun atomar tranzaksiya mantiqini mustahkamlash (balans manfiy bo'lmasligi, race-condition himoyasi).
- [ ] Admin panel uchun maxfiy kalit va PIN kod (`admin_pin`) tekshiruvini qat'iylashtirish.

### 🎨 2-Faza: UI/UX va Mobile-First Ekranlarni Mukammallashtirish (Zero-Glitch UX)
- [x] Desktop Navbar'dagi ortiqcha install tugmasini olib tashlash, toza minimalizmga keltirish.
- [x] Versiya vidjeti va qo'lda tekshirish tugmasini Sidebar pastki qismiga joylashtirish.
- [x] Do'stlar va Hamjamiyat 100x SaaS interfeysi (Discovery grid, Glassmorphic profillar, real-time chat).
- [ ] Mobil ekranda (375px–414px) gorizontal scroll va sinishlarni to'liq bartaraf etish (`MobileBottomNav`, test savollari kartasi, shop sahifasi).
- [ ] Bo'sh holatlar (Empty States), yuklanish skeletonlari va xatolik yuz berganda chiroyli Retry modal qo'shish.
- [ ] Dark / Light mode ranglar kontrastini va Glassmorphism fonlarini Linear/Apple standartiga moslash.

### 🎮 3-Faza: Test Yechish Jarayoni va AI Mentors Tizimi (Core Experience)
- [x] Test savollarini yuklashda kesh va offline ishlash imkoniyatini kuchaytirish (IndexedDB `questions_cache` & `pending_results` navbati).
- [x] Firebase qoldiqlarini to'liq tozalash va Supabase'ga o'tkazish (`vendor-firebase` o'chirildi, bundle ~1.2 MB ga qisqardi).
- [x] AI maslahatchisi (Hint) so'rovlarida token tejamkorligi va xatolikdan himoyalanish (`try/catch/fallback`).
- [x] Test yakunlanganda sertifikat generatsiyasi va natijalarni avtomatik saqlash barqarorligi.
- [x] 1v1 Duel challenge taklifnomasida real-vaqt rejimini mustahkamlash (Supabase Realtime broadcast).

### 🛡️ 4-Faza: Avtonom Testlash, Build va Git Checkpoint (Zero-Defect Release)
- [x] Vitest testlarini ishga tushirish (37/37 muvaffaqiyatli, 7 ta test to'plami).
- [x] Vite production build tekshiruvi (to'liq muvaffaqiyatli, 9.72s).
- [x] PWA Service Worker offline kesh generatsiyasi (`mode: generateSW`).
- [ ] Barcha o'zgarishlarni Git orqali `origin/main` ga xavfsiz push qilish.
- [ ] Tonggi soat 08:00 hisobotini to'liq tayyorlash.

---

## 🐛 Known Bugs & UX Defects (Aniqlangan Kamchiliklar va Holati)
1. **[Tuzatildi]** Desktop Navbarida ilova o'rnatish tugmasi juda noqulay joylashgan edi ➔ Sidebar pastiga va avtomatik modalga ko'chirildi.
2. **[Tuzatildi]** Service Worker yangilanganda bildirishnoma chiqmas edi ➔ `AppUpdatePrompt.vue` orqali yangilanishni qabul qilish tugmasi qo'shildi.
3. **[Faol]** Ayrim admin va do'kon sahifalarida Firebase va Supabase o'rtasidagi ma'lumotlar sinxronizatsiyasi to'liq emas ➔ `supabaseService.js` orqali markazlashtirilmoqda.
4. **[Faol]** Mobil telefonda test sahifasining pastki qismidagi navigatsiya tugmalari ba'zida klaviatura yoki BottomNav ostida qolib ketishi xavfi bor ➔ Safe-area padding kuchaytirilmoqda.

---

## 🔄 Active Task (In Progress)
- [ ] O'qituvchilar kabineti (Teacher LMS) va Click/Payme to'lovlarini joriy qilish.

## ✅ Completed Checklist (History)
- [x] 2026-10-10: PWA avto-yangilanish tizimi, versiya badge (`v2.1.0`), AppUpdatePrompt yaratildi.
- [x] 2026-10-10: Desktop navbar tozalandi, versiya vidjeti Sidebar footeriga o'rnatildi.
- [x] 2026-10-10: Vitest va Vite build 100% yashil holatga keltirildi.
- [x] 2026-10-11: Dual-Auth Mismatch bartaraf etildi: Google OAuth va Email kirish to'liq Supabase `authService` ga o'tkazildi (`login.vue`, `SignUp.vue`, `admin/index.vue`).
- [x] 2026-10-11: `authGuard.js` xavfsizlantirildi: Fail-Open zaifligi yopildi, hardcoded admin emaillar o'rniga DB roli (RBAC) ulandi.
- [x] 2026-10-11: Media aktivlar optimallashtirildi: `TPcoinAi.png` (5.68 MB -> 106 KB + WebP) va barcha qutilar WebP ga o'tkazilib, hajm 12 MB dan <1.8 MB ga tushirildi.
- [x] 2026-10-11: KaTeX integratsiya qilindi: Matematika, fizika va kimyo formulalari (`$...$` va `$$...$$`) `TestQuestionCard.vue` da professional LaTeX formatida renderlandi.
- [x] 2026-10-11: Vitest test qamrovi 11 tadan 31 taga yetkazildi (6 ta test fayli, 100% yashil).
- [x] 2026-10-24: Login & SignUp UX: Tugmalar va formalar uchun animatsiyali yuklanish (`isRedirecting`, `isLoading`, spinner) qo'shildi, qotib qolish effekti bartaraf etildi.
- [x] 2026-10-24: Sahifalararo navigatsiya loaderi: `TopProgressBar.vue` va `usePageProgress` (Linear/YouTube uslubidagi progress bar + ambient toast) joriy etildi.
- [x] 2026-10-24: Scroll Reset to Top: `savedPosition` xatosi olib tashlandi, har qanday sahifaga o'tganda yoki qaytganda `window` va `.page-content` doim yuqoriga (`top: 0`) o'tishi kafolatlandi.
- [x] 2026-10-24: Sensitive Data Leak & Console Privacy Guard: Barcha shaxsiy loglar (`user.uid`, `results`, `FCM Token`, `coinsEarned`) olib tashlandi; Hardcoded Gemini API kaliti tozalandi va 403 Forbidden spam to'xtatildi; `main.js` ga Enterprise Console Sanitizer o'rnatildi.
