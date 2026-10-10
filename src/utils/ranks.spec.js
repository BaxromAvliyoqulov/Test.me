import { describe, it, expect } from 'vitest';
import { getRankName, getRankClass, getRankIcon, getNextRankInfo, ranksData } from './ranks';

describe('Ranks System Logic', () => {
  it('should return correct rank name for 0 points', () => {
    expect(getRankName(0, 'UZB')).toBe('Newbie Scholar');
    expect(getRankName(0, 'RUS')).toBe('Новичок');
  });

  it('should return Bronze Scholar for 150 points', () => {
    expect(getRankName(150, 'UZB')).toBe('Bronze Scholar');
    expect(getRankClass(150)).toBe('rank-bronze');
  });

  it('should return Master for 3000 points', () => {
    expect(getRankName(3000, 'UZB')).toBe('Master');
    expect(getRankIcon(3000)).toBe('fas fa-chess-knight');
  });

  it('should return Mythic for 15000 points', () => {
    expect(getRankName(15000, 'UZB')).toBe('Mythic');
    expect(getRankClass(15000)).toBe('rank-mythic');
  });

  it('should calculate next rank progress correctly', () => {
    // Bronze: min 100, max 300. Points = 200 -> 50%
    const nextInfo = getNextRankInfo(200, 'UZB');
    expect(nextInfo.nextRankName).toBe('Silver Scholar');
    expect(nextInfo.pointsNeeded).toBe(100);
    expect(nextInfo.progressPercent).toBe(50);
  });

  it('should handle Max Rank when user reaches Mythic (10000+ points)', () => {
    const maxInfo = getNextRankInfo(12000, 'UZB');
    expect(maxInfo.nextRankName).toBe('Max Rank');
    expect(maxInfo.progressPercent).toBe(100);
    expect(maxInfo.pointsNeeded).toBe(0);
  });
});
