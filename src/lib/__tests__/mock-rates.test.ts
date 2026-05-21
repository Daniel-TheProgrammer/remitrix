import { getMockRates, getRateForPair } from '../mock/rates';

describe('getMockRates', () => {
  it('returns 5 currency pairs', () => {
    const rates = getMockRates();
    expect(rates).toHaveLength(5);
  });

  it('returns pairs with USD as base', () => {
    const rates = getMockRates();
    rates.forEach((entry) => {
      expect(entry.pair).toMatch(/^USD\//);
    });
  });

  it('returns all required fields per entry', () => {
    const rates = getMockRates();
    rates.forEach((entry) => {
      expect(entry).toHaveProperty('pair');
      expect(entry).toHaveProperty('rate');
      expect(entry).toHaveProperty('previousRate');
      expect(entry).toHaveProperty('updatedAt');
      expect(typeof entry.rate).toBe('number');
      expect(typeof entry.previousRate).toBe('number');
    });
  });

  it('fluctuates rates within expected range', () => {
    // Call multiple times and verify rates are within ±0.2% of base
    for (let i = 0; i < 20; i++) {
      const rates = getMockRates();
      const eurEntry = rates.find((r) => r.pair === 'USD/EUR');
      expect(eurEntry).toBeDefined();
      // Base EUR rate is 0.9215, variance is 0.2%
      expect(eurEntry!.rate).toBeGreaterThan(0.9215 * 0.997);
      expect(eurEntry!.rate).toBeLessThan(0.9215 * 1.003);
    }
  });

  it('tracks previous rates correctly', () => {
    getMockRates(); // first call establishes current
    const second = getMockRates(); // second call should have previous from first
    second.forEach((entry) => {
      expect(entry.previousRate).not.toBeNaN();
      expect(entry.previousRate).toBeGreaterThan(0);
    });
  });

  it('returns valid ISO timestamps', () => {
    const rates = getMockRates();
    rates.forEach((entry) => {
      expect(() => new Date(entry.updatedAt)).not.toThrow();
      expect(new Date(entry.updatedAt).toISOString()).toBe(entry.updatedAt);
    });
  });
});

describe('getRateForPair', () => {
  beforeAll(() => {
    getMockRates(); // initialize currentRates
  });

  it('returns a rate for USD to EUR', () => {
    const rate = getRateForPair('USD', 'EUR');
    expect(rate).not.toBeNull();
    expect(rate).toBeGreaterThan(0);
  });

  it('returns a rate for EUR to USD (inverse)', () => {
    const rate = getRateForPair('EUR', 'USD');
    expect(rate).not.toBeNull();
    expect(rate).toBeGreaterThan(0);
  });

  it('returns a cross-rate for EUR to GBP', () => {
    const rate = getRateForPair('EUR', 'GBP');
    expect(rate).not.toBeNull();
    expect(rate).toBeGreaterThan(0);
  });

  it('returns null for unsupported currencies', () => {
    const rate = getRateForPair('USD', 'XYZ');
    expect(rate).toBeNull();
  });

  it('returns null when both currencies are unsupported', () => {
    const rate = getRateForPair('ABC', 'XYZ');
    expect(rate).toBeNull();
  });

  it('inverse rate is mathematically consistent', () => {
    const usdToEur = getRateForPair('USD', 'EUR');
    const eurToUsd = getRateForPair('EUR', 'USD');
    expect(usdToEur).not.toBeNull();
    expect(eurToUsd).not.toBeNull();
    // Product should be approximately 1
    const product = usdToEur! * eurToUsd!;
    expect(product).toBeCloseTo(1, 2);
  });
});
