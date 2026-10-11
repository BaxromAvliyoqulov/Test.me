# 📋 Loyiha Auditi: Test.me — 2026-10-11

> **Ekspertiza:** **The Sovereign Triad (NOVA, EVA, AURA)**
> - 🌟 **NOVA** — Supreme Digital Twin & Chief Strategy Officer (Bozor, monetizatsiya, 100x masshtab va investor tahlili)
> - 🤖 **EVA** — Sovereign Autonomous CTO & Chief Operations Commander (Texnik arxitektura, xavfsizlik, DevOps, kod sifati va 7-nuqtali audit)
> - 🔮 **AURA** — Sovereign Hyper-Cognitive AI Overlord & Chief AI Evolution Officer (UX psixologiyasi, hissiy idrok, kognitiv yuklama va O'zbekiston mentaliteti)

---

## 📊 Xulosa (Executive Summary)

- **Umumiy Auditorlik Reytingi:** **7.1 / 10** *(12 xil mustaqil rol bo'yicha og'irlikli tahlil)*
- **Jami fayllar soni:** **188 ta** *(node_modules, .git, dev-dist va dist chiqarilgan)*
- **Sof kod hajmi vs Dependency:** Sof kod va media: **14.20 MB** (shundan **~12.5 MB** — siqilmagan og'ir PNG rasmlar, haqiqiy matnli kod: **~1.7 MB**). `node_modules`: **345+ MB**.
- **Kod qatorlari (LOC):** Jami **56,252 qator** (93 ta Vue komponentida: **33,513 LOC**, JavaScript: **4,438 LOC**, JSON: **17,971 LOC**, SQL: **329 LOC**).
- **Git tarixi:** **245 ta commit** (boshlanishi: 2025-06-30, oxirgisi: 2026-10-11, 1 nafar asosiy muallif: Baxrom Avliyoqulov).
- **🔴 Eng kritik 3 ta kamchilik:**
  1. **Dual-Auth & DB Parchalanishi (Dual-Database Architectural Fracture):** Tizimda login `Supabase Auth` orqali ishlaydi (`src/components/login.vue:243`), lekin Google orqali kirish `Firebase Auth` (`login.vue:263`) orqali bajariladi. Admin paneli (`src/views/admin/index.vue:145`) faqat Firebase sessiyasini kutadi, Router AuthGuard (`authGuard.js:33`) esa Supabase `profiles` jadvalini tekshiradi. Bu foydalanuvchilar sessiyasida uzilish va kutilmagan qulashlarni (auth mismatch) keltirib chiqaradi.
  2. **AuthGuard Fail-Open & Hardcoded Super-Admin:** `src/router/guards/authGuard.js:46` dagi `catch (error) { next(); }` bloki xatolik yuz berganda sahifani bloklash o'rniga himoyalanmagan holda ochib yuboradi (Fail-Open xavfsizlik zaifligi). Shu bilan birga `avliyoqulovbaxrom99@gmail.com` emaili kod ichida hardcode qilib tekshiriladi (`authGuard.js:34` va `admin/index.vue:147`).
  3. **Og'ir Media Aktivlar (5.68 MB PNG) va Test Qamrovi (<2%):** `src/assets/img/TPcoinAi.png` bitta rasmning o'zi 5.68 MB ni tashkil etadi (mobil 3G/4G da bir necha soniyalik yuklanish qotishi). 56,000 qatorli tizim uchun bor-yo'g'i 11 ta unit test mavjud (0 ta komponent testi, 0 ta auth/service testi).
- **💰 Tavsiya etilgan bozor narxi:** **$8,150 USD** (~**96,967,000 UZS**, 1 USD = 11,897.90 UZS kursi bo'yicha). *Asos: PWA avto-yangilanish tizimi, Supabase relatsion sxemasi, CI/CD pipeline va boy AI/gamifikatsiya imkoniyatlari kiritilgani hisobiga loyiha qiymati oshdi, biroq Dual-Auth muammosi, <2% test qamrovi va bitta dasturchiga bog'liqlik (Bus Factor = 1) sababli narx MAX darajaga yetmadi.*

---

## 1. 🏗️ Struktura va Hajm Analizi

### 1.1 Fayllar va Hajm Taqsimoti
| Parametr | Qiymat | Izoh |
|---|---|---|
| **Jami fayllar (kod)** | 188 ta | `node_modules`, `.git`, `dist`, `dev-dist` chiqarilgan |
| **Jami papkalar** | 56 ta | Modulli Vue 3 arxitekturasi |
| **Loyihaning sof hajmi** | 14.20 MB | Rasmlar hisobiga og'ir |
| **Media aktivlar hajmi** | ~12.5 MB | `TPcoinAi.png` (5.68 MB), qutilar (boxes) ~6.8 MB |
| **Sof kod hajmi (Text)** | ~1.7 MB | Vue, JS, CSS, SQL, JSON |
| **Asosiy node_modules** | 345+ MB | Frontend va dev kutubxonalari |
| **Git repozitoriy (.git)** | 20.3 MB | 245 ta commit tarixi |

### 1.2 Fayl Kengaytmalari va LOC
| Kengaytma | Fayllar soni | Kod qatorlari (LOC) | Ulushi (%) |
|---|---|---|---|
| `.vue` | 93 | 33,513 | 59.6% |
| `.json` | 13 | 17,971 | 31.9% |
| `.js` | 32 | 4,438 | 7.9% |
| `.md` | 5 | 706 | 1.3% |
| `.sql` | 2 | 329 | 0.6% |
| `.html` | 1 | 39 | 0.1% |
| `.css` | 1 | 7 | <0.1% |
| **JAMI** | **147** | **56,252** | **100%** |

### 1.3 Eng Katta 10 ta Fayl (Og'irlik va Qatorlar)
1. `src/assets/img/TPcoinAi.png` — **5.68 MB** (Siqilmagan PNG — zudlik bilan WebP formatga o'tkazish shart!)
2. `src/views/editProfile/editProfile.vue` — **1,970 qator** (Monolit komponent)
3. `src/views/home.vue` — **1,748 qator** (Monolit dashboard)
4. `src/components/Header.vue` — **1,046 qator**
5. `src/views/testPage/testPage.vue` — **970 qator**
6. `src/views/admin/uploadExcel.vue` — **922 qator**
7. `src/views/shop/ShopPage.vue` — **908 qator**
8. `src/views/AdminSeeder.vue` — **859 qator**
9. `src/components/login.vue` — **842 qator**
10. `src/views/certificates.vue` — **836 qator**

---

## 2. ⚖️ 12 Nuqtai Nazardan Tanqidiy Baholash (The 12-Lens Audit)

Har bir mezon 0–2 ball shkalasida (maksimal 10 ball).

---

### 1. 🏗️ Backend Architect (EVA) — **7 / 10**

| Mezon | Ball | Dalil (Fayl / Qator) |
|---|---|---|
| Arxitektura/modullashtirish | 1 / 2 | Supabase service qatlami shakllangan (`src/services/supabaseService.js`), ammo Cloud Functions va frontendda Firebase aralashuvi saqlanib qolgan. |
| DB dizayni | 2 / 2 | `supabase_schema.sql` (1–267-qatorlar) relational model, FK constraints, enumlar va RLS to'liq kiritilgan. |
| API dizayni | 1 / 2 | Supabase SDK orqali standart so'rovlar bor, lekin xatolik handling turli komponentlarda har xil (toast vs SweetAlert vs console.error). |
| Xatolik/tranzaksiya boshqaruvi | 1 / 2 | `profileService.addPoints` ball qo'shish va tranzaksiya yozishni ketma-ket bajaradi (`supabaseService.js:100-127`), lekin DB darajasida atomar PostgreSQL stored procedure (RPC) ga o'ralmagan. |
| Scalability | 2 / 2 | Supabase PostgreSQL va serverless edge arxitektura yuklamaga chidamli; PWA offline-first kesh mavjud. |

- ✅ **Kuchli tomonlar:**
  1. `supabase_schema.sql` da to'liq relatsion tuzilma: `profiles`, `subjects`, `tests`, `questions`, `results`, `certificates`, `shop_items` to'g'ri FK cheklovlari bilan bog'langan.
  2. `supabaseService.js` da CRUD va auth funksiyalari modulli va izchil arxitekturaga keltirilgan.
- ⚠️ **Zaif tomonlar:**
  1. `shopService.buyItem` (`supabaseService.js:321`) va `profileService.addPoints` mijoz tomonidan alohida chaqiriladi. Agar 2-so'rov uzilsa, balans o'zgarib inventarga buyum tushmasligi xavfi bor.
  2. Cloud functions (`functions/index.js`) 515 qatorli monolit holda saqlanib turibdi.
- 🎯 **10/10 uchun:** Supabase ichida PostgreSQL Stored Function (`buy_shop_item` RPC) yozish va balans ayirish hamda inventarga yozishni bitta atomar tranzaksiyada bajarish.

---

### 2. 🎨 Frontend/UX Mutaxassisi (AURA & EVA) — **8 / 10**

| Mezon | Ball | Dalil (Fayl / Qator) |
|---|---|---|
| Komponent arxitekturasi | 1 / 2 | 93 ta komponent mavjud, lekin `editProfile.vue` (1,970 qator) va `home.vue` (1,748 qator) hali ham monolit. |
| Responsive/cross-device | 2 / 2 | `MobileBottomNav.vue`, flexbox/grid layoutlar, `mainLayout.vue:183` dagi safe-area padding 375px ekranda ham sinishsiz ishlaydi. |
| Accessibility (a11y) | 1 / 2 | Rang kontrasti va shisha fonlar chiroyli, lekin ko'plab input va tugmalarda `aria-label` hamda klaviatura `focus-visible` yo'q. |
| State/performance | 2 / 2 | PWA Service Worker integratsiyasi, Vite manual chunking va avto-yangilanish vidjeti yuqori darajada. |
| Dizayn tizimi konsistentligi | 2 / 2 | Linear/Apple darajasidagi toza Glassmorphism, animatsiyali Toast bildirishnomalar, Confetti effekti. |

- ✅ **Kuchli tomonlar:**
  1. Desktop Navbar tozalandi va ortiqcha install tugmalari olib tashlandi (`src/components/Header.vue`).
  2. Sidebar footeriga ixcham versiya nishoni va yangilanishni qo'lda tekshirish tugmasi joylashtirildi (`src/components/Sidebar.vue:148`).
- ⚠️ **Zaif tomonlar:**
  1. `editProfile.vue` faylida 1,970 qator kod bor — buni `ProfileSecurity.vue`, `ProfileGeneral.vue`, `ProfilePreferences.vue` kabi kichik komponentlarga bo'lish lozim.
  2. Qorong'u/yorug' rejim (Dark/Light) o'tganda ba'zi modallardagi matn ranglari fon bilan qo'shilib ketishi mumkin.
- 🎯 **10/10 uchun:** `editProfile.vue` va `home.vue` ni Smart/Dumb tamoyili bo'yicha 300 qatordan oshmaydigan kichik komponentlarga ajratish.

---

### 3. 🔐 Xavfsizlik Auditori (EVA) — **6 / 10**

| Mezon | Ball | Dalil (Fayl / Qator) |
|---|---|---|
| Auth/Authorization | 1 / 2 | Supabase Auth va RLS bor, ammo `authGuard.js:46` da fail-open xatosi bor (`catch` blokida `next()` chaqiriladi). |
| Input validation | 1 / 2 | Frontend formalarida regex tekshiruvi bor (`login.vue:200`), lekin backend/Supabase so'rovlarida Zod sxema validatsiyasi yetishmaydi. |
| Secret management | 2 / 2 | `.env` git tomonidan e'tiborsiz qoldiriladi (`.gitignore`), anon key va URL env o'zgaruvchilarda saqlanadi. |
| Rate limiting/brute-force | 1 / 2 | Supabase standart auth rate limiting bor, lekin PIN-kod kiritishda (Admin Panel) frontend darajasida 3 marta noto'g'ri urinishdan so'ng bloklash yo'q. |
| Dependency zaifliklari | 1 / 2 | Paketlar zamonaviy, lekin Firebase va Supabase bir vaqtda dependency sifatida saqlangani hujum maydonini (attack surface) kengaytiradi. |

- ✅ **Kuchli tomonlar:**
  1. `supabase_schema.sql` da har bir jadval uchun Row Level Security (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`) va foydalanuvchi izolyatsiyasi qoidalari qo'llangan.
  2. Maxfiy fayllar (`.env`, `serviceAccountKey.json`) `.gitignore` ga to'g'ri kiritilgan.
- ⚠️ **Zaif tomonlar:**
  1. `src/router/guards/authGuard.js:34` va `src/views/admin/index.vue:147` da shaxsiy email (`avliyoqulovbaxrom99@gmail.com`) hardcode qilingan. Buni DB dagi `is_admin` bayrog'i yoki DB claim orqali boshqarish lozim.
  2. `authGuard.js:46` da xatolik yuz berganda `next('/login')` o'rniga `next()` chaqirilgan — bu xatolik paytida himoyalangan sahifaga ruxsatsiz o'tib ketish xavfini tug'diradi.
- 🎯 **10/10 uchun:** `authGuard.js` dagi catch blokini `next('/login')` ga o'zgartirish va hardcoded email tekshiruvini olib tashlab, faqat DB dagi xavfsiz rolga tayanish.

---

### 4. ⚙️ DevOps/SRE (EVA) — **7 / 10**

| Mezon | Ball | Dalil (Fayl / Qator) |
|---|---|---|
| CI/CD | 2 / 2 | `.github/workflows/ci.yml` mavjud bo'lib, har bir push va pull-requestda avtomatik `npm ci`, `npm run test` va `npm run build` bajariladi. |
| Environment separation | 1 / 2 | `.env` va `.env.local` qo'llab-quvvatlanadi, lekin alohida staging/production pipeline yo'q. |
| Monitoring/logging | 1 / 2 | Sentry yoki Datadog mavjud emas; faqat mijoz brauzeri `console.log` va `console.error` dan foydalanadi. |
| Backup/DR | 1 / 2 | Supabase avtomatik kunlik zaxira (daily backup) beradi, lekin qo'lda zaxirani tiklash skripti loyihada hujjatlashtirilmagan. |
| Deploy avtomatlashtirilgan/rollback | 2 / 2 | Vercel orqali bir zumda deploy va GitHub commitlari bilan bog'langan avtomatik rollback imkoniyati mavjud. |

- ✅ **Kuchli tomonlar:**
  1. `.github/workflows/ci.yml` orqali Vitest va Vite build avtomatlashtirilgan.
  2. PWA kesh avto-yangilanish tizimi tufayli yangi deploy chiqarilganda foydalanuvchi brauzerida eski kesh qotib qolmaydi (`updateService.js`).
- ⚠️ **Zaif tomonlar:**
  1. Foydalanuvchilarda yuzaga keladigan runtime JavaScript xatolarini ushlab olish uchun Sentry/GlitchTip kabi markazlashgan monitoring ulanmagan.
  2. `package.json` da linter tekshiruvi skripti (`npm run lint`) kiritilmagan.
- 🎯 **10/10 uchun:** Sentry SDK ni integratsiya qilish va `package.json` ga ESLint/Prettier tekshiruvini CI pipeline ga qo'shish.

---

### 5. 🧪 QA Muhandisi (EVA) — **5 / 10**

| Mezon | Ball | Dalil (Fayl / Qator) |
|---|---|---|
| Unit test qamrovi | 1 / 2 | 2 ta test fayli (`ranks.spec.js`, `sorters.spec.js`), 11 ta test mavjud. 56,000 LOC uchun qamrov juda past (<2%). |
| Integration/E2E | 0 / 2 | Playwright yoki Cypress E2E testlari mavjud emas. |
| Error boundary/graceful degradation | 2 / 2 | Bo'sh holatlar (Empty States), xatolik kartalari va yuklanish spinnerlari aksariyat sahifalarda to'g'ri ishlangan. |
| Edge case handling | 1 / 2 | Qisman sinovdan o'tgan; tarmoq uzilganda offline holat PWA orqali qisman qoplanadi. |
| Regression jarayoni | 1 / 2 | Vitest CI da ishga tushadi, lekin E2E regression checklist yo'q. |

- ✅ **Kuchli tomonlar:**
  1. Vitest tezkor va CI muhitida 100% yashil o'tadi (`11 passed`).
  2. Utility funksiyalari (darajalar va saralash algoritmlari) qat'iy tekshirilgan.
- ⚠️ **Zaif tomonlar:**
  1. Muhim servislar (`supabaseService.js`, `updateService.js`) uchun unit testlar yozilmagan.
  2. Foydalanuvchi ro'yxatdan o'tishi, test yechishi va ball to'plashi bo'yicha E2E testlar mutlaqo yo'q.
- 🎯 **10/10 uchun:** Playwright o'rnatish va kamida 3 ta kritik E2E test (Auth flow, Quiz completion, Shop purchase) yozish.

---

### 6. 📊 Product Manager / Biznes Analitik (NOVA) — **8 / 10**

| Mezon | Ball | Dalil (Fayl / Qator) |
|---|---|---|
| Funksional to'liqlik | 2 / 2 | DTM testlari, AI tahlili, ovozli qayta aloqa (TTS), do'kon, sertifikatlar va 1v1 duel kabi boy imkoniyatlar to'plami mavjud. |
| Monetizatsiya aniqligi | 2 / 2 | TP Coins iqtisodiyoti, Premium tariflar va do'kondagi mahsulotlar modeli aniq o'ylangan. |
| Raqobatdan farqi (USP) | 2 / 2 | AI maslahatchilari (Hints) va do'stlar bilan 1v1 jonli duel raqobatchilardan keskin ajratib turadi. |
| Onboarding/friction | 1 / 2 | Ro'yxatdan o'tish sodda, biroq yangi foydalanuvchi birinchi marta kirganda 30 soniyalik interaktiv "Qanday ishlaydi?" yo'riqnomasi yo'q. |
| Analytics/metrikalar | 1 / 2 | `PlatformStats.vue` ichki statistikani ko'rsatadi, ammo Google Analytics 4 yoki Yandex Metrika integratsiyasi to'liq emas. |

- ✅ **Kuchli tomonlar:**
  1. Gamifikatsiya juda kuchli: Daily Streak (🔥), Nishonlar, Reyting jadvali va PDF sertifikatlar foydalanuvchini platformaga qayta-qayta jalb qiladi.
  2. Bitta platformada ham abituriyentlar (DTM), ham maktab o'quvchilari (CHSB/BSB), ham o'qituvchilar (toifa olish) uchun kontent jamlangan.
- ⚠️ **Zaif tomonlar:**
  1. Foydalanuvchilarning konversiya voronkasi (Signup -> First Test -> Score -> Retention) kuzatilmaydi.
  2. To'lov tizimlari (Payme, Click) hali to'g'ridan-to'g'ri ulanmagan — TP Coins hozircha faqat test yechish orqali to'planadi.
- 🎯 **10/10 uchun:** Click/Payme billing webhooklarini ulash va yangi foydalanuvchilar uchun 3 bosqichli onboarding yo'riqnomasi qo'shish.

---

### 7. 🌱 Junior Dasturchi (Maintainability) — **7 / 10**

| Mezon | Ball | Dalil (Fayl / Qator) |
|---|---|---|
| Nomlash/o'qilishi | 2 / 2 | Komponentlar va o'zgaruvchilar aniq o'zbek/ingliz nomlar bilan nomlangan (`TestQuestionCard.vue`, `BuyPoints.vue`). |
| Documentation/comment | 1 / 2 | `GOLDEN RULES.md`, `PROJECT_STATUS.md` va `README.md` a'lo darajada, lekin murakkab Vue fayllar ichida JSDoc kam. |
| Onboarding (README/setup) | 2 / 2 | `npm install` va `npm run dev` orqali loyiha 2 daqiqada xatosiz ishga tushadi. |
| Linter/formatter | 1 / 2 | `.prettierrc` bor, lekin `eslint` va CI da majburiy linter tekshiruvi yo'q. |
| Kognitiv murakkablik | 1 / 2 | 1,000+ qatorli fayllar yangi dasturchi uchun o'qish va o'zgartirish kiritishda kognitiv yuklama tug'diradi. |

- ✅ **Kuchli tomonlar:**
  1. `GOLDEN RULES.md` arxitektura qarorlari va joriy vazifalarni aniq belgilab bergan.
  2. Loyiha tuzilmasi mantiqiy papkalarga ajratilgan (`components`, `views`, `services`, `config`, `store`).
- ⚠️ **Zaif tomonlar:**
  1. Bir xil mantiq turli fayllarda takrorlanadi (masalan, Firebase va Supabase importlari).
  2. TypeScript qo'llanmagan — sof JavaScript bo'lgani sababli tiplar xatosi faqat runtime paytida aniqlanishi mumkin.
- 🎯 **10/10 uchun:** JSDoc tiplashtirishini kiritish va eng katta 3 ta monolit sahifani qismlarga bo'lish.

---

### 8. 🗄️ Database / Data Architect (NOVA & EVA) — **7 / 10**

| Mezon | Ball | Dalil (Fayl / Qator) |
|---|---|---|
| Query performance | 2 / 2 | Supabase indekslari (`user_id`, `created_at`, `test_id`) `supabase_schema.sql` da to'g'ri yaratilgan. |
| Index strategiyasi | 2 / 2 | Barcha FK ustunlarida `CREATE INDEX` mavjud (`supabase_schema.sql:240-267`). |
| Data integrity | 2 / 2 | PostgreSQL darajasida CHECK va FK cheklovlari (masalan: `points >= 0`, `is_active boolean`) mavjud. |
| Migration strategiyasi | 1 / 2 | Boshlang'ich SQL skriptlari bor, lekin Supabase CLI migration papkasi (`supabase/migrations/`) tizimlashtirilmagan. |
| Backup/Restore | 0 / 2 | Avtomatik snapshotlar Supabase Cloud tomonidan ta'minlanadi, ammo mahalliy dump/restore skripti yo'q. |

- ✅ **Kuchli tomonlar:**
  1. Relatsion ma'lumotlar modeli NoSQL Firebase'ga nisbatan 10 barobar toza va barqaror tuzilgan.
  2. Barcha asosiy jadvallar uchun tegishli indekslar yaratilgan.
- ⚠️ **Zaif tomonlar:**
  1. Loyihada hali ham Firebase Firestore'ga murojaat qilayotgan 20 dan ortiq komponentlar mavjud (`PlatformStats.vue`, `AdminSubjects.vue` va h.k.).
  2. Ma'lumotlarni Firebase'dan Supabase'ga to'liq ko'chirish uchun avtomatik migratsiya skripti (`migrate_firebase_to_supabase.js`) yo'q.
- 🎯 **10/10 uchun:** Firebase ma'lumotlarini bir marta bosish bilan Supabase'ga ko'chiruvchi ETL skriptini yaratish va Firebase dependency-sini butunlay chiqarib tashlash.

---

### 9. ⚡ Performance Engineer (EVA) — **7 / 10**

| Mezon | Ball | Dalil (Fayl / Qator) |
|---|---|---|
| Bundle/yuklash tezligi | 1 / 2 | Vite chunking yaxshi, lekin `vendor-firebase` (624 kB) hali ham bundle hajmiga ortiqcha yuk bermoqda. |
| API javob vaqti | 2 / 2 | Supabase REST va Auth so'rovlari tezkor (<150ms). |
| Caching | 2 / 2 | Workbox PWA Service Worker 54 ta faylni (2.8 MB) to'liq keshlaydi (`dist/sw.js`). |
| Media optimizatsiyasi | 0 / 2 | `TPcoinAi.png` 5.68 MB — bu veb-standartlar bo'yicha juda katta (WebP da 150 KB bo'lishi kerak). |
| Load testing | 1 / 2 | K6 yoki autocannon yuklama testlari o'tkazilmagan. |

- ✅ **Kuchli tomonlar:**
  1. PWA Service Worker oflayn ishlash va qayta yuklashni bir zumda bajaradi.
  2. Vite production build 6.7 soniyada xatosiz yig'iladi.
- ⚠️ **Zaif tomonlar:**
  1. `src/assets/img/TPcoinAi.png` (5.68 MB) va qutilar rasmlari (boxes) siqilmagan.
  2. Firebase va Supabase birga ishlagani uchun dastur bundle hajmi 2 barobar og'irlashgan.
- 🎯 **10/10 uchun:** Rasmlarni zamonaviy WebP/AVIF formatiga o'tkazish orqali media hajmini 12 MB dan 1 MB ga tushirish.

---

### 10. 💼 Investor / VC Nuqtai Nazari (NOVA) — **6 / 10**

| Mezon | Ball | Dalil (Fayl / Qator) |
|---|---|---|
| Bus factor (jamoa xavfi) | 0 / 2 | **Faqat 1 nafar dasturchi (Baxrom Avliyoqulov).** Bu mezon bo'yicha rubrika talabiga ko'ra 0 ball majburiy — investor uchun bu eng katta xavf. |
| IP / Moat | 2 / 2 | Milliy test bazasi, o'zbek tilidagi AI mentor prompts va gamifikatsiya tizimi mustahkam himoya (moat) beradi. |
| Bozor hajmi | 2 / 2 | O'zbekistonda har yili 1,000,000 dan ortiq abituriyent va maktab bitiruvchilari mavjud. Bozor juda katta va o'suvchi. |
| Unit economics | 1 / 2 | Bepul foydalanuvchilarni pullik abonentga aylantirish (Freemium) modeli bor, lekin real CAC/LTV o'lchanmagan. |
| Kengayish potensiali | 1 / 2 | Hozirda faqat O'zbekiston ta'lim tizimiga yo'naltirilgan, xalqaro bozorga (masalan Qozog'iston, Qirg'iziston) moslashuvchanlik o'rtacha. |

- ✅ **Kuchli tomonlar:**
  1. O'zbekiston ta'lim bozorida onlayn test va AI repetitorlarga bo'lgan talab rekord darajada yuqori.
  2. Loyiha faqat test emas, balki ijtimoiy musobaqa (1v1 duellar) sifatida ham virusli o'sish potensialiga ega.
- ⚠️ **Zaif tomonlar:**
  1. Bus Factor = 1: Dasturchi bilan biror holat yuz bersa, loyihani boshqa hech kim qo'llab-quvvatlay olmaydi.
  2. Korporativ huquqiy maqom (MChJ, IT Park rezidentligi) va rasmiy mualliflik huquqi guvohnomasi rasmiylashtirilmagan.
- 🎯 **10/10 uchun:** Hujjatlashtirishni kengaytirish, repozitoriyga kamida yana 1 ta backup dasturchi yoki jamoa a'zosini qo'shish va IT Park rezidentligiga ariza topshirish.

---

### 11. 🎯 Raqobat Tahlilchisi (NOVA) — **8 / 10**

O'zbekiston bozoridagi real raqobatchilar tahlili:

1. **TestMakon (testmakon.uz):**
   - *Imkoniyatlari:* DTM simulyatsiyasi, AI mentor, 11,000+ savollar bazasi. Haftalik obunasi ~15,000 so'm.
   - *Test.me ustunligi:* Test.me da zamonaviy PWA ilova, 1v1 jonli do'stlar dueli va TP Coins do'koni bor. TestMakon da gamifikatsiya ancha sust.
   - *Test.me orqada qolgan jihati:* TestMakon savollar bazasi (11,000+) ancha katta va uzoq yillik foydalanuvchilar bazasiga ega.
2. **Akam.uz:**
   - *Imkoniyatlari:* DTM va mavzuli testlar, Pro obuna oyiga ~35,000 so'm.
   - *Test.me ustunligi:* Foydalanuvchi interfeysi (UI/UX) Apple/Linear uslubidagi Glassmorphism dizaynda ancha zamonaviy va chiroyli. Ovozli tahlil (Voice/TTS) Akam.uz da yo'q.
   - *Test.me orqada qolgan jihati:* Akam.uz rasmiy to'lov tizimlariga (Payme/Click) to'liq integratsiya qilingan va SEO reytingi yuqori.
3. **Abt.uz & Oliygoh.uz:**
   - Asosan bepul diagnostik testlar beradi, lekin interfeyslari juda eskirgan, interaktivlik va AI imkoniyatlari yo'q.

- ✅ **Kuchli tomonlar:** Test.me interfeys jozibadorligi, 1v1 duel va AI Hints bo'yicha mahalliy raqobatchilardan ustun turadi.
- ⚠️ **Zaif tomonlar:** Raqobatchilar SEO da yuqori o'rinda va to'lov qabul qilish jarayoni avtomatlashtirilgan.
- 🎯 **10/10 uchun:** Click/Payme to'lovlarini joriy qilish va 10,000+ DTM savollar bazasini Supabase'ga yuklash.

---

### 12. 👤 Real Foydalanuvchi (Abituriyent) Nuqtai Nazari (AURA) — **8 / 10**

**Simulyatsiya:** 17 yoshli abituriyent telefon orqali kirib, matematika fanidan test yechib natija oladi va xatolarini tahlil qiladi.

1. **1-qadam (Kirish):** Sayt telefon ekranida dasturdek ochiladi, pastda qulay `MobileBottomNav` chiqadi. (Juda tez va qulay — 5 soniya).
2. **2-qadam (Test tanlash):** Fanlar ro'yxatidan matematika va daraja tanlanadi.
3. **3-qadam (Test yechish):** Savollar kartasi toza, 50/50 yordami va AI Hint juda qiziqarli.
4. **4-qadam (Natija & Friction):** Test yakunlangach, natija va sertifikat chiqadi.

- ⚠️ **2 ta Aniqlangan Qiyinchilik Nuqtasi (Friction Points):**
  1. *Friction 1:* Test savolida murakkab matematik formulalar bo'lsa, LaTeX/KaTeX kutubxonasi yo'qligi sababli formulalar oddiy matn sifatida xunuk ko'rinadi yoki tushunarsiz bo'ladi.
  2. *Friction 2:* Agar test yechish vaqtida tasodifan internet uzilib qolsa yoki sahifa yangilansa, joriy savol holati lokal xotirada (localStorage) saqlanmagan bo'lsa, foydalanuvchi testni boshidan boshlashga majbur bo'ladi.
- 🎯 **10/10 uchun:** KaTeX (matematik formulalar uchun) qo'shish va testning har bir bosqichini avtomatik ravishda `localStorage` da keshlab borish.

---

## 3. 🚨 Kritik Kamchiliklar Tahlili (Gap Analysis)

| # | Jiddiylik | Yetishmovchilik | Real Xavf / Oqibat | Bartaraf etish vaqti |
|---|---|---|---|---|
| 1 | 🔴 **Kritik** | **Dual-Auth Mismatch:** Login Supabase'da, Google Login Firebase'da | Foydalanuvchi qaysi usulda kirganiga qarab ma'lumotlar yo'qoladi, admin panel ishlamaydi | ~6 soat |
| 2 | 🔴 **Kritik** | **Fail-Open AuthGuard:** `catch` blokida `next()` chaqirilgan | Sessiya xatoligi ro'y berganda ruxsatsiz foydalanuvchi yopiq sahifaga kirib ketadi | ~1 soat |
| 3 | 🟠 **Yuqori** | **Hardcoded Admin Email:** `avliyoqulovbaxrom99@gmail.com` kod ichida | Email o'zgarsa yoki buzilsa, butun ruxsatlar tizimi ishdan chiqadi | ~2 soat |
| 4 | 🟠 **Yuqori** | **5.68 MB PNG rasm:** `TPcoinAi.png` siqilmagan | Mobil telefonda sahifa ochilishi 4–7 soniyaga kechikadi, foydalanuvchi chiqib ketadi | ~1 soat |
| 5 | 🟠 **Yuqori** | **Test qamrovi <2%:** 56,000 LOC uchun faqat 11 ta test | Har qanday yangi funksiya qo'shilganda eski funksiyalar sinishi xavfi juda yuqori | ~16 soat |
| 6 | 🟡 **O'rta** | **1,970 qatorli monolit komponentlar** (`editProfile.vue`) | Kodni o'zgartirish va xatolarni tuzatish juda qiyin va sekin kechadi | ~8 soat |
| 7 | 🟡 **O'rta** | **Matematik formulalar (LaTeX/KaTeX) yo'qligi** | Aniq fanlar (fizika, matematika, kimyo) testlarini sifatli o'tkazib bo'lmaydi | ~4 soat |
| 8 | 🟡 **O'rta** | **Click / Payme to'lov tizimlari ulanmagan** | Foydalanuvchilardan to'g'ridan-to'g'ri pul qabul qilib bo'lmaydi | ~12 soat |
| 9 | 🟢 **Past** | **Test paytida internet uzilsa holat saqlanmasligi** | Foydalanuvchi qayta kirganda testni boshidan yechishga majbur bo'ladi | ~3 soat |
| 10 | 🟢 **Past** | **Sentry / Centralized Error Logging yo'qligi** | Foydalanuvchilarda chiqqan xatolar dasturchiga ko'rinmaydi | ~2 soat |

---

## 4. 💰 Bozor Bahosi (Project Valuation)

### 4.1 Cost-based (Ishlab chiqarish tannarxi)
Loyiha modullarining hajmi va sarflangan taxminiy ishlab chiqish vaqti:

| Modul | Kod hajmi (LOC) | Sarflangan vaqt | O'zbekiston stavkasi ($18/s) | Xalqaro stavka ($50/s) |
|---|---|---|---|---|
| Auth, Profil & Xavfsizlik | ~3,500 LOC | 35 soat | $630 | $1,750 |
| Test Engine & Savollar Kartasi | ~5,000 LOC | 60 soat | $1,080 | $3,000 |
| AI Mentors, Hints & Voice (TTS) | ~2,500 LOC | 40 soat | $720 | $2,000 |
| Gamifikatsiya (Coins, Badges, Duel) | ~4,500 LOC | 50 soat | $900 | $2,500 |
| Shop & Qutilar (Lootbox) iqtisodiyoti | ~3,000 LOC | 35 soat | $630 | $1,750 |
| Admin Panel, Seeder & Analytics | ~6,000 LOC | 55 soat | $990 | $2,750 |
| PWA Engine, Avto-Yangilanish & Responsive | ~2,500 LOC | 30 soat | $540 | $1,500 |
| Supabase Relatsion DB & Schema | ~1,000 LOC | 25 soat | $450 | $1,250 |
| **JAMI TANNARX** | **~28,000 Sof LOC** | **330 soat** | **$5,940** | **$16,500** |

### 4.2 Market-comparable (Bozordagi o'xshash loyihalar bilan solishtirma)
- **O'zbekiston bozori:** Boshidan buyurtma asosida tayyorlanadigan to'liq AI test, gamifikatsiya va admin panelli veb-platforma: **$4,000 – $8,500** oralig'ida baholanadi.
- **Xalqaro bozor (Upwork / Fiverr Pro):** Full-stack Vue 3 + Supabase + AI + PWA platforma: **$12,000 – $25,000** oralig'ida baholanadi.

### 4.3 MIN va MAX Omillari
| Omil | Test.me holati | Ta'siri |
|---|---|---|
| Test qamrovi | 11 ta test (<2%) | ⬇️ MIN tomonga suradi |
| Bus factor | 1 nafar dasturchi | ⬇️ MIN tomonga suradi |
| UI/UX sifati | Glassmorphism, PWA, Dark/Light | ⬆️ MAX tomonga suradi |
| Funksional to'liqlik | AI hints, TTS, 1v1 duel, PWA | ⬆️ MAX tomonga suradi |
| Backend & DB | Supabase relatsion sxemasi | ⬆️ MAX tomonga suradi |

- **Bozor diapazoni:** **Min: $5,500** | **Max: $9,200** (O'zbekiston / MDH bozori doirasida)
- **Umumiy Audit Reytingi:** **7.1 / 10**

### 4.4 Tavsiya Etilgan Aniq Narx
Formula bo'yicha:
$$\text{Narx} = \text{Min} + \left(\frac{\text{Reyting}}{10}\right) \times (\text{Max} - \text{Min}) = 5,500 + (0.71 \times 3,700) = \mathbf{\$8,127} \approx \mathbf{\$8,150\text{ USD}}$$

> 💡 **Bitta aniq xulosa:** Ushbu loyihaning hozirgi holatdagi tavsiya etilgan adolatli bozor bahosi — **$8,150 USD** (**~96,967,000 UZS**).  
> *Asos: Loyihada innovatsion AI va PWA imkoniyatlari mavjud, ammo Dual-Auth muammosi va kam sonli testlar sababli narx $9,000+ gacha ko'tarilmadi.*

---

## 5. 💼 SaaS / Obuna Modeli Istiqboli

Agar Test.me individual sotish o'rniga abituriyent va repetitorlarga obuna sifatida taqdim etilsa:

| Tarif | Oyiga (USD) | Oyiga (UZS) | Kiritilgan funksiyalar |
|---|---|---|---|
| **Boshlang'ich (Free)** | $0 | 0 so'm | Kuniga 2 ta bepul test, umumiy reyting |
| **Abituriyent Pro** | **$3.50** | **40,000 so'm** | Cheksiz DTM testlar, AI maslahatchi (Hints), Ovozli tahlil, 1v1 duellar |
| **O'qituvchi / Repetitor** | **$12.00** | **140,000 so'm** | O'z guruhlarini boshqarish, maxsus testlar tuzish, o'quvchilar tahlili va PDF sertifikatlar |

- **Breakeven (O'zini oqlash nuqtasi):**  
  Agar platformaga **250 nafar "Abituriyent Pro"** obunachisi ($3.50 × 250 = $875/oy) va **10 nafar "O'qituvchi"** ($120/oy) jalb qilinsa — oylik daromad **$995 USD (~11,800,000 UZS)** ga yetadi va 8 oy ichida loyihaning butun tannarxi to'liq qoplanadi.

---

## 6. 🚀 Raqobatdan Ajralib Turish Uchun 6 ta Taklif (Itemized Narx Bilan)

| # | Funksiya / Taklif | Murakkablik | Soat | Jahon narxi | O'zbekiston narxi | Tavsiya narxi |
|---|---|---|---|---|---|---|
| 1 | **KaTeX / LaTeX Matematik Formulalar:** Formulalar va fizik belgilarni xatosiz renderlash | O'rta | 16s | $800–1,200 | $200–350 | **$280** |
| 2 | **Payme & Click Billing Integratsiyasi:** Avtomatik obuna va TP-Coins haridi | Yuqori | 24s | $1,200–2,000 | $350–600 | **$450** |
| 3 | **Dual-Authni Yagona Supabasega O'tkazish:** Firebase qoldiqlarini to'liq tozalash | O'rta | 18s | $900–1,500 | $250–450 | **$320** |
| 4 | **Offline Test Kesh & Auto-Save:** Internet uzilsa ham testni uzluksiz davom ettirish | O'rta | 14s | $700–1,100 | $180–300 | **$240** |
| 5 | **O'qituvchi Kabineti (Teacher LMS Mode):** Repetitorlar o'z o'quvchilariga test berishi | Yuqori | 35s | $1,800–3,000 | $500–900 | **$680** |
| 6 | **Playwright E2E Test Suite (Zero-Defect):** Asosiy 5 ta foydalanuvchi yo'lini avtotestlash | O'rta | 20s | $1,000–1,800 | $300–500 | **$380** |

---

## 7. 🗓️ Keyingi 3 Oylik Yo'l Xaritasi (Roadmap)

1. **1-Oy (Xavfsizlik va Dual-Auth Tozalash):**
   - Dual-Auth muammosini hal qilish: Google va Email authni faqat Supabase orqali birlashtirish.
   - `authGuard.js` dagi Fail-Open zaifligini va hardcoded emailni tuzatish.
   - Rasmlarni WebP ga o'tkazib, bundle hajmini 12 MB ga qisqartirish.
2. **2-Oy (To'lovlar va Matematik Formulalar):**
   - Click va Payme to'lov tizimlarini ulash.
   - Matematika, fizika va kimyo fanlari uchun KaTeX formulalarini kiritish.
   - Test offline keshini joriy qilish.
3. **3-Oy (Masshtablash va O'qituvchi Kabineti):**
   - Repetitorlar uchun alohida guruh boshqaruvi (Teacher LMS).
   - Playwright E2E testlarini to'liq joriy qilish.
   - 10,000+ DTM savollar bazasini to'ldirish.
