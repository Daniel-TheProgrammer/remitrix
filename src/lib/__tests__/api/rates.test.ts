import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../../pages/api/rates';

function createMockReqRes(method = 'GET') {
  const req = { method } as NextApiRequest;
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const res = { status, json } as unknown as NextApiResponse;
  return { req, res, json, status };
}

describe('GET /api/rates', () => {
  it('returns 200 with rates array and timestamp', () => {
    const { req, res, json, status } = createMockReqRes();
    handler(req, res);

    expect(status).toHaveBeenCalledWith(200);
    const body = json.mock.calls[0][0];
    expect(body).toHaveProperty('rates');
    expect(body).toHaveProperty('timestamp');
    expect(Array.isArray(body.rates)).toBe(true);
    expect(body.rates).toHaveLength(5);
  });

  it('returns rates with correct structure', () => {
    const { req, res, json, status } = createMockReqRes();
    handler(req, res);

    const body = json.mock.calls[0][0];
    body.rates.forEach((entry: { pair: string; rate: number; previousRate: number; updatedAt: string }) => {
      expect(entry.pair).toMatch(/^USD\//);
      expect(typeof entry.rate).toBe('number');
      expect(typeof entry.previousRate).toBe('number');
      expect(typeof entry.updatedAt).toBe('string');
    });
  });
});
