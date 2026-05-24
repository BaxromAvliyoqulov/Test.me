/**
 * Rank system logic
 */

export function getRankName(points, locale = 'UZB') {
  if (points >= 1000) return locale === 'RUS' ? 'Грандмастер' : 'Grandmaster Scholar';
  if (points >= 600) return locale === 'RUS' ? 'Золотой Ученик' : 'Gold Scholar';
  if (points >= 300) return locale === 'RUS' ? 'Серебряный Ученик' : 'Silver Scholar';
  if (points >= 100) return locale === 'RUS' ? 'Бронзовый Ученик' : 'Bronze Scholar';
  return locale === 'RUS' ? 'Новичок' : 'Newbie Scholar';
}

export function getRankClass(points) {
  if (points >= 1000) return 'rank-grandmaster';
  if (points >= 600) return 'rank-gold';
  if (points >= 300) return 'rank-silver';
  if (points >= 100) return 'rank-bronze';
  return 'rank-newbie';
}

export function getRankIcon(points) {
  if (points >= 1000) return 'fas fa-crown';
  if (points >= 600) return 'fas fa-medal';
  if (points >= 300) return 'fas fa-award';
  if (points >= 100) return 'fas fa-shield-halved';
  return 'fas fa-seedling';
}

export function getNextRankInfo(points, locale = 'UZB') {
  if (points >= 1000) {
    return {
      nextRankName: locale === 'RUS' ? 'Макс. Ранг' : 'Max Rank',
      pointsNeeded: 0,
      progressPercent: 100,
      label: `${points} TP`
    };
  }
  
  let currentRankMin = 0;
  let nextRankMax = 100;
  let nextRankName = locale === 'RUS' ? 'Бронзовый Ученик' : 'Bronze Scholar';
  
  if (points >= 600) {
    currentRankMin = 600;
    nextRankMax = 1000;
    nextRankName = locale === 'RUS' ? 'Грандмастер' : 'Grandmaster Scholar';
  } else if (points >= 300) {
    currentRankMin = 300;
    nextRankMax = 600;
    nextRankName = locale === 'RUS' ? 'Золотой Ученик' : 'Gold Scholar';
  } else if (points >= 100) {
    currentRankMin = 100;
    nextRankMax = 300;
    nextRankName = locale === 'RUS' ? 'Серебряный Ученик' : 'Silver Scholar';
  }
  
  const range = nextRankMax - currentRankMin;
  const progress = points - currentRankMin;
  const progressPercent = Math.min(Math.round((progress / range) * 100), 100);
  
  return {
    nextRankName,
    pointsNeeded: nextRankMax - points,
    progressPercent,
    label: `${points} / ${nextRankMax} TP`
  };
}
