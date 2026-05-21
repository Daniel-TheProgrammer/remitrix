import { createQuote, getQuote, isQuoteValid } from '../mock/quotes';

describe('createQuote', () => {
  it('creates a quote with correct fields', () => {
    const quote = createQuote(100, 'USD', 'EUR', 0.92);
    expect(quote).toHaveProperty('id');
    expect(quote).toHaveProperty('sendAmount', 100);
    expect(quote).toHaveProperty('sendCurrency', 'USD');
    expect(quote).toHaveProperty('receiveCurrency', 'EUR');
    expect(quote).toHaveProperty('receiveAmount');
    expect(quote).toHaveProperty('rate', 0.92);
    expect(quote).toHaveProperty('fee', 2);
    expect(quote).toHaveProperty('lockedAt');
    expect(quote).toHaveProperty('expiresAt');
  });

  it('applies a fixed $2 fee before conversion', () => {
    const quote = createQuote(100, 'USD', 'EUR', 1.0);
    // (100 - 2) * 1.0 = 98.00
    expect(quote.receiveAmount).toBe(98.0);
  });

  it('calculates receive amount correctly with rate', () => {
    const quote = createQuote(50, 'USD', 'EUR', 0.92);
    // (50 - 2) * 0.92 = 44.16
    expect(quote.receiveAmount).toBe(44.16);
  });

  it('generates unique IDs', () => {
    const q1 = createQuote(100, 'USD', 'EUR', 0.92);
    const q2 = createQuote(100, 'USD', 'EUR', 0.92);
    expect(q1.id).not.toBe(q2.id);
  });

  it('sets expiresAt to 5 minutes after lockedAt', () => {
    const quote = createQuote(100, 'USD', 'EUR', 0.92);
    const ttl = quote.expiresAt - quote.lockedAt;
    expect(ttl).toBe(5 * 60 * 1000);
  });
});

describe('getQuote', () => {
  it('retrieves a stored quote by ID', () => {
    const created = createQuote(200, 'USD', 'GBP', 0.79);
    const retrieved = getQuote(created.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.id).toBe(created.id);
    expect(retrieved!.sendAmount).toBe(200);
  });

  it('returns null for non-existent ID', () => {
    const result = getQuote('non-existent-id');
    expect(result).toBeNull();
  });
});

describe('isQuoteValid', () => {
  it('returns true for a freshly created quote', () => {
    const quote = createQuote(100, 'USD', 'EUR', 0.92);
    expect(isQuoteValid(quote)).toBe(true);
  });

  it('returns false for an expired quote', () => {
    const quote = createQuote(100, 'USD', 'EUR', 0.92);
    // Manually set expiresAt to the past
    const expiredQuote = { ...quote, expiresAt: Date.now() - 1000 };
    expect(isQuoteValid(expiredQuote)).toBe(false);
  });
});
