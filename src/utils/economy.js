import { db } from '@/config/firebase';
import { doc, getDoc, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Economy utility functions for managing TP Coins, Inventory, and Gacha Mechanics.
 */

// Awards TP Coins for test completion
export const awardTestPoints = async (userId, correctCount, totalQuestions) => {
  if (!userId) return 0;
  
  let earnedTP = correctCount; // 1 TP per correct answer
  let perfectScoreBonus = 0;

  // Perfect score bonus only for tests with more than 20 questions
  if (totalQuestions > 20 && correctCount === totalQuestions) {
    perfectScoreBonus = 5;
    earnedTP += perfectScoreBonus;
  }

  if (earnedTP > 0) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      points: increment(earnedTP) // Assuming 'points' field is used for TP coins based on firestore rules
    });
    
    // Log transaction
    await addDoc(collection(userRef, 'transactions'), {
      amount: earnedTP,
      type: 'test_reward',
      description: `Earned from test (${correctCount}/${totalQuestions})`,
      timestamp: serverTimestamp()
    });
  }
  
  return { earnedTP, perfectScoreBonus };
};

// Lootbox Drop Logic
export const openMysteryBox = async (box) => {
  const rand = Math.random() * 100;
  let selectedRarity = 'common';
  
  let accumulatedProbability = 0;
  // Box drops is an object: { common: 60, rare: 35, epic: 5, legendary: 0 }
  // We sort by probability to ensure proper threshold checks
  const dropChances = [
    { rarity: 'basic', chance: box.drops.basic || 0 },
    { rarity: 'common', chance: box.drops.common || 0 },
    { rarity: 'rare', chance: box.drops.rare || 0 },
    { rarity: 'epic', chance: box.drops.epic || 0 },
    { rarity: 'legendary', chance: box.drops.legendary || 0 }
  ];
  
  for (let dc of dropChances) {
    accumulatedProbability += dc.chance;
    if (rand <= accumulatedProbability && dc.chance > 0) {
      selectedRarity = dc.rarity;
      break;
    }
  }
  
  // Fetch items from the box itself
  let possibleItems = (box.items || []).filter(i => i.rarity === selectedRarity);
  
  // Fallback if no items for that rarity exist yet
  if (possibleItems.length === 0) {
    possibleItems = box.items || [];
  }
  
  // Pick random item
  const finalItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];
  return finalItem;
};

export const purchaseBox = async (userId, box) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) throw new Error("User not found");
  
  const userData = userSnap.data();
  const currentPoints = userData.points || 0;
  
  if (currentPoints < box.price) {
    throw new Error("Insufficient TP Coins!");
  }
  
  // Deduct points
  await updateDoc(userRef, {
    points: increment(-box.price)
  });
  
  // Determine drop
  const droppedItem = await openMysteryBox(box);
  
  // Log purchase
  await addDoc(collection(userRef, 'transactions'), {
    amount: -box.price,
    type: 'box_purchase',
    boxId: box.id || 'unknown',
    timestamp: serverTimestamp()
  });
  
  return droppedItem;
};

// Direct Purchase
export const purchaseDirectItem = async (userId, item) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) throw new Error("User not found");
  
  const userData = userSnap.data();
  const currentPoints = userData.points || 0;
  
  if (currentPoints < item.price) {
    throw new Error("Insufficient TP Coins!");
  }
  
  // Deduct points
  await updateDoc(userRef, {
    points: increment(-item.price)
  });
  
  // Add to inventory directly
  await addToInventory(userId, item);
  
  // Log purchase
  await addDoc(collection(userRef, 'transactions'), {
    amount: -item.price,
    type: 'direct_purchase',
    itemId: item.id || 'unknown',
    timestamp: serverTimestamp()
  });
  
  return item;
};

// Add to inventory
export const addToInventory = async (userId, item) => {
  const userRef = doc(db, 'users', userId);
  const inventoryRef = collection(userRef, 'inventory');
  
  const docRef = await addDoc(inventoryRef, {
    itemId: item.id,
    name: item.name,
    type: item.type, // 'frame' or 'badge'
    rarity: item.rarity,
    svg: item.svg,
    acquiredAt: serverTimestamp()
  });
  
  return docRef.id;
};

// Get standardized sell price
export const getSellPrice = (rarity) => {
  const prices = {
    basic: 20,
    common: 50,
    rare: 150,
    epic: 500,
    legendary: 1500
  };
  return prices[rarity] || 10;
};

// Quick sell item (gives back TP based on rarity)
export const quickSellItem = async (userId, itemId, sellPrice) => {
  const userRef = doc(db, 'users', userId);
  
  await updateDoc(userRef, {
    points: increment(sellPrice)
  });
  
  await addDoc(collection(userRef, 'transactions'), {
    amount: sellPrice,
    type: 'quick_sell',
    itemId: itemId,
    timestamp: serverTimestamp()
  });
};
