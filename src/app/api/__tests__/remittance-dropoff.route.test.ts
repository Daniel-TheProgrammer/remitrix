/** @jest-environment node */

import { POST } from '@/app/api/remittance-dropoff/route';

describe('POST /api/remittance-dropoff', () => {
  it('records dropoff metric and returns success payload', async () => {
    const response = await POST();
    expect(response.status).toBe(200);

    const payload = (await response.json()) as { recorded: boolean };
    expect(payload).toEqual({ recorded: true });
  });
});
