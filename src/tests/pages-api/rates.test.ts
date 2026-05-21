import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../pages/api/rates';

function createReqRes(method = 'GET') {
  const req = { method } as NextApiRequest;
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const res = { status, json } as unknown as NextApiResponse;
  return { req, res, json, status };
}

describe('GET /api/rates', () => {
  it('returns 200 with rates payload', () => {
    const { req, res, json, status } = createReqRes('GET');
    handler(req, res);

    expect(status).toHaveBeenCalledWith(200);
    const body = json.mock.calls[0][0];
    expect(Array.isArray(body.rates)).toBe(true);
    expect(body.rates).toHaveLength(5);
    expect(typeof body.timestamp).toBe('string');
  });
});
