import { supabase, profileService } from '@/services/supabaseService';

/**
 * Referral code activation utility.
 * - Referrer (taklif qilgan): +50 TP
 * - Invited (taklif qilingan): +50 TP
 * 
 * @param {string} referralCode - The referral code entered by the invited user
 * @param {string} invitedUid   - The UID of the user who is activating the code
 */
export const handleReferral = async (referralCode, invitedUid) => {
  if (!referralCode || !invitedUid) return;

  const code = referralCode.trim().toUpperCase();
  const { data: referrers, error } = await supabase
    .from('profiles')
    .select('id, referral_code')
    .eq('referral_code', code);

  if (error || !referrers?.length) {
    console.warn('Referral code not found:', referralCode);
    return;
  }

  const referrerId = referrers[0].id;

  // Prevent self-referral
  if (referrerId === invitedUid) {
    console.warn('Self-referral attempted, skipping.');
    return;
  }

  // Award referrer (taklif qilgan): +50 TP
  await profileService.addPoints(referrerId, 50, 'Referral mukofoti (do\'st taklif qilindi)');

  // Award invited user (taklif qilingan): +50 TP
  await profileService.addPoints(invitedUid, 50, 'Referral kodi faollashtirildi');
  await profileService.updateProfile(invitedUid, { referred_by: code });
};
