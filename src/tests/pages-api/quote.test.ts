import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../pages/api/quote';
import { getMockRates } from '@/lib/mock/rates';

function createReqRes(method: string, body?: object, query?: Record<string, string>) {
  const req = { method, body: body || {}, query: query || {} } as unknown as NextApiRequest;
  const json = jest.fn();
  const send = jest.fn();
  const setHeader = jest.fn();
  const status = jest.fn().mockReturnValue({ json, send });
  const res = { status, json, send, setHeader } as unknown as NextApiResponse;
  return { req, res, json, status, setHeader };
}

describe('/api/quote', () => {
  beforeAll(() => {
    getMockRates();
  });

  it('creates quote on POST', () => {
    const { req, res, json, status } = createReqRes('POST', {
      sendAmount: 100,
      sendCurrency: 'USD',
      receiveCurrency: 'EUR'
    });

    handler(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json.mock.calls[0][0].quote).toBeTruthy();
  });

  it('rejects unsupported pair', () => {
    const { req, res, status } = createReqRes('POST', {
      sendAmount: 100,
      sendCurrency: 'USD',
      receiveCurrency: 'XYZ'
    });

    handler(req, res);
    expect(status).toHaveBeenCalledWith(400);
  });

  it('reads quote with GET id', () => {
    const created = createReqRes('POST', {
      sendAmount: 200,
      sendCurrency: 'USD',
      receiveCurrency: 'GBP'
    });
    handler(created.req, created.res);
    const quoteId = created.json.mock.calls[0][0].quote.id;

    const { req, res, status } = createReqRes('GET', undefined, { id: quoteId });
    handler(req, res);
    expect(status).toHaveBeenCalledWith(200);
  });

  it('returns 405 for unsupported methods', () => {
    const { req, res, status, setHeader } = createReqRes('PUT');
    handler(req, res);

    expect(setHeader).toHaveBeenCalledWith('Allow', ['GET', 'POST']);
    expect(status).toHaveBeenCalledWith(405);
  });
});
