// src/store/user.js
import { authService, profileService, goalService } from '@/services/supabaseService';

export default {
  namespaced: true,
  state: {
    profile: null,
    preferences: null,
    goals: [],
    loading: false,
    error: null,
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
    },
  },
  actions: {
    async fetchUserData({ commit }) {
      commit('SET_LOADING', true);
      try {
        const user = await authService.getUser();
        if (!user) throw new Error("No authenticated user");

        // Fetch profile from Supabase
        let profile = await profileService.getProfile(user.id);
        
        if (!profile) {
          // If profile not yet created by trigger, create fallback
          profile = {
            id: user.id,
            username: user.user_metadata?.username || user.email?.split('@')[0] || 'Foydalanuvchi',
            photoURL: user.user_metadata?.avatar_url || '',
            points: 100,
            isPremium: false,
            isAdmin: false,
          };
        }

        commit('SET_PROFILE', {
          id: user.id,
          username: profile.username || user.email?.split('@')[0],
          photoURL: profile.photo_url || '',
          points: Number(profile.points || 0),
          isPremium: Boolean(profile.is_premium),
          isAdmin: Boolean(profile.is_admin),
          adminRole: profile.admin_role || 'user',
          streakCount: profile.streak_count || 0,
        });
        commit('SET_PREFERENCES', {});

        // Fetch goals from Supabase
        const goals = await goalService.getUserGoals(user.id);
        commit('SET_GOALS', goals || []);

      } catch (err) {
        console.warn("fetchUserData:", err.message);
        commit('SET_ERROR', err.message);
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async saveGoals({ commit }, goals) {
      commit('SET_LOADING', true);
      try {
        const user = await authService.getUser();
        if (!user) throw new Error("No authenticated user");

        const saved = await goalService.saveGoals(user.id, goals);
        commit('SET_GOALS', saved);
      } catch (err) {
        console.error("Error saving goals:", err);
        commit('SET_ERROR', err.message);
        throw err;
      } finally {
        commit('SET_LOADING', false);
      }
    },
  },
  getters: {
    hasGoals: state => state.goals.length > 0,
    activeGoals: state => state.goals.filter(g => !g.is_completed),
  },
};
