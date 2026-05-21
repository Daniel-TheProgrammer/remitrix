/**
 * Mock quote locking store.
 * Simulates server-side quote management with expiry.
 */

export interface Quote {
  id: string;
  sendAmount: number;
  sendCurrency: string;
  receiveCurrency: string;
  receiveAmount: number;
  rate: number;
  fee: number;
  lockedAt: number;
  expiresAt: number;
}

const QUOTE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const globalForQuotes = globalThis as typeof globalThis & {
  remitrixQuoteStore?: Map<string, Quote>;
};

const quoteStore = globalForQuotes.remitrixQuoteStore ?? new Map<string, Quote>();
if (!globalForQuotes.remitrixQuoteStore) {
  globalForQuotes.remitrixQuoteStore = quoteStore;
}

export function createQuote(
  sendAmount: number,
  sendCurrency: string,
  receiveCurrency: string,
  rate: number
): Quote {
  const fee = 2.0;
  const netSend = sendAmount - fee;
  const receiveAmount = parseFloat((netSend * rate).toFixed(2));
  const now = Date.now();

  const quote: Quote = {
    id: `QT-${now}-${Math.random().toString(36).slice(2, 8)}`,
    sendAmount,
    sendCurrency,
    receiveCurrency,
    receiveAmount,
    rate,
    fee,
    lockedAt: now,
    expiresAt: now + QUOTE_TTL_MS
  };

  quoteStore.set(quote.id, quote);
  return quote;
}

export function getQuote(id: string): Quote | null {
  return quoteStore.get(id) ?? null;
}

export function isQuoteValid(quote: Quote): boolean {
  return Date.now() < quote.expiresAt;
}
