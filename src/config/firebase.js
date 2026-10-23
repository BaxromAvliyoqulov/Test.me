// src/config/firebase.js
// Re-export from zero-dependency Supabase bridge
export * from '@/compat/firebaseCompat';
export { db, auth, storage, functions, messaging } from '@/compat/firebaseCompat';
