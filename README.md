# Remitrix Frontend Foundation

Production-oriented frontend initialization using:

- Next.js 13.1.1 (App Router)
- React 18.2.0 + react-dom 18.2.0
- TypeScript 4.5.x
- Sass (`.scss` / `.module.scss`)
- i18n (`next-i18next`, `i18next`, `react-i18next`, `i18next-http-backend`, `i18next-localstorage-backend`, `i18next-chained-backend`)
- Metrics with `prom-client`

## Architecture

This repo follows **separation of concerns** with an **Atomic Design** approach:

- `src/components/atoms`: foundational UI primitives
- `src/components/molecules`: composed small units
- `src/components/organisms`: larger sections
- `src/components/templates`: page composition structure
- `src/features`: feature-scoped modules (empty scaffold)
- `src/lib/i18n`: i18n bootstrapping/provider/config
- `src/lib/metrics`: Prometheus metrics registry
- `src/app`: route entry points and API routes

## Development

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Metrics endpoint

- `GET /api/metrics` returns Prometheus metrics

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run typecheck`
