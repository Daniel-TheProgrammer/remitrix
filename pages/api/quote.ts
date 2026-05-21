import type { NextApiRequest, NextApiResponse } from 'next';
import { createQuote, getQuote, isQuoteValid } from '@/lib/mock/quotes';
import { getRateForPair } from '@/lib/mock/rates';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { sendAmount, sendCurrency, receiveCurrency } = req.body as {
      sendAmount?: number;
      sendCurrency?: string;
      receiveCurrency?: string;
    };

    if (!sendAmount || !sendCurrency || !receiveCurrency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const rate = getRateForPair(sendCurrency, receiveCurrency);
    if (rate === null) {
      return res.status(400).json({ error: 'Unsupported currency pair' });
    }

    const quote = createQuote(sendAmount, sendCurrency, receiveCurrency, rate);
    return res.status(200).json({ quote });
  }

  if (req.method === 'GET') {
    const id = typeof req.query.id === 'string' ? req.query.id : undefined;

    if (!id) {
      return res.status(400).json({ error: 'Missing quote id' });
    }

    const quote = getQuote(id);
    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    return res.status(200).json({ quote, valid: isQuoteValid(quote) });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Method not allowed' });
}
