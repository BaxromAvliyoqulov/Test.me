import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateJoinCode, teacherService } from './teacherService';
import { supabase } from '@/config/supabase';

vi.mock('@/config/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'class-1', name: 'Test Class' }, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'class-1', name: 'Test Class', is_active: true }, error: null }),
    })),
  },
}));

describe('Teacher LMS Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates a valid 7-character uppercase join code with TM- prefix', () => {
    const code = generateJoinCode();
    expect(code).toBeDefined();
    expect(code.startsWith('TM-')).toBe(true);
    expect(code.length).toBe(7);
    expect(code).toBe(code.toUpperCase());
  });

  it('generates unique join codes on successive calls', () => {
    const codes = new Set();
    for (let i = 0; i < 50; i++) {
      codes.add(generateJoinCode());
    }
    expect(codes.size).toBe(50);
  });

  it('returns empty array when teacherId is null or empty', async () => {
    const res = await teacherService.getClasses(null);
    expect(res).toEqual([]);
  });
});
