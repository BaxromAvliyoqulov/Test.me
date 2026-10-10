import { describe, it, expect } from 'vitest';
import { sortLevels } from './sorters';

describe('sortLevels Utility', () => {
  it('should sort grades numerically ("5-sinf", "6-sinf", "10-sinf")', () => {
    const raw = ['10-sinf', '5-sinf', '8-sinf', '6-sinf'];
    const sorted = sortLevels(raw);
    expect(sorted).toEqual(['5-sinf', '6-sinf', '8-sinf', '10-sinf']);
  });

  it('should sort English levels in standard pedagogical order', () => {
    const raw = ['advanced', 'elementary', 'beginner', 'intermediate'];
    const sorted = sortLevels(raw);
    expect(sorted).toEqual(['beginner', 'elementary', 'intermediate', 'advanced']);
  });

  it('should sort CEFR levels correctly (a1, a2, b1, b2, c1, c2)', () => {
    const raw = ['c1', 'a1', 'b2', 'a2', 'b1'];
    const sorted = sortLevels(raw);
    expect(sorted).toEqual(['a1', 'a2', 'b1', 'b2', 'c1']);
  });

  it('should handle array of objects with id property', () => {
    const raw = [{ id: 'intermediate' }, { id: 'beginner' }, { id: 'elementary' }];
    const sorted = sortLevels(raw);
    expect(sorted.map(s => s.id)).toEqual(['beginner', 'elementary', 'intermediate']);
  });

  it('should handle empty or null values gracefully without crashing', () => {
    expect(sortLevels([])).toEqual([]);
    expect(sortLevels(['', 'math', ''])).toBeDefined();
  });
});
