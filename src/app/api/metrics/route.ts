import { NextResponse } from 'next/server';
import { httpRequestsTotal, registry } from '@/lib/metrics/registry';

export async function GET() {
  httpRequestsTotal.inc();
  const metrics = await registry.metrics();

  return new NextResponse(metrics, {
    headers: {
      'Content-Type': registry.contentType
    }
  });
}
