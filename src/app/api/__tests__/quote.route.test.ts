/** @jest-environment node */

import { GET, POST } from '@/app/api/quote/route';
import { getMockRates } from '@/lib/mock/rates';
import { createJsonRequest } from '@/lib/testing/createJsonRequest';

describe('/api/quote route handlers', () => {
  beforeAll(() => {
    getMockRates();
  });

  it('creates quote for valid payload', async () => {
    const req = createJsonRequest('http://localhost/api/quote', 'POST', {
      sendAmount: 120,
      sendCurrency: 'USD',
      receiveCurrency: 'EUR'
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    const payload = (await response.json()) as { quote: { id: string; fee: number; receiveAmount: number } };
    expect(payload.quote.id).toBeTruthy();
    expect(payload.quote.fee).toBe(2);
    expect(payload.quote.receiveAmount).toBeGreaterThan(0);
  });

  it('returns 400 for unsupported pair', async () => {
    const req = createJsonRequest('http://localhost/api/quote', 'POST', {
      sendAmount: 120,
      sendCurrency: 'USD',
      receiveCurrency: 'XYZ'
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });

  it('returns 400 when id is missing', async () => {
    const response = await GET(new Request('http://localhost/api/quote'));
    expect(response.status).toBe(400);
  });

  it('returns quote by id after creation', async () => {
    const createReq = createJsonRequest('http://localhost/api/quote', 'POST', {
      sendAmount: 200,
      sendCurrency: 'USD',
      receiveCurrency: 'GBP'
    });

    const createRes = await POST(createReq);
    const created = (await createRes.json()) as { quote: { id: string } };

    const readRes = await GET(new Request(`http://localhost/api/quote?id=${created.quote.id}`));
    expect(readRes.status).toBe(200);
    const readPayload = (await readRes.json()) as { quote: { id: string }; valid: boolean };
    expect(readPayload.quote.id).toBe(created.quote.id);
    expect(readPayload.valid).toBe(true);
  });
});
