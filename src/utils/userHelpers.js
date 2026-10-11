/**
 * Universal User Helper Utilities for Test.me
 * Resolves displayName, photoURL, and initials with robust fallbacks.
 */

export const getUserDisplayName = (user) => {
  if (!user) return 'Foydalanuvchi';
  
  if (user.displayName && typeof user.displayName === 'string' && user.displayName.trim()) {
    return user.displayName.trim();
  }
  if (user.username && typeof user.username === 'string' && user.username.trim()) {
    return user.username.trim();
  }
  if (user.name && typeof user.name === 'string' && user.name.trim()) {
    return user.name.trim();
  }
  if (user.fullName && typeof user.fullName === 'string' && user.fullName.trim()) {
    return user.fullName.trim();
  }
  if (user.email && typeof user.email === 'string' && user.email.includes('@')) {
    const part = user.email.split('@')[0];
    if (part && part.trim()) return part.trim();
  }
  
  const id = user.shortId || user.referralCode || (user.id || user.uid || '');
  if (id) {
    const cleanId = String(id).replace('#', '').slice(0, 6).toUpperCase();
    return `O'quvchi #${cleanId}`;
  }
  
  return 'Foydalanuvchi';
};

export const getUserAvatar = (user) => {
  if (!user) return null;
  const img = user.photoURL || user.profileImage || user.avatarUrl || user.avatar;
  if (img && typeof img === 'string' && img.trim().length > 5) {
    return img.trim();
  }
  return null;
};

export const getUserInitials = (user) => {
  const name = getUserDisplayName(user);
  const clean = name.replace(/[^a-zA-Z0-9А-Яа-яЁёЎўҚқҒғҲҳ]/g, '');
  return (clean.charAt(0) || 'U').toUpperCase();
};
