import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '@/config/firebase';

export default {
  namespaced: true,
  state: {
    profile: null,
    preferences: null,
    goals: [],
    loading: false,
    error: null
  },
  mutations: {
    SET_PROFILE(state, profile) {
      state.profile = profile;
    },
    SET_PREFERENCES(state, preferences) {
      state.preferences = preferences;
    },
    SET_GOALS(state, goals) {
      state.goals = goals;
    },
    SET_LOADING(state, isLoading) {
      state.loading = isLoading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },
  actions: {
    async fetchUserData({ commit }) {
      commit('SET_LOADING', true);
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error("No authenticated user");

        // Fetch main profile document
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          commit('SET_PROFILE', {
            username: data.displayName || data.username || user.displayName || '',
            photoURL: data.photoURL || user.photoURL || '',
            points: data.points || 0,
            isPremium: data.isPremium || false
          });
          commit('SET_PREFERENCES', data.preferences || {});
        } else {
          commit('SET_PROFILE', {
            username: user.displayName || '',
            photoURL: user.photoURL || '',
            points: 0,
            isPremium: false
          });
          commit('SET_PREFERENCES', {});
        }

        // Fetch goals subcollection
        const goalsRef = collection(db, 'users', user.uid, 'goals');
        const goalsSnap = await getDocs(goalsRef);
        const goalsData = goalsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        commit('SET_GOALS', goalsData);

      } catch (err) {
        console.error("Error fetching user data:", err);
        commit('SET_ERROR', err.message);
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async saveGoals({ commit, state }, goals) {
      commit('SET_LOADING', true);
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error("No authenticated user");

        const batch = writeBatch(db);
        goals.forEach(g => {
          const ref = doc(db, 'users', user.uid, 'goals', g.id);
          batch.set(ref, g, { merge: true });
        });
        
        await batch.commit();
        commit('SET_GOALS', goals);
      } catch (err) {
        console.error("Error saving goals:", err);
        commit('SET_ERROR', err.message);
        throw err;
      } finally {
        commit('SET_LOADING', false);
      }
    }
  },
  getters: {
    hasGoals: state => state.goals.length > 0,
    activeGoals: state => state.goals.filter(g => g.status === 'active')
  }
};
