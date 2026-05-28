<template>
  <div class="certificates-wrapper">
    <!-- Glowing background elements for premium feel -->
    <div class="glow-bg glow-bg-1"></div>
    <div class="glow-bg glow-bg-2"></div>

    <div class="certificates-container">
      <div class="header-section">
        <h1>🎓 {{ isRus ? 'Ваши Сертификаты' : 'Sizning Sertifikatlaringiz' }}</h1>
        <p>{{ isRus ? 'Подтвердите свои знания официальными сертификатами платформы!' : 'Bilimingizni platformaning rasmiy sertifikatlari bilan tasdiqlang!' }}</p>
      </div>

      <!-- Stats overview -->
      <div class="stats-overview">
        <div class="overview-card">
          <span class="value">{{ unlockedCount }} / {{ certificates.length }}</span>
          <span class="label">{{ isRus ? 'Получено сертификатов' : 'Olingan sertifikatlar' }}</span>
        </div>
        <div class="overview-card">
          <span class="value">{{ elementaryCount }}</span>
          <span class="label">Elementary tests</span>
        </div>
        <div class="overview-card">
          <span class="value">{{ intermediateCount }}</span>
          <span class="label">Intermediate tests</span>
        </div>
      </div>

      <!-- Grid of Certificates -->
      <div class="certs-grid">
        <div
          v-for="cert in certificates"
          :key="cert.id"
          :class="['cert-card', { locked: !cert.unlocked }]"
        >
          <div 
            class="cert-icon" 
            :style="cert.unlocked ? { background: cert.color + '15', color: cert.color, borderColor: cert.color + '30' } : {}"
          >
            <i :class="cert.icon"></i>
            <div class="lock-indicator" v-if="!cert.unlocked">
              <i class="fas fa-lock"></i>
            </div>
          </div>

          <div class="cert-details">
            <h3>{{ isRus ? cert.nameRu : cert.nameUz }}</h3>
            <p class="cert-desc">{{ isRus ? cert.descRu : cert.descUz }}</p>

            <div class="cert-progress-container" v-if="cert.progress !== null">
              <div class="progress-info">
                <span>{{ isRus ? 'Прогресс' : 'Progress' }}</span>
                <span>{{ Math.min(cert.currentVal, cert.targetVal) }} / {{ cert.targetVal }}</span>
              </div>
              <div class="bar-outer">
                <div 
                  class="bar-inner" 
                  :style="{ 
                    width: Math.min((cert.currentVal / cert.targetVal) * 100, 100) + '%', 
                    background: cert.unlocked ? cert.color : '#94a3b8' 
                  }"
                ></div>
              </div>
            </div>

            <div class="cert-actions">
              <span class="unlock-rate">
                <i class="fas fa-users"></i> {{ cert.unlockRate }}%
              </span>
              <button 
                class="view-cert-btn" 
                v-if="cert.unlocked"
                @click="openCertificateModal(cert)"
              >
                <i class="fas fa-eye"></i> {{ isRus ? 'Посмотреть' : 'Ko\'rish' }}
              </button>
              <span class="locked-lbl" v-else>
                <i class="fas fa-lock"></i> {{ isRus ? 'Заблокировано' : 'Qulflangan' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Certificate Modal Printable -->
    <transition name="modal">
      <div class="modal-overlay" v-if="selectedCert" @click.self="closeCertificateModal">
        <div class="certificate-modal-card">
          <!-- Print Layout -->
          <div class="printable-certificate" id="print-area">
            <div class="cert-border-outer">
              <div class="cert-border-inner">
                <div class="cert-content-inner">
                  <div class="cert-header">
                    <span class="cert-logo-text">Test.me</span>
                    <h2>{{ isRus ? 'СЕРТИФИКАТ СООТВЕТСТВИЯ' : 'MUVOFIQLIK SERTIFIKATI' }}</h2>
                    <p class="cert-sub">{{ isRus ? 'Подтверждает высокий уровень знаний' : 'Yuqori bilim darajasini tasdiqlaydi' }}</p>
                  </div>

                  <div class="cert-recipient">
                    <span class="recipient-lbl">{{ isRus ? 'Настоящим награждается' : 'Ushbu sertifikat bilan taqdirlanadi' }}</span>
                    <h1 class="recipient-name">{{ userDisplayName || 'Foydalanuvchi' }}</h1>
                  </div>

                  <div class="cert-body">
                    <p>
                      {{ isRus 
                        ? `За успешное прохождение испытаний по программе "${selectedCert.nameRu}" на платформе Test.me с подтвержденными результатами.` 
                        : `Test.me platformasida "${selectedCert.nameUz}" dasturi bo'yicha belgilangan barcha sinovlardan muvaffaqiyatli o'tganligi uchun.` 
                      }}
                    </p>
                  </div>

                  <div class="cert-footer">
                    <div class="footer-sign">
                      <div class="line"></div>
                      <span>{{ isRus ? 'Руководитель Test.me' : 'Test.me Rahbariyati' }}</span>
                    </div>
                    <div class="footer-stamp">
                      <div class="stamp-circle">
                        <span>TEST.ME</span>
                        <span>OFFICIAL</span>
                      </div>
                    </div>
                    <div class="footer-code">
                      <span>ID: {{ certId }}</span>
                      <span>{{ formattedDate }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="modal-actions no-print">
            <button class="modal-btn print-btn" @click="printCertificate">
              <i class="fas fa-print"></i> {{ isRus ? 'Печать' : 'Chop etish' }}
            </button>
            <button class="modal-btn close-btn" @click="closeCertificateModal">
              {{ isRus ? 'Закрыть' : 'Yopish' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { db, auth } from '@/config/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useI18n } from '@/utils/i18n';
import { getCertificates } from '@/utils/certificates';

export default {
  name: 'CertificatesView',
  setup() {
    const { locale } = useI18n();
    return { currentLocale: locale };
  },
  data() {
    return {
      userDisplayName: '',
      results: [],
      issuedCertificates: [],
      elementaryCount: 0,
      intermediateCount: 0,
      advancedCount: 0,
      totalCount: 0,
      selectedCert: null,
      loading: true
    };
  },
  computed: {
    isRus() {
      return this.currentLocale === 'RUS';
    },
    unlockedCount() {
      return this.certificates.filter(c => c.unlocked).length;
    },
    certId() {
      if (!this.selectedCert) return 'CERT-XXXX-XXXX';
      const issued = this.issuedCertificates.find(c => c.certType === this.selectedCert.id);
      if (issued) return issued.certId;
      
      // Fallback stable ID generator
      const uidPart = (auth.currentUser ? auth.currentUser.uid : 'USER').substring(0, 8).toUpperCase();
      const certPart = this.selectedCert.id.replace(/_/g, '').substring(0, 4).toUpperCase();
      return `CERT-${uidPart}-${certPart}`;
    },
    formattedDate() {
      if (!this.selectedCert) return '';
      const issued = this.issuedCertificates.find(c => c.certType === this.selectedCert.id);
      let date = null;
      if (issued && issued.issuedAt) {
        date = issued.issuedAt.toDate ? issued.issuedAt.toDate() : new Date(issued.issuedAt);
      } else if (this.results.length > 0) {
        // Fallback to latest test timestamp
        const latest = this.results[0];
        if (latest && latest.timestamp) {
          date = latest.timestamp.toDate ? latest.timestamp.toDate() : new Date(latest.timestamp);
        }
      }
      if (!date) date = new Date();

      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      return `${dd}.${mm}.${yyyy}`;
    },
    certificates() {
      return getCertificates(this.results);
    }
  },
  methods: {
    fetchStats() {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          this.userDisplayName = user.displayName || user.email.split('@')[0];
          try {
            // Fetch test results
            const resultsRef = collection(db, 'results');
            const q = query(resultsRef, where('userId', '==', user.uid));
            const querySnapshot = await getDocs(q);

            this.results = querySnapshot.docs.map(doc => doc.data());
            
            // Sort results by timestamp desc for latest fallback date
            this.results.sort((a, b) => {
              const timeA = a.timestamp ? (a.timestamp.toMillis ? a.timestamp.toMillis() : new Date(a.timestamp).getTime()) : 0;
              const timeB = b.timestamp ? (b.timestamp.toMillis ? b.timestamp.toMillis() : new Date(b.timestamp).getTime()) : 0;
              return timeB - timeA;
            });

            this.totalCount = this.results.length;

            // Calculate level completion metrics
            this.elementaryCount = this.results.filter(r => {
              const l = (r.test_level || '').toLowerCase();
              return l.includes('elem') || l.includes('beg') || l.includes('boshlang');
            }).length;
            this.intermediateCount = this.results.filter(r => {
              const l = (r.test_level || '').toLowerCase();
              return l.includes('inter') || l.includes('o\'rta') || l.includes('orta');
            }).length;
            this.advancedCount = this.results.filter(r => {
              const l = (r.test_level || '').toLowerCase();
              return l.includes('adv') || l.includes('yuqori') || l.includes('prof');
            }).length;

            // Fetch secure certificates from Firestore
            const certsRef = collection(db, 'certificates');
            const certsQ = query(certsRef, where('userId', '==', user.uid));
            const certsSnapshot = await getDocs(certsQ);
            this.issuedCertificates = certsSnapshot.docs.map(doc => doc.data());

            // Auto-synchronize newly unlocked certificates to Firestore
            const newlyUnlocked = this.certificates.filter(
              c => c.unlocked && !this.issuedCertificates.some(ic => ic.certType === c.id)
            );

            for (const cert of newlyUnlocked) {
              const uidPart = user.uid.substring(0, 8).toUpperCase();
              const certCode = `CERT-${uidPart}-${cert.id.substring(0, 4).toUpperCase().replace(/_/g, '')}`;
              const newCertObj = {
                certId: certCode,
                userId: user.uid,
                userName: user.displayName || user.email || 'Foydalanuvchi',
                certType: cert.id,
                nameUz: cert.nameUz,
                nameRu: cert.nameRu,
                descUz: cert.descUz,
                descRu: cert.descRu,
                issuedAt: new Date()
              };
              await addDoc(collection(db, 'certificates'), newCertObj);
              this.issuedCertificates.push(newCertObj);
              console.log(`Auto-synchronized certificate: ${cert.id}`);
            }
          } catch (e) {
            console.error('Error fetching statistics:', e);
          } finally {
            this.loading = false;
          }
        }
      });
    },
    openCertificateModal(cert) {
      this.selectedCert = cert;
    },
    closeCertificateModal() {
      this.selectedCert = null;
    },
    printCertificate() {
      window.print();
    }
  },
  mounted() {
    this.fetchStats();
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');

.certificates-wrapper {
  position: relative;
  min-height: calc(100vh - 100px);
  font-family: 'Plus Jakarta Sans', sans-serif;
  overflow: hidden;
  padding: 3rem 1.5rem;
}

/* Background glowing elements */
.glow-bg {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  z-index: 0;
  opacity: 0.08;
}
.glow-bg-1 {
  width: 450px;
  height: 450px;
  background: #10b981;
  top: -10%;
  left: -5%;
}
.glow-bg-2 {
  width: 450px;
  height: 450px;
  background: #fbbf24;
  bottom: -10%;
  right: -5%;
}

.certificates-container {
  position: relative;
  z-index: 10;
  max-width: 1400px;
  margin: 0 auto;
}

.header-section {
  text-align: center;
  margin-bottom: 3rem;
}

.header-section h1 {
  font-size: 2.2rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.5rem;
  letter-spacing: -1px;
}

.header-section p {
  color: #64748b;
  font-size: 1rem;
}

/* Stats overview */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.overview-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 4px 15px -3px rgba(15, 23, 42, 0.02);
}

.overview-card .value {
  display: block;
  font-size: 1.8rem;
  font-weight: 800;
  color: #10b981;
  margin-bottom: 4px;
}

.overview-card .label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Grid of Certificates */
.certs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.cert-card {
  display: flex;
  gap: 1.25rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px -3px rgba(15, 23, 42, 0.02);
  transition: all 0.3s ease;
}

.cert-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px -5px rgba(15, 23, 42, 0.06);
}

.cert-card.locked {
  background: rgba(255, 255, 255, 0.6);
}

.cert-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 18px;
  font-size: 1.8rem;
  background: #f1f5f9;
  color: #94a3b8;
  border: 2px solid #e2e8f0;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.cert-card.locked .cert-icon {
  filter: grayscale(1);
}

.lock-indicator {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.68rem;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.cert-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.cert-details h3 {
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 6px 0;
}

.cert-card.locked .cert-details h3 {
  color: #64748b;
}

.cert-desc {
  font-size: 0.82rem;
  color: #64748b;
  line-height: 1.4;
  margin: 0 0 12px 0;
}

/* Progress bar inside cert */
.cert-progress-container {
  margin-bottom: 12px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 4px;
}

.bar-outer {
  height: 6px;
  background: #e2e8f0;
  border-radius: 99px;
  overflow: hidden;
}

.bar-inner {
  height: 100%;
  border-radius: 99px;
  transition: width 0.5s ease;
}

/* Cert actions */
.cert-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f1f5f9;
  padding-top: 10px;
  margin-top: 4px;
}

.unlock-rate {
  font-size: 0.72rem;
  font-weight: 600;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 4px;
}

.view-cert-btn {
  background: #10b981;
  color: white;
  border: none;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.view-cert-btn:hover {
  background: #059669;
}

.locked-lbl {
  font-size: 0.72rem;
  font-weight: 700;
  color: #ef4444;
}

/* Printable Certificate Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.certificate-modal-card {
  background: white;
  padding: 1.5rem;
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  max-width: 750px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.printable-certificate {
  background: #fdfdfd;
  color: #1e293b;
  padding: 1.5rem;
  border-radius: 12px;
  position: relative;
}

.cert-border-outer {
  border: 10px solid #1e293b;
  padding: 8px;
  background: white;
}

.cert-border-inner {
  border: 2px solid #64748b;
  padding: 2.5rem;
}

.cert-content-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.cert-logo-text {
  font-size: 1.6rem;
  font-weight: 800;
  color: #3b82f6;
  letter-spacing: -1px;
}

.cert-header h2 {
  font-family: 'Playfair Display', serif;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 1.5rem 0 0.25rem 0;
  letter-spacing: 2px;
}

.cert-sub {
  font-size: 0.85rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 2rem;
}

.recipient-lbl {
  font-size: 0.9rem;
  font-style: italic;
  color: #64748b;
}

.recipient-name {
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0.5rem 0 1.5rem 0;
  color: #0f172a;
}

.cert-body {
  max-width: 500px;
  line-height: 1.6;
  font-size: 0.95rem;
  color: #334155;
  margin-bottom: 2rem;
}

.cert-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
  margin-top: 1.5rem;
}

.footer-sign {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.footer-sign .line {
  width: 140px;
  height: 1px;
  background: #94a3b8;
  margin-bottom: 8px;
}
.footer-sign span {
  font-size: 0.75rem;
  color: #64748b;
}

.stamp-circle {
  width: 76px;
  height: 76px;
  border: 4px double #10b981;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #10b981;
  font-weight: 800;
  font-size: 0.65rem;
  transform: rotate(-12deg);
}

.footer-code {
  display: flex;
  flex-direction: column;
  text-align: right;
  font-size: 0.72rem;
  color: #94a3b8;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-btn {
  padding: 10px 20px;
  border: none;
  font-weight: 700;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.85rem;
}

.print-btn {
  background: #3b82f6;
  color: white;
}
.print-btn:hover {
  background: #2563eb;
}

.close-btn {
  background: #e2e8f0;
  color: #475569;
}
.close-btn:hover {
  background: #cbd5e1;
}

/* Print CSS Media Rule */
@media print {
  body * {
    visibility: hidden;
  }
  #print-area, #print-area * {
    visibility: visible;
  }
  #print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 0;
  }
  .no-print {
    display: none !important;
  }
}

@media (max-width: 768px) {
  .stats-overview {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .certs-grid {
    grid-template-columns: 1fr;
  }
}
</style>
