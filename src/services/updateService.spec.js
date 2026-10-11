// src/services/updateService.spec.js
import { describe, it, expect, vi } from 'vitest';

vi.mock('virtual:pwa-register', () => ({
  registerSW: vi.fn(() => vi.fn()),
}));

import { updateService } from './updateService';
import { APP_VERSION, RELEASE_DATE } from '@/config/version';

describe('PWA Update Service and Version Config', () => {
  it('exports valid semantic APP_VERSION and RELEASE_DATE', () => {
    expect(APP_VERSION).toMatch(/^v\d+\.\d+\.\d+/);
    expect(RELEASE_DATE).toBeDefined();
    expect(RELEASE_DATE.length).toBeGreaterThan(0);
  });

  it('provides reactive update state and inspection methods', () => {
    expect(updateService.version).toBe(APP_VERSION);
    expect(typeof updateService.checkForUpdates).toBe('function');
    expect(typeof updateService.acceptUpdate).toBe('function');
  });

  it('checkForUpdates safely resolves without crashing', async () => {
    const result = await updateService.checkForUpdates();
    expect(result).toHaveProperty('hasUpdate');
  });
});
