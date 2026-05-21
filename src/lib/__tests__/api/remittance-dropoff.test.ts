import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../../pages/api/remittance-dropoff';

function createMockReqRes(method: string) {
  const req = { method } as NextApiRequest;
  const jsonFn = jest.fn();
  const setHeaderFn = jest.fn();
  const statusFn = jest.fn().mockReturnValue({ json: jsonFn });
  const res = {
    status: statusFn,
    json: jsonFn,
    setHeader: setHeaderFn
  } as unknown as NextApiResponse;

  return { req, res, jsonFn, statusFn, setHeaderFn };
}

describe('POST /api/remittance-dropoff', () => {
  it('returns 200 and records the metric', () => {
    const { req, res, jsonFn, statusFn } = createMockReqRes('POST');
    handler(req, res);

    expect(statusFn).toHaveBeenCalledWith(200);
    expect(jsonFn.mock.calls[0][0]).toEqual({ recorded: true });
  });

  it('returns 405 for GET', () => {
    const { req, res, statusFn, setHeaderFn } = createMockReqRes('GET');
    handler(req, res);

    expect(setHeaderFn).toHaveBeenCalledWith('Allow', ['POST']);
    expect(statusFn).toHaveBeenCalledWith(405);
  });
});
