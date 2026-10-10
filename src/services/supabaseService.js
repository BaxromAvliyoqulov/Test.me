// src/services/supabaseService.js
/**
 * ⚡ Sovereign Unified Supabase Service
 * Barcha Supabase Auth, PostgreSQL CRUD, RLS va Realtime operatsiyalari uchun
 * yagona, xavfsiz va defensive arxitektura qatlami.
 */
import { supabase } from '@/config/supabase';

// ==============================================================================
// 1. AUTH SERVICE
// ==============================================================================
export const authService = {
  async signUp(email, password, username) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split('@')[0],
          full_name: username || email.split('@')[0],
        },
      },
    });
    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('Session olishda ogohlantirish:', error.message);
      return null;
    }
    return data?.session || null;
  },

  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data?.user || null;
  },

  onAuthStateChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session?.user || null, session);
    });
    return subscription;
  },
};

// ==============================================================================
// 2. PROFILE SERVICE
// ==============================================================================
export const profileService = {
  async getProfile(userId) {
    if (!userId) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('getProfile xatosi:', error.message);
      return null;
    }
    return data;
  },

  async updateProfile(userId, updates) {
    if (!userId) return null;
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async addPoints(userId, amount, description = 'Ball qo\'shildi') {
    if (!userId || !amount) return null;

    // 1. Profil ballini olish
    const profile = await this.getProfile(userId);
    const currentPoints = profile?.points || 0;
    const newPoints = Math.max(0, currentPoints + amount);

    // 2. Profilni yangilash
    const { data, error } = await supabase
      .from('profiles')
      .update({ points: newPoints })
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) throw error;

    // 3. Tranzaksiya tarixiga yozish
    await supabase.from('user_transactions').insert({
      user_id: userId,
      points: amount,
      type: amount > 0 ? 'reward' : 'spend',
      description,
    });

    return data;
  },

  async getLeaderboard(limit = 20) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, photo_url, points, is_premium')
      .order('points', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('getLeaderboard xatosi:', error.message);
      return [];
    }
    return data || [];
  },
};

// ==============================================================================
// 3. SUBJECTS & TESTS SERVICE
// ==============================================================================
export const subjectService = {
  async getSubjects() {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('getSubjects xatosi:', error.message);
      return [];
    }
    return data || [];
  },

  async getLevels(subjectId) {
    let query = supabase.from('levels').select('*').order('order_index', { ascending: true });
    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }
    const { data, error } = await query;
    if (error) {
      console.error('getLevels xatosi:', error.message);
      return [];
    }
    return data || [];
  },

  async getTests(subjectId, levelId) {
    let query = supabase.from('tests').select('*');
    if (subjectId) query = query.eq('subject_id', subjectId);
    if (levelId) query = query.eq('level_id', levelId);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      console.error('getTests xatosi:', error.message);
      return [];
    }
    return data || [];
  },

  async getQuestions(testId) {
    if (!testId) return [];
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('test_id', testId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('getQuestions xatosi:', error.message);
      return [];
    }
    return data || [];
  },
};

// ==============================================================================
// 4. RESULTS & CERTIFICATES SERVICE
// ==============================================================================
export const resultService = {
  async saveResult(resultData) {
    const { data, error } = await supabase
      .from('results')
      .insert(resultData)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getUserResults(userId) {
    if (!userId) return [];
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getUserResults xatosi:', error.message);
      return [];
    }
    return data || [];
  },
};

export const certificateService = {
  async getUserCertificates(userId) {
    if (!userId) return [];
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .order('issued_at', { ascending: false });

    if (error) {
      console.error('getUserCertificates xatosi:', error.message);
      return [];
    }
    return data || [];
  },

  async issueCertificate(certData) {
    const { data, error } = await supabase
      .from('certificates')
      .insert(certData)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },
};

// ==============================================================================
// 5. SHOP & TRANSACTIONS SERVICE
// ==============================================================================
export const shopService = {
  async getShopItems() {
    const { data, error } = await supabase
      .from('shop_items')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('getShopItems xatosi:', error.message);
      return [];
    }
    return data || [];
  },

  async getShopBoxes() {
    const { data, error } = await supabase
      .from('shop_boxes')
      .select('*');

    if (error) {
      console.error('getShopBoxes xatosi:', error.message);
      return [];
    }
    return data || [];
  },

  async getUserInventory(userId) {
    if (!userId) return [];
    const { data, error } = await supabase
      .from('user_inventory')
      .select('*, item:shop_items(*)')
      .eq('user_id', userId);

    if (error) {
      console.error('getUserInventory xatosi:', error.message);
      return [];
    }
    return data || [];
  },

  async getUserTransactions(userId) {
    if (!userId) return [];
    const { data, error } = await supabase
      .from('user_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getUserTransactions xatosi:', error.message);
      return [];
    }
    return data || [];
  },

  async buyItem(userId, item) {
    if (!userId || !item) throw new Error('Ma\'lumotlar yetarli emas');

    // 1. Foydalanuvchi profilini olish
    const profile = await profileService.getProfile(userId);
    if (!profile || profile.points < item.price) {
      throw new Error('Mablag\' yetarli emas (TP Coins kam)');
    }

    // 2. Mablag'ni ayirish
    await profileService.addPoints(userId, -item.price, `Xarid: ${item.title}`);

    // 3. Inventarga qo'shish
    const { data, error } = await supabase
      .from('user_inventory')
      .insert({
        user_id: userId,
        item_id: item.id,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },
};

// ==============================================================================
// 6. GOALS SERVICE
// ==============================================================================
export const goalService = {
  async getUserGoals(userId) {
    if (!userId) return [];
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getUserGoals xatosi:', error.message);
      return [];
    }
    return data || [];
  },

  async saveGoals(userId, goals) {
    if (!userId || !Array.isArray(goals)) return [];

    // Avval eski maqsadlarni tozalaymiz yoki yangilaymiz
    await supabase.from('user_goals').delete().eq('user_id', userId);

    if (goals.length === 0) return [];

    const formatted = goals.map(g => ({
      user_id: userId,
      title: g.title || g.text || 'Maqsad',
      is_completed: g.is_completed || g.completed || false,
    }));

    const { data, error } = await supabase
      .from('user_goals')
      .insert(formatted)
      .select();

    if (error) throw error;
    return data || [];
  },
};
