import { getMockRates } from '@/lib/mock/rates';
import { jsonResponse } from '@/lib/http/jsonResponse';

export async function GET() {
  const rates = getMockRates();
  return jsonResponse({ rates, timestamp: new Date().toISOString() });
}
