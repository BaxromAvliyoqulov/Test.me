import { setAdminRole } from './setAdmin';

async function addAdmin(uid) {
  try {
    await setAdminRole(uid);
    console.log('Admin role has been set for user with UID:', uid);
  } catch (e) {
    console.error('Error setting admin role: ', e);
  }
}

async function addMultipleAdmins() {
  const adminUIDs = [
    '4ZNOfiV6WXhR1ApdczBa9qcS6Gp2', // Baxrom
  ];

  for (const uid of adminUIDs) {
    await addAdmin(uid);
  }
}
addMultipleAdmins();
