/** @jest-environment node */

import { GET } from '@/app/api/metrics/route';

if (!global.setImmediate) {
  global.setImmediate = ((callback: (...args: unknown[]) => void) => setTimeout(callback, 0)) as unknown as typeof setImmediate;
}

describe('GET /api/metrics', () => {
  it('returns prometheus text payload', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/plain');

    const body = await response.text();
    expect(body).toContain('remitrix_http_requests_total');
  });
});
