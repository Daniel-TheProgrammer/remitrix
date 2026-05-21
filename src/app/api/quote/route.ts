import { createQuote, getQuote, isQuoteValid } from '@/lib/mock/quotes';
import { getRateForPair } from '@/lib/mock/rates';
import { jsonResponse } from '@/lib/http/jsonResponse';

export async function POST(request: Request) {
  const body = await request.json();
  const { sendAmount, sendCurrency, receiveCurrency } = body as {
    sendAmount?: number;
    sendCurrency?: string;
    receiveCurrency?: string;
  };

  if (!sendAmount || !sendCurrency || !receiveCurrency) {
    return jsonResponse({ error: 'Missing required fields' }, 400);
  }

  const rate = getRateForPair(sendCurrency, receiveCurrency);
  if (rate === null) {
    return jsonResponse({ error: 'Unsupported currency pair' }, 400);
  }

  const quote = createQuote(sendAmount, sendCurrency, receiveCurrency, rate);
  return jsonResponse({ quote });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return jsonResponse({ error: 'Missing quote id' }, 400);
  }

  const quote = getQuote(id);
  if (!quote) {
    return jsonResponse({ error: 'Quote not found' }, 404);
  }

  return jsonResponse({ quote, valid: isQuoteValid(quote) });
}
