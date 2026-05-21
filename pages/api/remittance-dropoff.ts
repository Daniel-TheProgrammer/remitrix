import type { NextApiRequest, NextApiResponse } from 'next';
import { remittanceDropoffTotal } from '@/lib/metrics/registry';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  remittanceDropoffTotal.inc();
  return res.status(200).json({ recorded: true });
}
