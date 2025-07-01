import { setAdminRole } from './setAdminRole'; // setAdminRole.js ni import qilish

// Foydalanuvchini admin sifatida belgilash
async function addAdmin(uid) {
  try {
    // Foydalanuvchining uid'si bilan admin rolini berish
    await setAdminRole(uid); // Admin rolini berish
    console.log('Admin role has been set for user with UID:', uid);
  } catch (e) {
    console.error('Error setting admin role: ', e);
  }
}

// Bir nechta adminni qo'shish uchun funktsiya
async function addMultipleAdmins() {
  const adminUIDs = [
    '4ZNOfiV6WXhR1ApdczBa9qcS6Gp2', // Baxrom
    'Y40ZxjbYZASWHHgoRCS4p7c7PVD2', // Musulmon
    'P9FYT2mLAndxFrrSH3hq8aEROWH3', // Alisher
  ];

  for (const uid of adminUIDs) {
    await addAdmin(uid); // Har bir admin ni  qo'shish
  }
}

// Bir nechta adminni qo'shish
addMultipleAdmins();
