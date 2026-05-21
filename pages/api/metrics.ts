import type { NextApiRequest, NextApiResponse } from 'next';
import { httpRequestsTotal, registry } from '@/lib/metrics/registry';

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  httpRequestsTotal.inc();
  const metrics = await registry.metrics();
  res.setHeader('Content-Type', registry.contentType);
  res.status(200).send(metrics);
}
