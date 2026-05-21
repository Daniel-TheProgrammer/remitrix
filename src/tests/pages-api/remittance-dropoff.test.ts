import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../pages/api/remittance-dropoff';

function createReqRes(method: string) {
  const req = { method } as NextApiRequest;
  const json = jest.fn();
  const setHeader = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const res = { status, json, setHeader } as unknown as NextApiResponse;
  return { req, res, json, status, setHeader };
}

describe('/api/remittance-dropoff', () => {
  it('records dropoff on POST', () => {
    const { req, res, status } = createReqRes('POST');
    handler(req, res);
    expect(status).toHaveBeenCalledWith(200);
  });

  it('returns 405 on GET', () => {
    const { req, res, status, setHeader } = createReqRes('GET');
    handler(req, res);

    expect(setHeader).toHaveBeenCalledWith('Allow', ['POST']);
    expect(status).toHaveBeenCalledWith(405);
  });
});
