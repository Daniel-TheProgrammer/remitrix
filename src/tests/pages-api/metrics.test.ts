import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../pages/api/metrics';

function createReqRes(method = 'GET') {
  const req = { method } as NextApiRequest;
  const send = jest.fn();
  const setHeader = jest.fn();
  const status = jest.fn().mockReturnValue({ send });
  const res = { status, send, setHeader } as unknown as NextApiResponse;
  return { req, res, send, status, setHeader };
}

describe('/api/metrics', () => {
  it('returns prometheus payload', async () => {
    const { req, res, send, status, setHeader } = createReqRes('GET');
    await handler(req, res);

    expect(setHeader).toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(200);
    expect(typeof send.mock.calls[0][0]).toBe('string');
  });
});
