// src/services/supabaseService.js
/**
 * ⚡ Sovereign Unified Supabase Service
 * Barcha Supabase Auth, PostgreSQL CRUD, RLS va Realtime operatsiyalari uchun
 * yagona, xavfsiz va defensive arxitektura qatlami.
 */
import { supabase } from '@/config/supabase';
export { supabase };

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

  async signInWithGoogle() {
    const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : '';
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: origin ? `${origin}/dashboard` : undefined,
      },
    });
    if (error) throw error;
    return data;
  },

  async resetPasswordForEmail(email) {
    const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : '';
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: origin ? `${origin}/editProfile` : undefined,
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

// ==============================================================================
// 7. NOTIFICATIONS & FRIENDS SERVICE
// ==============================================================================
export const notificationService = {
  async getNotifications() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      return [];
    }
    return data || [];
  },

  async markAsRead(userId, notificationIds) {
    if (!userId || !notificationIds?.length) return;
    try {
      const profile = await profileService.getProfile(userId);
      const existing = profile?.read_notifications || [];
      const updated = Array.from(new Set([...existing, ...notificationIds]));
      await profileService.updateProfile(userId, { read_notifications: updated });
    } catch (e) {
      console.warn('markAsRead error:', e);
    }
  }
};

export const friendService = {
  async getFriends(userId) {
    if (!userId) return [];
    try {
      const { data, error } = await supabase
        .from('friends')
        .select('*')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`);
      
      if (!error && data?.length) {
        const friendIds = data.map(f => f.user_id === userId ? f.friend_id : f.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name, full_name, email, points, rank, streak, avatar_url, short_id')
          .in('id', friendIds);

        const profileMap = new Map((profiles || []).map(p => [p.id, p]));
        return friendIds.map(fId => {
          const p = profileMap.get(fId) || {};
          return {
            id: fId,
            uid: fId,
            displayName: p.display_name || p.full_name || p.email?.split('@')[0] || 'Foydalanuvchi',
            email: p.email || '',
            points: p.points || 0,
            rank: p.rank || 'Newbie',
            streak: p.streak || 1,
            profileImage: p.avatar_url || null,
            shortId: p.short_id || fId.slice(0, 6).toUpperCase()
          };
        });
      }

      // Fallback: check profile.friends JSON/Array
      const profile = await profileService.getProfile(userId);
      if (Array.isArray(profile?.friends) && profile.friends.length) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name, full_name, email, points, rank, streak, avatar_url, short_id')
          .in('id', profile.friends);

        return (profiles || []).map(p => ({
          id: p.id,
          uid: p.id,
          displayName: p.display_name || p.full_name || p.email?.split('@')[0] || 'Foydalanuvchi',
          email: p.email || '',
          points: p.points || 0,
          rank: p.rank || 'Newbie',
          streak: p.streak || 1,
          profileImage: p.avatar_url || null,
          shortId: p.short_id || p.id.slice(0, 6).toUpperCase()
        }));
      }
      return [];
    } catch (e) {
      console.warn('getFriends error:', e);
      return [];
    }
  },

  async getPendingRequests(userId) {
    if (!userId) return [];
    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('receiver_id', userId)
        .eq('status', 'pending');
      if (error) return [];
      return (data || []).map(r => ({
        id: r.id,
        fromUid: r.sender_id,
        fromName: r.sender_name || 'Foydalanuvchi',
        toUid: r.receiver_id,
        toName: r.receiver_name || '',
        status: r.status,
        createdAt: r.created_at,
        ...r
      }));
    } catch {
      return [];
    }
  },

  async getOutgoingRequests(userId) {
    if (!userId) return [];
    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('sender_id', userId)
        .eq('status', 'pending');
      if (error) return [];
      return (data || []).map(r => ({
        id: r.id,
        fromUid: r.sender_id,
        fromName: r.sender_name || '',
        toUid: r.receiver_id,
        toName: r.receiver_name || 'Foydalanuvchi',
        status: r.status,
        createdAt: r.created_at,
        ...r
      }));
    } catch {
      return [];
    }
  },

  async sendFriendRequest(fromUser, targetUser) {
    const fromId = fromUser.id || fromUser.uid;
    const targetId = targetUser.id || targetUser.uid;
    const { error } = await supabase.from('friend_requests').insert({
      sender_id: fromId,
      sender_name: fromUser.displayName || fromUser.name || 'Foydalanuvchi',
      receiver_id: targetId,
      receiver_name: targetUser.displayName || targetUser.name || 'Foydalanuvchi',
      status: 'pending'
    });
    if (error) {
      // Fallback: direct friendship in friends table if request table not supported
      await supabase.from('friends').insert([
        { user_id: fromId, friend_id: targetId },
        { user_id: targetId, friend_id: fromId }
      ]);
    }
    return true;
  },

  async acceptFriendRequest(req) {
    const fromId = req.sender_id || req.fromUid;
    const toId = req.receiver_id || req.toUid;
    try {
      await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', req.id);
      await supabase.from('friends').insert([
        { user_id: toId, friend_id: fromId },
        { user_id: fromId, friend_id: toId }
      ]);
    } catch (e) {
      console.warn('acceptFriendRequest fallback:', e);
    }
    return true;
  },

  async rejectFriendRequest(reqId) {
    try {
      await supabase.from('friend_requests').delete().eq('id', reqId);
    } catch (e) {
      console.warn('rejectFriendRequest note:', e);
    }
    return true;
  },

  async removeFriend(userId, friendId) {
    try {
      await supabase.from('friends').delete().or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);
    } catch (e) {
      console.warn('removeFriend note:', e);
    }
    return true;
  },

  async getPendingDuels(userId) {
    if (!userId) return [];
    try {
      const { data, error } = await supabase
        .from('duels')
        .select('*')
        .eq('opponent_id', userId)
        .eq('status', 'pending');
      if (error) return [];
      return (data || []).map(d => ({
        id: d.id,
        opponentUid: d.opponent_id,
        challengerUid: d.challenger_id,
        challengerName: d.challenger_name || 'Raqib',
        opponentName: d.opponent_name || '',
        subjectId: d.subject_id,
        subjectName: d.subject_name || 'Fan',
        questionCount: d.question_count || 10,
        wager: d.wager || 0,
        status: d.status,
        createdAt: d.created_at,
        ...d
      }));
    } catch {
      return [];
    }
  },

  async getOutgoingDuels(userId) {
    if (!userId) return [];
    try {
      const { data, error } = await supabase
        .from('duels')
        .select('*')
        .eq('challenger_id', userId)
        .eq('status', 'pending');
      if (error) return [];
      return (data || []).map(d => ({
        id: d.id,
        challengerUid: d.challenger_id,
        opponentUid: d.opponent_id,
        opponentName: d.opponent_name || 'Raqib',
        subjectId: d.subject_id,
        subjectName: d.subject_name || 'Fan',
        questionCount: d.question_count || 10,
        wager: d.wager || 0,
        status: d.status,
        ...d
      }));
    } catch {
      return [];
    }
  },

  async createDuel(challenger, duelData) {
    const { error } = await supabase.from('duels').insert({
      challenger_id: challenger.id || challenger.uid,
      challenger_name: challenger.displayName || challenger.email,
      opponent_id: duelData.opponentUid,
      opponent_name: duelData.opponentName,
      subject_id: duelData.subjectId,
      subject_name: duelData.subjectName,
      question_count: duelData.questionCount || 10,
      wager: duelData.wager || 0,
      status: 'pending'
    });
    if (error) throw error;
    return true;
  },

  async acceptDuel(duelId) {
    const { error } = await supabase
      .from('duels')
      .update({ status: 'active', started_at: new Date().toISOString() })
      .eq('id', duelId);
    if (error) throw error;
    return true;
  },

  async rejectDuel(duelId) {
    await supabase.from('duels').delete().eq('id', duelId);
    return true;
  },

  async sendGift(fromUser, toUser, amount, message = '') {
    const fromId = fromUser.id || fromUser.uid;
    const toId = toUser.id || toUser.uid;
    await profileService.addPoints(fromId, -amount);
    await profileService.addPoints(toId, amount);

    try {
      await supabase.from('transactions').insert([
        { user_id: fromId, type: 'gift_sent', amount: -amount, target_name: toUser.displayName || toUser.email, message },
        { user_id: toId, type: 'gift_received', amount, from_name: fromUser.displayName || fromUser.email, message }
      ]);
    } catch (e) {
      console.warn('Gift transaction log note:', e);
    }
    return true;
  },

  async getSuggestedUsers(currentUserId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, full_name, email, points, rank, streak, avatar_url, short_id')
        .neq('id', currentUserId || '')
        .limit(20);
      if (error) return [];
      return (data || []).map(p => ({
        id: p.id,
        uid: p.id,
        displayName: p.display_name || p.full_name || p.email?.split('@')[0] || 'Foydalanuvchi',
        email: p.email || '',
        points: p.points || 0,
        rank: p.rank || 'Newbie',
        streak: p.streak || 1,
        profileImage: p.avatar_url || null,
        shortId: p.short_id || p.id.slice(0, 6).toUpperCase()
      }));
    } catch {
      return [];
    }
  },

  async searchUsers(queryTerm, currentUserId) {
    if (!queryTerm?.trim()) return [];
    try {
      const term = queryTerm.trim();
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, full_name, email, points, rank, streak, avatar_url, short_id')
        .neq('id', currentUserId || '')
        .or(`display_name.ilike.%${term}%,full_name.ilike.%${term}%,email.ilike.%${term}%,short_id.ilike.%${term}%`)
        .limit(30);
      if (error) return [];
      return (data || []).map(p => ({
        id: p.id,
        uid: p.id,
        displayName: p.display_name || p.full_name || p.email?.split('@')[0] || 'Foydalanuvchi',
        email: p.email || '',
        points: p.points || 0,
        rank: p.rank || 'Newbie',
        streak: p.streak || 1,
        profileImage: p.avatar_url || null,
        shortId: p.short_id || p.id.slice(0, 6).toUpperCase()
      }));
    } catch {
      return [];
    }
  }
};
