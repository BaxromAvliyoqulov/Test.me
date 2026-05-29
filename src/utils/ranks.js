/**
 * Comprehensive Rank System Logic
 */

export const ranksData = [
  { id: 'newbie', min: 0, max: 100, class: 'rank-newbie', icon: 'fas fa-seedling', nameUz: 'Newbie Scholar', nameRu: 'Новичок', reward: 0 },
  { id: 'bronze', min: 100, max: 300, class: 'rank-bronze', icon: 'fas fa-shield-halved', nameUz: 'Bronze Scholar', nameRu: 'Бронзовый Ученик', reward: 500 },
  { id: 'silver', min: 300, max: 600, class: 'rank-silver', icon: 'fas fa-medal', nameUz: 'Silver Scholar', nameRu: 'Серебряный Ученик', reward: 1000 },
  { id: 'gold', min: 600, max: 1000, class: 'rank-gold', icon: 'fas fa-award', nameUz: 'Gold Scholar', nameRu: 'Золотой Ученик', reward: 2000 },
  { id: 'platinum', min: 1000, max: 1500, class: 'rank-platinum', icon: 'fas fa-star', nameUz: 'Platinum Scholar', nameRu: 'Платиновый Ученик', reward: 3500 },
  { id: 'diamond', min: 1500, max: 2500, class: 'rank-diamond', icon: 'fas fa-gem', nameUz: 'Diamond Expert', nameRu: 'Алмазный Эксперт', reward: 5000 },
  { id: 'master', min: 2500, max: 4000, class: 'rank-master', icon: 'fas fa-chess-knight', nameUz: 'Master', nameRu: 'Мастер', reward: 10000 },
  { id: 'grandmaster', min: 4000, max: 7000, class: 'rank-grandmaster', icon: 'fas fa-chess-king', nameUz: 'Grandmaster', nameRu: 'Грандмастер', reward: 15000 },
  { id: 'legendary', min: 7000, max: 10000, class: 'rank-legendary', icon: 'fas fa-crown', nameUz: 'Legendary', nameRu: 'Легенда', reward: 25000 },
  { id: 'mythic', min: 10000, max: Infinity, class: 'rank-mythic', icon: 'fas fa-dragon', nameUz: 'Mythic', nameRu: 'Мифический', reward: 50000 }
];

function getCurrentRankObj(points) {
  for (let i = ranksData.length - 1; i >= 0; i--) {
    if (points >= ranksData[i].min) {
      return { rank: ranksData[i], index: i };
    }
  }
  return { rank: ranksData[0], index: 0 };
}

export function getRankName(points, locale = 'UZB') {
  const { rank } = getCurrentRankObj(points);
  return locale === 'RUS' ? rank.nameRu : rank.nameUz;
}

export function getRankClass(points) {
  return getCurrentRankObj(points).rank.class;
}

export function getRankIcon(points) {
  return getCurrentRankObj(points).rank.icon;
}

export function getNextRankInfo(points, locale = 'UZB') {
  const { rank, index } = getCurrentRankObj(points);
  
  if (index === ranksData.length - 1) {
    return {
      nextRankName: locale === 'RUS' ? 'Макс. Ранг' : 'Max Rank',
      pointsNeeded: 0,
      progressPercent: 100,
      label: `${points} TP`
    };
  }
  
  const nextRank = ranksData[index + 1];
  const range = nextRank.min - rank.min;
  const progress = points - rank.min;
  const progressPercent = Math.min(Math.round((progress / range) * 100), 100);
  
  return {
    nextRankName: locale === 'RUS' ? nextRank.nameRu : nextRank.nameUz,
    pointsNeeded: nextRank.min - points,
    progressPercent,
    label: `${points} / ${nextRank.min} TP`
  };
}
