/** @jest-environment node */

import { GET } from '@/app/api/rates/route';

describe('GET /api/rates', () => {
  it('returns rates payload with expected shape', async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const payload = (await response.json()) as {
      rates: Array<{ pair: string; rate: number; previousRate: number; updatedAt: string }>;
      timestamp: string;
    };

    expect(Array.isArray(payload.rates)).toBe(true);
    expect(payload.rates).toHaveLength(5);
    payload.rates.forEach((entry) => {
      expect(entry.pair).toMatch(/^USD\//);
      expect(typeof entry.rate).toBe('number');
      expect(typeof entry.previousRate).toBe('number');
      expect(typeof entry.updatedAt).toBe('string');
    });
    expect(typeof payload.timestamp).toBe('string');
  });
});
