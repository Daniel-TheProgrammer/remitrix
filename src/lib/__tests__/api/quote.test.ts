import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../../pages/api/quote';
import { getMockRates } from '@/lib/mock/rates';

function createMockReqRes(method: string, body?: object, query?: Record<string, string>) {
  const req = {
    method,
    body: body || {},
    query: query || {}
  } as unknown as NextApiRequest;

  const jsonFn = jest.fn();
  const sendFn = jest.fn();
  const setHeaderFn = jest.fn();
  const statusFn = jest.fn().mockReturnValue({ json: jsonFn, send: sendFn });
  const res = {
    status: statusFn,
    json: jsonFn,
    send: sendFn,
    setHeader: setHeaderFn
  } as unknown as NextApiResponse;

  return { req, res, jsonFn, statusFn, setHeaderFn };
}

describe('POST /api/quote', () => {
  beforeAll(() => {
    getMockRates(); // initialize rates
  });

  it('creates a quote for valid inputs', () => {
    const { req, res, jsonFn, statusFn } = createMockReqRes('POST', {
      sendAmount: 100,
      sendCurrency: 'USD',
      receiveCurrency: 'EUR'
    });

    handler(req, res);

    expect(statusFn).toHaveBeenCalledWith(200);
    const body = jsonFn.mock.calls[0][0];
    expect(body).toHaveProperty('quote');
    expect(body.quote).toHaveProperty('id');
    expect(body.quote.sendAmount).toBe(100);
    expect(body.quote.fee).toBe(2);
    expect(body.quote.receiveAmount).toBeGreaterThan(0);
  });

  it('returns 400 for missing fields', () => {
    const { req, res, jsonFn, statusFn } = createMockReqRes('POST', {
      sendAmount: 100
      // missing sendCurrency and receiveCurrency
    });

    handler(req, res);

    expect(statusFn).toHaveBeenCalledWith(400);
    expect(jsonFn.mock.calls[0][0]).toHaveProperty('error');
  });

  it('returns 400 for unsupported currency pair', () => {
    const { req, res, jsonFn, statusFn } = createMockReqRes('POST', {
      sendAmount: 100,
      sendCurrency: 'USD',
      receiveCurrency: 'XYZ'
    });

    handler(req, res);

    expect(statusFn).toHaveBeenCalledWith(400);
    expect(jsonFn.mock.calls[0][0].error).toContain('Unsupported');
  });
});

describe('GET /api/quote', () => {
  it('returns 400 when id is missing', () => {
    const { req, res, jsonFn, statusFn } = createMockReqRes('GET', undefined, {});

    handler(req, res);

    expect(statusFn).toHaveBeenCalledWith(400);
    expect(jsonFn.mock.calls[0][0].error).toContain('Missing');
  });

  it('returns 404 for non-existent quote', () => {
    const { req, res, jsonFn, statusFn } = createMockReqRes('GET', undefined, {
      id: 'fake-id'
    });

    handler(req, res);

    expect(statusFn).toHaveBeenCalledWith(404);
  });

  it('retrieves a previously created quote', () => {
    // First create a quote
    const createReqRes = createMockReqRes('POST', {
      sendAmount: 200,
      sendCurrency: 'USD',
      receiveCurrency: 'GBP'
    });
    handler(createReqRes.req, createReqRes.res);
    const quoteId = createReqRes.jsonFn.mock.calls[0][0].quote.id;

    // Then retrieve it
    const { req, res, jsonFn, statusFn } = createMockReqRes('GET', undefined, {
      id: quoteId
    });
    handler(req, res);

    expect(statusFn).toHaveBeenCalledWith(200);
    const body = jsonFn.mock.calls[0][0];
    expect(body.quote.id).toBe(quoteId);
    expect(body.valid).toBe(true);
  });
});

describe('Unsupported methods', () => {
  it('returns 405 for PUT', () => {
    const { req, res, jsonFn, statusFn, setHeaderFn } = createMockReqRes('PUT');

    handler(req, res);

    expect(setHeaderFn).toHaveBeenCalledWith('Allow', ['GET', 'POST']);
    expect(statusFn).toHaveBeenCalledWith(405);
  });
});
