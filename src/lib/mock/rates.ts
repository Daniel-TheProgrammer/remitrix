/**
 * Mock exchange rate data with simulated fluctuations.
 * Base currency: USD
 */

export interface RateEntry {
  pair: string;
  rate: number;
  previousRate: number;
  updatedAt: string;
}

const baseRates: Record<string, number> = {
  EUR: 0.9215,
  GBP: 0.7892,
  JPY: 149.85,
  CAD: 1.3642,
  AUD: 1.5387
};

function fluctuate(base: number): number {
  const variance = base * 0.002;
  const delta = (Math.random() - 0.5) * 2 * variance;
  return parseFloat((base + delta).toFixed(4));
}

let previousRates: Record<string, number> = { ...baseRates };
let currentRates: Record<string, number> = { ...baseRates };

export function getMockRates(): RateEntry[] {
  previousRates = { ...currentRates };
  currentRates = Object.fromEntries(
    Object.entries(baseRates).map(([currency, base]) => [currency, fluctuate(base)])
  );

  return Object.entries(currentRates).map(([currency, rate]) => ({
    pair: `USD/${currency}`,
    rate,
    previousRate: previousRates[currency],
    updatedAt: new Date().toISOString()
  }));
}

export function getRateForPair(from: string, to: string): number | null {
  if (from === 'USD') return currentRates[to] ?? null;
  if (to === 'USD') {
    const r = currentRates[from];
    return r ? parseFloat((1 / r).toFixed(4)) : null;
  }
  const fromToUsd = currentRates[from];
  const usdToTarget = currentRates[to];
  if (!fromToUsd || !usdToTarget) return null;
  return parseFloat((usdToTarget / fromToUsd).toFixed(4));
}
