import { remittanceDropoffTotal } from '@/lib/metrics/registry';
import { jsonResponse } from '@/lib/http/jsonResponse';

export async function POST() {
  remittanceDropoffTotal.inc();
  return jsonResponse({ recorded: true });
}
