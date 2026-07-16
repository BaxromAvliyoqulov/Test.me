const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.vue', 'utf8');

// Move Statistika link
const statsLink = `<router-link to="/stats" class="sidebar-link stats-link" v-tooltip="'Statistika'">
          <div class="link-icon"><i class="fas fa-chart-pie"></i></div>
          <transition name="fade-slide">
            <span v-if="!isCollapsed" class="link-text">Statistika</span>
          </transition>
        </router-link>`;

code = code.replace(statsLink, '');

const infoSection = `<div class="nav-section-title mt-sec" v-if="!isCollapsed">INFO</div>
      <div class="nav-links-list footer-links">`;

const newStatsLink = `<router-link to="/stats" class="sidebar-link stats-link" v-tooltip="'Umumiy Statistika'">
          <div class="link-icon"><i class="fas fa-chart-pie"></i></div>
          <transition name="fade-slide">
            <span v-if="!isCollapsed" class="link-text">Umumiy Statistika</span>
          </transition>
        </router-link>

        `;

code = code.replace(infoSection, infoSection + '\n        ' + newStatsLink);

// Add deviceOS tracking
const handleAuthStart = 'async handleUserAuthenticated(user) {';
const deviceTrackingLogic = `
      const userAgent = navigator.userAgent || '';
      let os = 'Unknown';
      if (/Windows/i.test(userAgent)) os = 'Windows';
      else if (/Mac/i.test(userAgent)) os = 'macOS';
      else if (/Android/i.test(userAgent)) os = 'Android';
      else if (/iPhone|iPad|iPod/i.test(userAgent)) os = 'iOS';
      else if (/Linux/i.test(userAgent)) os = 'Linux';
`;
code = code.replace(handleAuthStart, handleAuthStart + '\n' + deviceTrackingLogic);

const updateDocMatch = "await updateDoc(doc(db, 'users', user.uid), { shortId: newShortId });";
const updateDocReplace = "await updateDoc(doc(db, 'users', user.uid), { shortId: newShortId, deviceOS: os });";
code = code.replace(updateDocMatch, updateDocReplace);

const ifShortIdMatch = `this.shortId = data.shortId;
          }`;
const ifShortIdReplace = `this.shortId = data.shortId;
          }
          if (data.deviceOS !== os) {
            await updateDoc(doc(db, 'users', user.uid), { deviceOS: os });
          }`;
code = code.replace(ifShortIdMatch, ifShortIdReplace);

fs.writeFileSync('src/components/Sidebar.vue', code);
console.log('Sidebar updated');
