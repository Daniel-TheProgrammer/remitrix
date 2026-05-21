import { Counter, Registry, collectDefaultMetrics } from 'prom-client';

const globalForMetrics = globalThis as typeof globalThis & {
  remitrixMetricsRegistry?: Registry;
  remitrixHttpRequestsTotal?: Counter<string>;
};

const registry = globalForMetrics.remitrixMetricsRegistry ?? new Registry();

if (!globalForMetrics.remitrixMetricsRegistry) {
  collectDefaultMetrics({ register: registry });
  globalForMetrics.remitrixMetricsRegistry = registry;
}

const httpRequestsTotal =
  globalForMetrics.remitrixHttpRequestsTotal ??
  new Counter({
    name: 'remitrix_http_requests_total',
    help: 'Total number of HTTP requests hitting API metrics endpoint',
    registers: [registry]
  });

if (!globalForMetrics.remitrixHttpRequestsTotal) {
  globalForMetrics.remitrixHttpRequestsTotal = httpRequestsTotal;
}

export { registry, httpRequestsTotal };
