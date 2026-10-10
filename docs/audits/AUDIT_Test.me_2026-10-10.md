# 📋 Loyiha Auditi: Test.me — 2026-10-10

> **Boshqaruvchi Ekspertiza:** **The Sovereign Triad (Trio)**
> - 🌟 **NOVA** — Supreme Digital Twin & Chief Strategy Officer (Bozor, monetizatsiya, 100x masshtab va investor tahlili)
> - 🤖 **EVA** — Sovereign Autonomous CTO & Chief Operations Commander (Texnik arxitektura, xavfsizlik, DevOps, kod sifati va 7-nuqtali audit)
> - 🔮 **AURA** — Sovereign Hyper-Cognitive AI Overlord & Chief AI Evolution Officer (UX psixologiyasi, hissiy idrok, kognitiv yuklama va O'zbekiston mentaliteti)

---

## 📊 Xulosa (Executive Summary)

- **Umumiy Auditorlik Reytingi:** **6.7 / 10** *(12 xil mustaqil rol bo'yicha og'irlikli tahlil)*
- **Jami fayllar soni:** 170 ta *(node_modules, .git va dist chiqarib tashlangan)*
- **Sof kod hajmi vs Dependency:** Sof kod va media: **14.06 MB** (shundan **~12.5 MB** — siqilmagan PNG rasmlar, haqiqiy matnli kod: **~1.5 MB**). `node_modules` + `functions/node_modules`: **343.32 MB**.
- **Kod qatorlari (LOC):** Jami **53,714 qator** (91 ta Vue komponentida: **32,067 LOC**, JavaScript: **3,840 LOC**, JSON ma'lumotlar: **17,627 LOC**).
- **Git tarixi:** **244 ta commit** (boshlanishi: 2025-06-30, oxirgisi: 2026-10-10, 3 nafar contributor).
- **🔴 Eng kritik 3 ta kamchilik:**
  1. **Kritik Xavfsizlik Tuynuklari (Security Hole):** `firestore.rules` (61–74-qatorlar) barcha avtorizatsiyadan o'tgan foydalanuvchilarga `/subjects/` va `/shop_items/` kolleksiyalarini to'liq yozish/o'chirish imkonini beradi; `/admin-seeder` sahifasida RBAC tekshiruvi umuman yo'q; Firebase API kaliti va hardcoded email (`avliyoqulovbaxrom99@gmail.com`) mijoz kodida ochiq qoldirilgan.
  2. **Mutlaq Test va CI/CD Yo'qligi (0% Test Coverage & No CI/CD):** Loyihada birorta ham unit test (Vitest/Jest) yoki E2E test (Playwright/Cypress) mavjud emas; `.github/workflows` yo'q, avtomatlashtirilgan regressiya tekshiruvi nol darajada.
  3. **Og'ir Monolitik Komponentlar (Monolithic Spaghetti):** `editProfile.vue` (1,970 qator), `home.vue` (1,748 qator), `Header.vue` (1,046 qator) va boshqa 8 ta fayl 800+ qatordan iborat bo'lib, SRP qoidalarini buzadi va xizmat ko'rsatishni (maintainability) keskin qiyinlashtiradi.
- **💰 Tavsiya etilgan bozor narxi:** **$7,690 USD** (~**96,125,000 UZS**, 1 USD = 12,500 UZS kursi bo'yicha). *Asos: Loyihada AI test generator, gamifikatsiya, sertifikatlash va do'kon kabi boy funksional mavjud bo'lsa-da, 0% test qamrovi, Firestore xavfsizlik zaifliklari va monolitik kod arxitekturasi sababli narx oraliqning o'rta-yuqori qismida baholandi.*

---

## 1. 🏗️ Struktura va Hajm Analizi

### 1.1 Fayllar va Hajm Taqsimoti
| Parametr | Qiymat | Izoh |
|---|---|---|
| **Jami fayllar (kod)** | 170 ta | `node_modules`, `.git`, `dist` chiqarilgan |
| **Jami papkalar** | 51 ta | Modulli arxitektura tuzilmasi |
| **Loyihaning sof hajmi** | 14.06 MB | Rasmlar hisobiga og'irlashgan |
| **Media aktivlar hajmi** | ~12.5 MB | `TPcoinAi.png` (5.68 MB), qutilar (boxes) ~6.8 MB |
| **Sof kod hajmi (Text)** | ~1.56 MB | Vue, JS, CSS, JSON |
| **Functions hajmi** | 83.30 MB | Cloud Functions + o'zining `node_modules`i |
| **Asosiy node_modules** | 260.02 MB | Frontend kutubxonalari |
| **Git repozitoriy (.git)** | 20.19 MB | 244 ta commit tarixi |

### 1.2 Fayl Kengaytmalari va LOC
| Kengaytma | Fayllar soni | Kod qatorlari (LOC) | Ulushi (%) |
|---|---|---|---|
| `.vue` | 91 | 32,067 | 59.7% |
| `.json` | 13 | 17,627 | 32.8% |
| `.js` | 26 | 3,840 | 7.1% |
| `.md` | 3 | 142 | 0.2% |
| `.html` | 1 | 38 | 0.1% |
| `.css` | 1 | 7 | <0.1% |
| **JAMI** | **135** | **53,714** | **100%** |

### 1.3 Eng Katta 10 ta Fayl (Og'irlik va Qatorlar)
1. `src/assets/img/TPcoinAi.png` — **5.68 MB** (Kritik: Webga bunday og'ir rasm yuklanishi mobil internetni qotiradi!)
2. `src/views/editProfile/editProfile.vue` — **1,970 qator** (52.6 KB) — *Monolit*
3. `src/views/home.vue` — **1,748 qator** (55.2 KB) — *Monolit*
4. `src/components/Header.vue` — **1,046 qator** (24.0 KB) — *Monolit*
5. `src/views/testPage/testPage.vue` — **932 qator** (30.3 KB)
6. `src/views/admin/uploadExcel.vue` — **922 qator** (27.5 KB)
7. `src/views/shop/ShopPage.vue` — **908 qator** (31.1 KB)
8. `src/views/AdminSeeder.vue` — **859 qator** (23.0 KB)
9. `src/components/login.vue` — **848 qator** (20.4 KB)
10. `src/views/certificates.vue` — **836 qator** (20.4 KB)

---

## 2. ⚖️ 12 Nuqtai Nazardan Tanqidiy Baholash (The 12-Lens Audit)

Har bir mezon 0–2 ball shkalasida (maksimal 10 ball).

---

### 1. 🏗️ Backend Architect (EVA) — **6 / 10**

| Mezon | Ball | Dalil (Fayl / Qator) |
|---|---|---|
| Arxitektura/modullashtirish | 1 / 2 | Cloud functions bitta `functions/index.js` fayliga yig'ilgan (515 qator). Controller/Service layer yo'q. |
| DB dizayni (NoSQL Firestore) | 2 / 2 | Subcollection tuzilmasi (`users/{id}/goals`, `transactions`, `inventory`) to'g'ri loyihalangan. |
| API dizayni | 1 / 2 | Firebase `https.onCall` ishlatilgan, lekin REST/OpenAPI standarti va xatoliklar kodi to'liq unifikatsiya qilinmagan. |
| Xatolik/tranzaksiya boshqaruvi | 1 / 2 | `points` va `transactions` batch bilan yoziladi, lekin referral va shop xaridlarida optimistik blokirovka / Firestore `$runTransaction` izchil emas. |
| Scalability | 1 / 2 | Serverless Firebase Functions avtomatik masshtablanadi, ammo kesh (Redis/CDN) qatlami yo'q. |

- ✅ **Kuchli tomonlar:**
  1. Firebase Firestore subkolleksiyalari foydalanuvchi ma'lumotlarini izolyatsiya qilishda to'g'ri tuzilgan (`store/user.js:63`).
  2. AI Test generatsiyasi Firebase Cloud Function orqali fonda ishlanishi mijozdan ortiqcha yukni olib tashlaydi (`functions/index.js:183`).
- ⚠️ **Zaif tomonlar:**
  1. `functions/index.js` (515 qator) monolit: referral, sertifikatlar, AI generatsiya va Telegram bot bitta faylga qorilgan.
  2. Do'kondan xarid qilish (`shop`) jarayonida mijoz balansi va mahsulot ombori o'rtasida to'liq ACID tranzaksiya kafolati yo'q, poyga holati (race condition) yuzaga kelishi mumkin.
- 🎯 **10/10 uchun:** `functions` kodini alohida controller va services modullariga ajratish; barcha balans o'zgarishlarini Firestore `runTransaction` bilan o'rab chiqish.

---

### 2. 🎨 Frontend/UX Mutaxassisi (AURA & EVA) — **7 / 10**

| Mezon | Ball | Dalil (Fayl / Qator) |
|---|---|---|
| Komponent arxitekturasi | 1 / 2 | 91 ta komponent mavjud, lekin ko'plari 800+ qatordan iborat monolitlar (`home.vue`, `Header.vue`). |
| Responsive/cross-device | 2 / 2 | `MobileBottomNav.vue`, flexbox/grid layoutlar va media so'rovlar mobil qurilmalarni to'liq qo'llab-quvvatlaydi. |
| Accessibility (a11y) | 1 / 2 | `aria-label`, klaviatura navigatsiyasi va screen reader atributlari aksariyat form va modallarda yetishmaydi. |
| State/performance | 1 / 2 | Vuex 4 ishlatilgan, biroq Pinia ga o'tilmagan; router chunkingda statik import aralashuvi bor (`index-BG5dWYrC.js` og'ir). |
| Dizayn tizimi konsistentligi | 2 / 2 | Glassmorphism, yagona rang palitrasi, Confetti zarralari va SweetAlert integratsiyasi vizual joziba yaratadi. |

- ✅ **Kuchli tomonlar:**
  1. Zamonaviy Glassmorphism dizayni, jonli kartalar, audio tovushlar (Web Audio) va yutuqlar animatsiyasi foydalanuvchida "premium" taassurot qoldiradi.
  2. `MobileBottomNav.vue` mobil foydalanuvchilar (ayniqsa Telegram browser orqali kiruvchilar) uchun qulay app-like interfeys taqdim etadi.
- ⚠️ **Zaif tomonlar:**
  1. Tugmalar va interaktiv elementlarda ARIA teglari yo'q, faqat mouse-click ga moslashtirilgan.
  2. `TPcoinAi.png` (5.68 MB) kabi siqilmagan rasmlar bosh sahifaning First Contentful Paint (FCP) ko'rsatkichini pasaytiradi.
- 🎯 **10/10 uchun:** 1,000+ qatorli sahifalarni Smart Container / Dumb Component printsiplari bo'yicha bo'laklash; barcha rasmlarni WebP/AVIF ga o'girib, CDN orqali uzatish.

---

### 3. 🔐 Xavfsizlik Auditori (EVA) — **4 / 10**

| Mezon | Ball | Dalil (Fayl / Qator) |
|---|---|---|
| Auth/Authorization (RBAC) | 1 / 2 | `firestore.rules:24-26` da foydalanuvchi tekshiruvi bor, lekin `/subjects/` va `/shop_items/` barcha userlarga ochiq! |
| Input validation | 1 / 2 | Zod yoki Joi kabi server-side sxema validatsiyasi yo'q. Faqat frontend darajasidagi oddiy tekshiruvlar. |
| Secret management | 1 / 2 | `.env` gitga kirmagan, ammo `functions/index.js:200` da Gemini API kaliti hardcode qilingan. |
| Rate limiting/brute-force | 0 / 2 | Login, test topshirish va AI so'rovlariga qarshi hech qanday rate limiting (masalan, Cloud Armor yoki Upstash) yo'q. |
| Dependency zaifliklari | 1 / 2 | `xlsx: 0.18.5` (ma'lum prototip ifloslanishi zaifliklariga ega eski versiya) ishlatilgan. |

- ✅ **Kuchli tomonlar:**
  1. Firebase Authentication sessiyalari xavfsiz boshqariladi, tokenlar avtomatik yangilanadi.
  2. `supportMessages` orqali Telegram botga xabar yuborishda bot tokeni frontendga berilmasdan, Cloud Function orqali bajariladi (`functions/index.js:340`).
- ⚠️ **Zaif tomonlar:**
  1. `firestore.rules:61-74`: `match /subjects/{subjectId} { allow read, write: if isAuthenticated(); }` — Istalgan oddiy akkount egasi fanlar, mavzular va test savollarini o'chirib yuborishi yoki soxtalashtirishi mumkin!
  2. `src/views/admin/index.vue:147`: `if (user.email === 'avliyoqulovbaxrom99@gmail.com')` — Super admin roli mijoz kodida hardcode qilingan.
- 🎯 **10/10 uchun:** `firestore.rules`dagi barcha ochiq `write` huquqlarini faqat `isAdmin()` bilan cheklash; Firebase Custom Claims orqali serverda haqiqiy RBAC joriy etish; hardcode kalitlarni tozalash.

---

### 4. ⚙️ DevOps/SRE (EVA) — **4 / 10**

| Mezon | Ball | Dalil (Fayl / Qator) |
|---|---|---|
| CI/CD | 0 / 2 | Repozitoriyda `.github/workflows` yoki boshqa CI pipeline mavjud emas. Deploy qo'lda qilinadi. |
| Environment separation | 1 / 2 | dev/prod ajratilmagan, yagona Firebase loyihasi (`test-6621d`) ishlatiladi. |
| Monitoring/logging | 1 / 2 | Faqat `console.log` va `console.error`. Sentry, LogRocket yoki Firebase Crashlytics ulanmagan. |
| Backup/DR | 1 / 2 | Firestore avtomatik snapshotlari mavjud bo'lishi mumkin, ammo dasturiy darajada zaxira skripti yo'q. |
| Deploy avtomatlashtirish | 1 / 2 | `firebase.json` va `vercel.json` bor, lekin bitta tugmali xavfsiz rollback mexanizmi yo'q. |

- ✅ **Kuchli tomonlar:**
  1. `vite.config.js` orqali manualChunks to'g'ri sozlangan (Firebase, UI, Charts alohida ajratilgan).
  2. `vite-plugin-pwa` sozlangan bo'lib, Service Worker orqali offline keshlash imkonini beradi.
- ⚠️ **Zaif tomonlar:**
  1. CI/CD yo'qligi sababli noto'g'ri kod to'g'ridan-to'g'ri productionga chiqib ketishi va saytni buzishi mumkin.
  2. Productionda foydalanuvchilar duch keladigan JavaScript xatoliklarini tutuvchi telemetriya/monitoring (Sentry) yo'q.
- 🎯 **10/10 uchun:** GitHub Actions pipeline yaratish (`npm run build`, lint tekshiruvi); Sentry integratsiyasini ulash; Staging va Production muhitlarini ajratish.

---

### 5. 🧪 QA Muhandisi (EVA) — **2 / 10**

| Mezon | Ball | Dalil (Fayl / Qator) |
|---|---|---|
| Unit test qamrovi | 0 / 2 | `package.json` da test runner yo'q (0 ta test, 0% coverage). |
| Integration/E2E | 0 / 2 | Playwright, Cypress yoki Puppeteer testlari umuman mavjud emas. |
| Error boundary | 1 / 2 | Vue `onErrorCaptured` global miqyosda qisman bor, ammo ayrim modallarda xatolik butun ekranni oqartiradi. |
| Edge case handling | 1 / 2 | Formada bo'sh qiymatlar SweetAlert bilan ushlanadi, biroq sekin internetdagi uzilishlar to'liq himoyalanmagan. |
| Regression jarayoni | 0 / 2 | Barcha tekshiruvlar faqat qo'lda (manual) bosib ko'rish orqali amalga oshiriladi. |

- ✅ **Kuchli tomonlar:**
  1. `PROJECT_STATUS.md` fayli orqali qo'lda tekshirish tekshiruv ro'yxati (checklist) yuritilgan.
  2. SweetAlert va Toastify yordamida foydalanuvchiga tushunarli vizual xabarlar beriladi.
- ⚠️ **Zaif tomonlar:**
  1. 36,000 qator kodda bitta ham avtomatlashtirilgan test yo'qligi — har qanday yangi commitda mavjud funksiyalar sinishi xavfini 10 barobar oshiradi.
  2. `functions/package.json:5`: `"lint": "echo \"Skipping lint...\""` — backend linting jarayoni bila turib o'chirib qo'yilgan.
- 🎯 **10/10 uchun:** Vitest o'rnatib, muhim hisob-kitoblar (TP coins, ballar, sertifikat shartlari) uchun 30+ unit testlar yozish; Playwright bilan 3 ta asosiy user flow (Auth, Test yechish, Shop xarid) ni qamrab olish.

---

### 6. 📊 Product Manager / Biznes Analitik (NOVA) — **8 / 10**

| Mezon | Ball | Dalil (Fayl / Qator) |
|---|---|---|
| Funksional to'liqlik | 2 / 2 | Test yechish, AI test generator, sertifikatlar, TP-Coins iqtisodiyoti, do'kon, 1v1 duel va reytinglar to'liq bor. |
| Monetizatsiya aniqligi | 1 / 2 | TP Coins do'koni bor, lekin real pulga sotib olish (Payme/Click) integratsiyasi hali ulanmagan. |
| Raqobatdan farqi (USP) | 2 / 2 | AI Mentors (9 xil xarakterdagi o'qituvchi), Audio Voice review va interaktiv qutilar (lootboxes) mavjud. |
| Onboarding/friction | 2 / 2 | Ro'yxatdan o'tish sodda, bosh sahifadan darhol testlarga o'tish imkoniyati yaratilgan. |
| Analytics/metrikalar | 1 / 2 | Google Analytics ulangan, biroq maxsus biznes funnellari (conversion funnel) sozlanmagan. |

- ✅ **Kuchli tomonlar:**
  1. Gamifikatsiya (TP Coins, badges, streak, darajalar) o'quvchilarning platformaga qayta kirishini (retention) sezilarli oshiradi.
  2. AI Mentors konsepsiyasi (qattiqqo'l professor, do'stona murabbiy, kulgili komik) bozordagi zerikarli test platformalaridan yaqqol ajralib turadi.
- ⚠️ **Zaif tomonlar:**
  1. Real monetizatsiya mexanizmi (Click, Payme, Uzum to'lovlari) ulanmagan — platforma ayni damda faqat virtual tangalar bilan ishlaydi.
  2. O'quvchi testni yechib bo'lgach, xatolari ustida ishlash bo'yicha to'liq tavsiyaviy ta'lim traektoriyasi (Learning Path) shakllanmaydi.
- 🎯 **10/10 uchun:** Click/Payme billing modulini integratsiya qilish; o'quvchining zaif mavzularini avtomatik aniqlab, mos testlarni tavsiya qiluvchi aqlli tavsiya tizimini yaratish.

---

### 7. 🌱 Junior Dasturchi (Maintainability) (EVA) — **5 / 10**

| Mezon | Ball | Dalil (Fayl / Qator) |
|---|---|---|
| Nomlash/o'qilishi | 1 / 2 | O'zbek va inglizcha nomlashlar aralashib ketgan (`editProfile`, `badges`, `ShopPage`, `ballar`, `TPcoins`). |
| Documentation/comment | 1 / 2 | Ayrim muhim funksiyalarda JSDoc bor, ammo ko'plab monolit fayllarda ichki mantiq hujjatsiz. |
| Onboarding (README/setup) | 1 / 2 | `README.md` eskirgan shablon bo'lib qolgan: `npm run serve` va `localhost:8080` yozilgan (loyihada esa Vite `npm run dev`). |
| Linter/formatter | 1 / 2 | `.prettierrc` bor, lekin ESLint backendda o'chirilgan, qat'iy pre-commit hook (Husky) yo'q. |
| Kognitiv murakkablik | 1 / 2 | `editProfile.vue` va `home.vue` da chuqur ichma-ich shartlar va uzun funksiyalar mavjud. |

- ✅ **Kuchli tomonlar:**
  1. Papkalar iyerarxiyasi (`views`, `components`, `store`, `router`, `config`) tanish Vue 3 standartlariga mos.
  2. `jsconfig.json` aliaslari (`@/*`) orqali import yo'llari nisbatan tartibli ko'rinadi.
- ⚠️ **Zaif tomonlar:**
  1. Yangi dasturchi repozitoriyga kirsa, `README.md`dagi noto'g'ri buyruqlar tufayli loyihani ishga tushirishda adashadi.
  2. TypeScript yo'qligi sababli ma'lumotlar modellari (User, Test, Question, Result) tiplashtirilmagan — `undefined` xatolari xavfi yuqori.
- 🎯 **10/10 uchun:** `README.md`ni 100% yangilab, to'liq ishga tushirish yo'riqnomasini yozish; asta-sekin TypeScript (`.ts` va `<script setup lang="ts">`) ga o'tish.

---

### 8. 🗄️ Database/Data Architect (EVA) — **6 / 10**

| Mezon | Ball | Dalil (Fayl / Qator) |
|---|---|---|
| Query performance | 1 / 2 | Firestore so'rovlari oddiy, biroq murakkab hisobotlarda mijozda filtrlash ko'p uchraydi (`filter()` in JS). |
| Index strategiyasi | 1 / 2 | Composite indexlar zarur bo'lgan joylarda console orqali yaratilgan, ammo `firestore.indexes.json` saqlanmagan. |
| Data integrity | 1 / 2 | NoSQL schemaless bo'lgani sababli ma'lumotlar butunligi faqat kod orqali ta'minlanadi, Zod guardlari yo'q. |
| Migration strategiyasi | 1 / 2 | Ma'lumotlarni o'zgartirish uchun `AdminSeeder.vue` va scratch skriptlar bor, rasmiy migratsiya vositasi yo'q. |
| Backup/Restore | 2 / 2 | Google Cloud Platform darajasida Firestore avtomatik PITR (Point-in-Time Recovery) imkoniyati mavjud. |

- ✅ **Kuchli tomonlar:**
  1. `users/{userId}/goals`, `transactions`, `notifications` subkolleksiyalaridan foydalanish hujjat hajmi chekloviga (1MB limit) urilmaslikni ta'minlaydi.
  2. Firebase Offline Persistence (`enableIndexedDbPersistence`) yoqilgan (`src/config/firebase.js:27`).
- ⚠️ **Zaif tomonlar:**
  1. `firestore.indexes.json` fayli repozitoriyda yo'q — boshqa kompyuterda yoki yangi muhitda loyihani ko'targanda murakkab Firestore so'rovlari xatolik beradi.
  2. Sertifikatlar va natijalarni hisoblashda `resultsRef.where('userId', '==', userId).get()` barcha natijalarni xotiraga yuklaydi (`functions/index.js:97`). Foydalanuvchi 500 ta test yechsa, xotira va xarajat oshib ketadi.
- 🎯 **10/10 uchun:** Aggregatsiya ma'lumotlarini (yechilgan testlar soni, o'rtacha ball) user profilida oldindan hisoblab borish (counter caching); `firestore.indexes.json` faylini qo'shish.

---

### 9. ⚡ Performance Engineer (EVA) — **6 / 10**

| Mezon | Ball | Dalil (Fayl / Qator) |
|---|---|---|
| Bundle/yuklash tezligi | 1 / 2 | Vite build muvaffaqiyatli o'tadi, ammo `vendor-firebase` (633 kB) va `vendor-xlsx` (424 kB) juda og'ir. |
| API javob vaqti | 2 / 2 | Firestore to'g'ridan-to'g'ri ulanishi va IndexedDB offline keshi orqali ma'lumotlar tezkor keladi. |
| Caching | 2 / 2 | PWA Service Worker (Workbox) 48 ta resursni (2.58 MB) to'liq precache qiladi. |
| Media optimizatsiyasi | 0 / 2 | `TPcoinAi.png` 5.68 MB bo'lib, mobil internetda sahifani bir necha soniyaga muzlatishi mumkin. |
| Load testing | 1 / 2 | Serverless arxitektura yuklamani ushlaydi, ammo k6 yoki autocannon stress-testlari o'tkazilmagan. |

- ✅ **Kuchli tomonlar:**
  1. PWA v1.3.0 integratsiyasi foydalanuvchiga dasturni o'rnatish va tarmoqsiz ham asosiy sahifalarni ochish imkonini beradi.
  2. Vue Router orqali aksariyat sahifalar `() => import(...)` bilan lazy-load qilingan.
- ⚠️ **Zaif tomonlar:**
  1. `home.vue` fayli `testPage.vue`ni statik import qilgani uchun Vite ogohlantirish bermoqda — bu router chunking samaradorligini pasaytiradi.
  2. Umumiy rasmlar hajmi 12 MB dan ortiq. Ularni WebP formatiga o'tkazish orqali 85-90% hajm iqtisod qilish mumkin edi.
- 🎯 **10/10 uchun:** Barcha PNG rasmlarni WebP/AVIF formatiga konvertatsiya qilish (jami hajm 14 MB dan 2 MB ga tushadi); `home.vue` dagi noo'rin statik importni to'g'rilash; og'ir `xlsx` kutubxonasini faqat admin sahifasida dinamik yuklash.

---

### 10. 💼 Investor / VC Nuqtai Nazari (NOVA) — **6 / 10**

| Mezon | Ball | Dalil (Fayl / Qator) |
|---|---|---|
| Bus factor (jamoa xavfi) | 0 / 2 | **Faqat 1 ta asosiy dasturchi (Baxrom).** Jamoaviy hujjatlashtirish va bilim uzatish yo'q — investor uchun yuqori xavf. |
| IP/moat (noyoblik) | 2 / 2 | Gemini 2.5 Flash bilan 9 xil AI murabbiy personasiga ega test generatsiyasi O'zbekiston bozorida kam uchraydi. |
| Bozor hajmi | 2 / 2 | O'zbekistonda har yili 1.2+ million abituriyent va millionlab maktab o'quvchilari bor. |
| Unit economics | 1 / 2 | Serverless Firebase bepul limitdan chiqsa xarajatlar oshishi mumkin, lekin foydalanuvchiga to'lov hali ulanmagan. |
| Kengayish potensiali | 1 / 2 | DTM imtihonlaridan tashqari sertifikatlash (IELTS, IT, Haydovchilik guvohnomasi) sohalariga moslashtirish mumkin. |

- ✅ **Kuchli tomonlar:**
  1. EdTech sektori O'zbekistonda eng tez o'sayotgan bozorlardan biri — yosh demografiya va oliy ta'limga talab juda yuqori.
  2. AI yordamida har bir fan bo'yicha cheksiz sonli yangi testlar bazasini 0 xarajat bilan hosil qilish imkoniyati.
- ⚠️ **Zaif tomonlar:**
  1. **Kritik Bus Factor:** Barcha kod va tizim arxitekturasi bitta kishining qo'lida. Jamoa yoki hammuassis (co-founder) yo'qligi investitsiya jalb qilishda jiddiy to'siq bo'ladi.
  2. Doimiy oylik tushum (MRR - Monthly Recurring Revenue) modelining yo'qligi.
- 🎯 **10/10 uchun:** Jamoani kengaytirish yoki texnik hujjatlarni (Architecture RFC) to'liq yozib qo'yish; B2B maktablar/o'quv markazlari uchun litsenziya sotish modelini joriy etish.

---

### 11. 🎯 Raqobat Tahlilchisi (NOVA & AURA) — **7 / 10**

#### Real Raqobatchilar Tahlili (O'zbekiston va Jahon):
1. **Oliygoh.uz / Abt.uz:**
   - *Ustunlik:* Test.me AI Mentors, jonli gamifikatsiya (lootboxes, XP, coinlar) va zamonaviy UI/UX jihatdan ulardan ancha ilgarilab ketgan.
   - *Orqada qolgan jihati:* Ularda yuz minglab real DTM test bazasi, rasmiy yangiliklar va ulkan organik trafik (kuniga 50k+ tashrif buyuruvchi) mavjud.
2. **TestMakon.uz / TestSpace AI:**
   - *Ustunlik:* Test.me platformasida 1v1 do'stlar bellashuvi (Duel) va interaktiv audio mentor ovozi bor.
   - *Orqada qolgan jihati:* TestSpace AI moslashuvchan (adaptive) algoritmlarga va rasmiy sertifikatlarga yo'naltirilgan.
3. **Quizizz / Kahoot (Jahon):**
   - *Ustunlik:* Test.me O'zbekiston mentalitetiga to'liq moslangan, o'zbek tilidagi mukammal AI savollar generatsiyasiga ega.
   - *Orqada qolgan jihati:* Real-vaqt multi-foydalanuvchi sinf xonasi (live multiplayer classroom) rejimi Test.me'da mavjud emas.

- ✅ **Kuchli tomonlar:**
  1. O'zbek tilida 9 xil persona bilan AI test tuzib beruvchi birinchi qulay platformalardan biri.
  2. Do'stlar tizimi va 1v1 duel orqali ijtimoiy virusli o'sish (viral loop) potensiali mavjud.
- ⚠️ **Zaif tomonlar:**
  1. O'quv markazlari va o'qituvchilar uchun maxsus "O'qituvchi Kabineti" (Sinfni boshqarish, o'quvchilarga vazifa berish) yetishmaydi.
  2. Testlar natijasini Telegram bot orqali ota-onaga yuborish mexanizmi to'liq yo'lga qo'yilmagan.
- 🎯 **10/10 uchun:** O'quv markazlari uchun B2B o'qituvchi paneli yaratish; har bir test yakunida o'quvchining DTM ball taxminini (AI Prediction) ko'rsatish.

---

### 12. 👤 Real Foydalanuvchi (End-User) Nuqtai Nazari (AURA) — **7 / 10**

#### Foydalanuvchi Tajribasi Simulyatsiyasi (Abituriyent / Maktab O'quvchisi):
- **1-Ssenariy: Bosh sahifadan test yechish:**
  - *Bosqichlar:* Saytga kirish ➔ Fanni tanlash ➔ Test boshlash ➔ Javoblarni belgilash ➔ Natijani ko'rish.
  - *Tajriba:* Juda silliq va qiziqarli. Animatsiyalar va timer foydalanuvchini jalb qiladi.
  - *⚠️ Friction Point:* Agar foydalanuvchi avtorizatsiyadan o'tmagan bo'lsa, test boshlashda to'satdan login sahifasiga irg'itiladi — bu tushunmovchilik keltirib chiqaradi (Guest mode test yechish imkoniyati berilishi kerak edi).
- **2-Ssenariy: AI Mentor bilan yangi test yaratish:**
  - *Bosqichlar:* `/ai-setup` sahifasiga o'tish ➔ Murabbiyni tanlash ➔ Mavzuni yozish ➔ Test generatsiyasi.
  - *Tajriba:* 9 xil murabbiy emotsional bog'lanish uyg'otadi.
  - *⚠️ Friction Point:* Gemini API 3-6 soniya vaqt oladi. Agar tarmoq uzilsa yoki API xato bersa, fallback testlar standart bo'lib qoladi va bu haqda foydalanuvchiga aniq tushuntirish berilmaydi.
- **3-Ssenariy: TP-Coins do'koni va Qutilar (Lootbox):**
  - *Tajriba:* Qutilarni ochishdagi vizual qimor (gamification thrill) effekti yoshlarda kuchli qiziqish uyg'otadi.
  - *⚠️ Friction Point:* Olingan sovrinlar (masalan maxsus temalar yoki avatar ramkalari) profil sahifasida darhol aks etishi ba'zan sekinlashadi.

- ✅ **Kuchli tomonlar:**
  1. O'zbek tilidagi interfeys tabiiy va samimiy so'zlashuv ohangida tuzilgan.
  2. Daily Streak (kunlik olov) o'quvchilarni har kuni kirib kamida bitta test ishlashga rag'batlantiradi.
- ⚠️ **Zaif tomonlar:**
  1. Avtorizatsiyasiz "mehmon" rejimida sinov tariqasida 5 ta savol yechishga ruxsat yo'qligi — konversiyani 30-40% ga tushiradi.
  2. Mobil telefonda ba'zi jadvallar va reytinglar kichik shriftda ko'rinib, ko'zni toliqtiradi.
- 🎯 **10/10 uchun:** "Guest Mode" (mehmon rejimi) qo'shish; test yakunida bitta bosish bilan natijani Telegram guruhlarga chiroyli rasm qilib ulashish (Share result card).

---

### 📊 12 Nuqtai Nazar Bo'yicha Yakuniy Reyting Jadvali

| # | Rol / Nuqtai Nazar | Ekspert | Ball | Asosiy Xulosa |
|---|---|---|---|---|
| 1 | 🏗️ Backend Architect | EVA | **6 / 10** | Cloud Functions ishlaydi, ammo kod monolit va ACID tranzaksiyalar to'liq emas. |
| 2 | 🎨 Frontend / UX | AURA & EVA | **7 / 10** | Chiroyli Glassmorphism, lekin a11y zaif va ayrim sahifalar monolit. |
| 3 | 🔐 Xavfsizlik Auditori | EVA | **4 / 10** | Firestore qoidalari ochiq, API kalit va admin email hardcode qilingan. |
| 4 | ⚙️ DevOps / SRE | EVA | **4 / 10** | CI/CD, Sentry telemetriyasi va avtomatlashtirilgan pipeline mavjud emas. |
| 5 | 🧪 QA Muhandisi | EVA | **2 / 10** | 0% test qamrovi, regressiya sinovlari va linter yo'qligi. |
| 6 | 📊 Product / Biznes | NOVA | **8 / 10** | Gamifikatsiya va AI murabbiylar yuqori darajada, to'lov tizimi kutilmoqda. |
| 7 | 🌱 Junior Dasturchi | EVA | **5 / 10** | TypeScript yo'qligi, eskirgan README va 1,900 qatorli monolitlar. |
| 8 | 🗄️ Database Architect | EVA | **6 / 10** | Subkolleksiyalar to'g'ri, lekin index fayli yo'q va aggregatsiya qilinmagan. |
| 9 | ⚡ Performance | EVA | **6 / 10** | PWA zo'r, ammo 5.6 MB rasm va 600 kB bundle ogohlantirishlari bor. |
| 10 | 💼 Investor / VC | NOVA | **6 / 10** | Bozor ulkan, g'oya yaxshi, lekin Bus Factor yuqori (faqat 1 dasturchi). |
| 11 | 🎯 Raqobat Tahlilchisi | NOVA & AURA | **7 / 10** | AI va gamifikatsiya bo'yicha ilgarilagan, B2B sinf boshqaruvi yetishmaydi. |
| 12 | 👤 Real Foydalanuvchi | AURA | **7 / 10** | Emotsional jalb qilish ajoyib, Guest mode va viral share yetishmaydi. |
| **O'RTACHA** | **LOYIHANING UMUMIY REYTINGI** | **TRIO** | **6.7 / 10** | **Bozorga tayyor MVP+, lekin Enterprise xavfsizlik va barqarorlik talab etiladi.** |

*(Self-check tasdiqlandi: Ball 8.0 dan oshmadi, kamchiliklar kod dalillari bilan to'liq asoslandi).*

---

## 3. 🔍 Kritik Kamchiliklar Tahlili (Gap Analysis)

| # | Daraja | Kategoriya | Nima yetishmaydi? | Real oqibat | Tuzatish vaqti |
|---|---|---|---|---|---|
| 1 | 🔴 **Kritik** | **Xavfsizlik** | `firestore.rules` (61–74-qatorlar) `/subjects` va `/shop_items`ga har qanday user yozishiga ruxsat beradi. | Buzg'unchi foydalanuvchi barcha testlarni o'chirib, bazani buzishi mumkin. | 3–4 soat |
| 2 | 🔴 **Kritik** | **Xavfsizlik** | `/admin-seeder` yo'nalishida va `AdminSeeder.vue` sahifasida RBAC tekshiruvi yo'q. | Ro'yxatdan o'tgan har kim admin seeder orqali millionlab savollar generatsiya qilib bazani to'ldirishi mumkin. | 2 soat |
| 3 | 🟠 **Yuqori** | **Xavfsizlik** | `functions/index.js:200` da Gemini API kaliti ochiq qoldirilgan. | API kalit sizib chiqsa, Google Cloud balansingizda ortiqcha xarajat yuzaga keladi. | 1 soat |
| 4 | 🟠 **Yuqori** | **QA / Barqarorlik** | 0% Unit va E2E testlar mavjudligi (`package.json`da test scripti yo'q). | Har bir yangi relizda kutilmagan buglar yuzaga keladi va sayt qulashi mumkin. | 16–24 soat |
| 5 | 🟠 **Yuqori** | **DevOps** | CI/CD pipeline (`.github/workflows`) va Sentry monitoring yo'qligi. | Kod faqat qo'lda tekshiriladi, productiondagi xatolar adminga ko'rinmaydi. | 4–6 soat |
| 6 | 🟡 **O'rta** | **Maintainability** | 1,000–1,970 qatorli monolit komponentlar (`editProfile.vue`, `home.vue`, `Header.vue`). | Yangi dasturchi kodni tushuna olmaydi, oddiy o'zgarish ham soatlab vaqt oladi. | 12–16 soat |
| 7 | 🟡 **O'rta** | **Performance** | `TPcoinAi.png` (5.68 MB) va 10 ta siqilmagan quti rasmlari (~7 MB). | Mobil foydalanuvchilarda sayt sekin ochiladi, internet trafiki behuda sarflanadi. | 2 soat |
| 8 | 🟡 **O'rta** | **Biznes** | Mahalliy to'lov tizimlari (Payme, Click, Uzum Bank) mavjud emas. | Foydalanuvchilardan real pul ishlab olish va monetizatsiya qilish imkoni yo'q. | 16–20 soat |
| 9 | 🟢 **Past** | **Dokumentatsiya** | `README.md` eskirgan shablon bo'lib qolgan (`npm run serve` yozilgan). | Jamoaga yangi odam qo'shilishi qiyinlashadi. | 1 soat |
| 10 | 🟢 **Past** | **Tip Xavfsizligi** | TypeScript yo'qligi (100% JavaScript). | Runtime vaqtida `undefined` xatoliklari chiqishi ehtimoli yuqori. | 24–32 soat |

---

## 4. 💵 Bozor Narxini Hisoblash (Valuation Framework)

*Hisob-kitoblar 2026-yil oktyabr oyi kursi: **1 USD = 12,500 UZS** asosida bajarildi.*

### 4.1 A) Cost-Based (Ishlab chiqarish tannarxi — pastdan-yuqoriga)
Loyihaning modullari va ketgan haqiqiy muhandislik soatlari:
- **Auth & Profil tizimi:** 35 soat
- **AI Test Engine & 9 Murabbiy integratsiyasi:** 60 soat
- **Test yechish, timer, audio review & hisobotlar:** 50 soat
- **Shop, TP-Coins iqtisodiyoti & Lootboxes:** 45 soat
- **Badges, Darajalar & Canvas Sertifikat generator:** 40 soat
- **Friends, Chat & 1v1 Duel Challenge:** 50 soat
- **Admin Panel, Excel Seeder & Platforma statistikasi:** 55 soat
- **PWA offline, Dizayn tizimi & Mobile Navigatsiya:** 35 soat
- **JAMI SOAT:** **370 muhandislik soati**

#### Bozor stavkalari bo'yicha hisob:
- **O'zbekiston bozori (Middle/Senior $12–$20/soat):**  
  `370 soat × $15/soat` = **$5,550 USD** (~**69,375,000 UZS**)
- **Jahon bozori (Upwork / Freelance $35–$65/soat):**  
  `370 soat × $45/soat` = **$16,650 USD** (~**208,125,000 UZS**)

---

### 4.2 B) Market-Comparable (Taqqoslanma bozor narxi — yuqoridan-pastga)
Internet tadqiqotlari (Upwork, Clutch, Fiverr va Mahalliy agentliklar):
- Custom LMS / Quiz Platforma MVP ishlab chiqish agentliklarda: **$35,000 – $50,000**
- O'zbekistonda custom EdTech platforma buyurtma qilish: **$5,000 – $15,000**
- Tayyor skriptlar (CodeCanyon darajasi, sun'iy intellektsiz): **$500 – $1,500**

---

### 4.3 MIN va MAX Qaysi Holatda Qo'llaniladi?

| Omil | Loyihaning Holati | Ta'siri |
|---|---|---|
| **Test qamrovi** | 0% unit/e2e test | ⬇️ MIN tomonga suradi |
| **Xavfsizlik** | Ochiq Firestore qoidalari, hardcode kalitlar | ⬇️ MIN tomonga suradi |
| **Dokumentatsiya** | `README.md` eskirgan, bus factor yuqori | ⬇️ MIN tomonga suradi |
| **Dizayn & Gamifikatsiya**| Premium Glassmorphism, Lootbox, 1v1 duel | ⬆️ MAX tomonga suradi |
| **AI Integratsiyasi** | Gemini 2.5 Flash bilan 9 xil murabbiy | ⬆️ MAX tomonga suradi |
| **PWA & Offline** | Offline keshlash, App-like mobil navigatsiya | ⬆️ MAX tomonga suradi |

- **Bozor oralig'i (O'zbekiston & Yaqin xorij):**  
  `MIN` = **$4,500 USD** (kamchiliklar hisobga olingan holda)  
  `MAX` = **$12,000 USD** (barcha imkoniyatlar yuqori baholanganda)

---

### 4.4 🎯 Tavsiya Etiladigan Aniq Narx (Bitta Raqam)

Formula:
$$\text{Tavsiya etilgan narx} = \text{Min} + \left(\frac{\text{Umumiy Audit Bali}}{10}\right) \times (\text{Max} - \text{Min})$$

$$\text{Narx} = \$4,500 + \left(\frac{6.7}{10}\right) \times (\$12,000 - \$4,500) = \$4,500 + (0.67 \times \$7,500) = \mathbf{\$9,525\text{ USD}}$$

Biroq, O'zbekiston bozorining real xarid qobiliyatini va testlar/xavfsizlik yetishmasligini inobatga olgan holda:
> **Tavsiya etilgan yakuniy narx:** **$7,690 USD** (**96,125,000 UZS**)  
> *Asos: Loyihaning funksional imkoniyatlari (AI, do'kon, duellar) juda boy bo'lsa-da, 0% test qamrovi va kritik Firestore xavfsizlik zaifliklari sababli xaridorga dasturni to'g'rilash uchun qo'shimcha resurs kerak bo'ladi.*

---

### 4.5 SaaS / Obuna Modeli Bo'yicha Narxlash

Loyiha individual foydalanuvchilar va xususiy o'quv markazlariga obuna sifatida sotilganda:

| Tarif | Oyiga (USD) | Oyiga (UZS) | Imkoniyatlar |
|---|---|---|---|
| **Standart (O'quvchi)** | **$2.50 / oy** | **30,000 so'm** | Cheksiz testlar, kundalik streak, AI tahlil va sertifikatlar. |
| **Pro (Abituriyent)** | **$5.00 / oy** | **60,000 so'm** | 9 xil AI Mentor bilan cheksiz test tuzish, 1v1 duellar, ovozli review. |
| **B2B School (O'quv markaz)** | **$35.00 / oy** | **440,000 so'm** | 100 tagacha o'quvchi, maxsus testlar bazasi, o'qituvchi analitikasi va logotip. |

- **Breakeven (O'zini oqlash nuqtasi):**  
  Agar platforma 20 ta o'quv markaziga ($35/oy) va 500 ta o'quvchiga ($3/oy) obuna sotsa:  
  Oylik tushum = `(20 × $35) + (500 × $3) = $700 + $1,500 = $2,200/oy`.  
  **Atigi 3.5 oyda** butun ishlab chiqish tannarxi ($7,690) 100% qoplanadi!

---

## 5. 💡 Raqobatdan Ajralib Turish Uchun 6 ta Dasturiy Taklif

Abt.uz, TestMakon va boshqa raqobatchilardan bir bosh ustun bo'lish uchun tavsiyalar:

| # | Funksiya / Taklif | Murakkablik | Soat | Jahon narxi | O'zbekiston narxi | Tavsiya etilgan narx |
|---|---|---|---|---|---|---|
| 1 | **Click & Payme Billing Integratsiyasi:** TP-Coins va Premium obunalarni mahalliy kartalar orqali xarid qilish. | O'rta | 18 | $900–$1,800 | $200–$400 | **$300** |
| 2 | **O'quv Markazlari Uchun B2B "Teacher Mode":** O'qituvchi o'z sinfini ochib, uyga vazifa testlari berishi va guruh reytingini ko'rishi. | Yuqori | 35 | $1,750–$3,500 | $400–$700 | **$550** |
| 3 | **AI DTM Ball Bashoratchisi (Predictive Score):** O'quvchining so'nggi 20 ta testi asosida real DTM imtihonida qaysi OTMga kira olishini prognoz qilish. | O'rta | 16 | $800–$1,600 | $200–$350 | **$280** |
| 4 | **Telegram WebApp (TMA) To'liq Integratsiyasi:** Saytga kirmasdan to'g'ridan-to'g'ri Telegram ichida test yechish va do'stni chaqirish. | O'rta | 20 | $1,000–$2,000 | $250–$500 | **$350** |
| 5 | **Avtomatik WebP Rasm Optimizatori va CDN:** Barcha og'ir rasmlarni (5.6 MB) soniyaning ichida siqib, yuklanish tezligini 4x oshirish. | Past | 6 | $300–$600 | $70–$150 | **$100** |
| 6 | **Firestore Xavfsizlik va RBAC Qayta Arxitekturasi:** Rollar tizimini to'liq yopish, testlar va fanlarni himoyalash. | O'rta | 10 | $500–$1,000 | $120–$250 | **$180** |

---

## 6. 🗺️ Keyingi 3 Oylik Yo'l Xaritasi (Qadam-baqadam)

### 🗓️ 1-Oy: Xavfsizlik, Barqarorlik va Optimizatsiya (Foundation Sprint)
- [ ] `firestore.rules`dagi ochiq yozish ruxsatlarini tuzatish va faqat admin bilan cheklash.
- [ ] `/admin-seeder` sahifasiga RBAC himoyasini o'rnatish.
- [ ] `TPcoinAi.png` va quti rasmlarini WebP formatiga o'tkazish (sayt hajmini 14 MB dan 2 MB ga tushirish).
- [ ] Vitest o'rnatish va asosiy 15 ta unit testlarni yozish.
- [ ] `.github/workflows` orqali avtomatik build CI pipeline sozlash.
- **Xarajat:** ~$650 USD (taxminan 40 soat).

### 🗓️ 2-Oy: Monetizatsiya va O'qituvchilar Paneli (Revenue Sprint)
- [ ] Click va Payme to'lov shlyuzlarini ulash.
- [ ] "Guest Mode" (ro'yxatdan o'tmasdan 5 ta sinov testi yechish) imkoniyatini kiritish.
- [ ] Test natijalarini Telegram orqali chiroyli rasm qilib ulashish (Viral share card).
- [ ] O'quv markazlari uchun dastlabki B2B O'qituvchi Kabinetini yaratish.
- **Xarajat:** ~$950 USD (taxminan 60 soat).

### 🗓️ 3-Oy: Masshtab va Ekosistema (Scale & AI Expansion)
- [ ] Telegram Mini App (TMA) rejimida bot ichidan test yechishni yo'lga qo'yish.
- [ ] AI DTM Ball Bashoratchisi (Predictive Analytics) modulini ishga tushirish.
- [ ] Monolit sahifalarni (`home.vue`, `editProfile.vue`) Smart/Dumb komponentlarga to'liq refactoring qilish.
- **Xarajat:** ~$800 USD (taxminan 50 soat).

---

> **Audit xulosasi:** *Test.me — ajoyib gamifikatsiya, o'ziga xos AI Murabbiylar va yuqori darajadagi foydalanuvchi jozibadorligiga ega bo'lgan kuchli loyiha. Xavfsizlik tuynuklari yopilib, testlar va mahalliy to'lovlar qo'shilsa, u O'zbekiston EdTech bozorining yetakchi platformalaridan biriga aylanish uchun 100% potensialga ega.*
