import { onMounted, onBeforeUnmount } from 'vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

let heartbeatTimer = null;
let lastRecordedTime = 0;
const THROTTLE_MS = 2 * 60 * 1000; // Update at most once every 2 minutes

export function useUserPresence() {
  const touchPresence = async (force = false) => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.uid) return;

      const now = Date.now();
      if (!force && (now - lastRecordedTime < THROTTLE_MS)) {
        return;
      }

      lastRecordedTime = now;
      await updateDoc(doc(db, 'users', currentUser.uid), {
        lastActive: serverTimestamp()
      });
    } catch {
      // Non-critical, ignore offline or permission errors
    }
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      touchPresence(true);
    }
  };

  const initPresence = () => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        touchPresence(true);
        if (!heartbeatTimer) {
          heartbeatTimer = setInterval(() => {
            if (document.visibilityState === 'visible') {
              touchPresence();
            }
          }, THROTTLE_MS);
        }
      } else {
        if (heartbeatTimer) {
          clearInterval(heartbeatTimer);
          heartbeatTimer = null;
        }
      }
    });

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', () => touchPresence());
  };

  return {
    touchPresence,
    initPresence
  };
}
