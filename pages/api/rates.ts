import type { NextApiRequest, NextApiResponse } from 'next';
import { getMockRates } from '@/lib/mock/rates';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const rates = getMockRates();
  res.status(200).json({ rates, timestamp: new Date().toISOString() });
}
