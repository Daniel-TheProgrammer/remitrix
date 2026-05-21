# Remitrix — Currency Conversion & Remittance Interface

A customer-facing cross-border remittance service featuring real-time exchange rates, multi-step transfer wizards, and locale-aware formatting.

## Tech Stack

- **Next.js 13.1.1** (App Router)
- **React 18.2.0** + react-dom 18.2.0
- **TypeScript 4.5.x**
- **Sass** (`.module.scss`)
- **i18n**: `i18next`, `react-i18next`, `i18next-chained-backend`, `i18next-http-backend`, `i18next-localstorage-backend`, `next-i18next`
- **Metrics**: `prom-client`

## Features

### Live Exchange Rate Dashboard
- Displays 5 major currency pairs against USD (EUR, GBP, JPY, CAD, AUD)
- Polls the mock API every 10 seconds
- Visual flash indicators: green for rate increase, red for decrease

### Remittance Wizard (3-step flow)
1. **Get Quote** — Enter amount, select currencies, see calculated receive amount
2. **Lock Rate & Confirm** — 5-minute countdown timer; if expired, user is forced back to Step 1
3. **Receipt** — Success confirmation with full transaction details

### Internationalization
- English and French supported
- All monetary values formatted per active locale using `Intl.NumberFormat`
- Language switcher in the header

### Metrics & Instrumentation
- `remitrix_remittance_dropoff_total` — Counter tracking users who abandon at Step 2 (timer expiry)
- `remitrix_http_requests_total` — Request counter for the metrics endpoint
- Prometheus-compatible endpoint at `/api/metrics`

## Architecture

Follows **Atomic Design** with **separation of concerns**:

```
src/
├── app/               Route entry points & API routes
├── components/
│   ├── atoms/         Button
│   ├── molecules/     LanguageSwitcher
│   ├── organisms/     Hero, RateDashboard, RemittanceWizard
│   └── templates/     HomePageTemplate
├── lib/
│   ├── i18n/          i18n config, client init, provider
│   ├── metrics/       prom-client registry & counters
│   ├── mock/          Mock data generators (rates, quotes)
│   └── formatting.ts  Locale-aware currency/date/rate formatting
└── styles/            Global SCSS
```

### Routing decision

- Uses **App Router** for UI and API route handlers (`src/app/api/*`) to keep one routing model.
- Avoids mixing `pages/api` with `app` routes to reduce framework-level ambiguity.

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/rates` | GET | Returns current mock exchange rates |
| `/api/quote` | POST | Creates a locked quote (body: `{sendAmount, sendCurrency, receiveCurrency}`) |
| `/api/quote?id=<id>` | GET | Retrieves a quote and its validity status |
| `/api/remittance-dropoff` | POST | Records a funnel dropoff metric |
| `/api/metrics` | GET | Prometheus metrics endpoint |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type check |
| `npm run test -- --runInBand` | Jest test suite |

## Testing

- Unit tests cover mock data and formatting logic.
- Route handler tests validate `src/app/api/*` behavior.
- Component integration tests cover critical remittance wizard flows, including:
  - Step transition from quote to receipt
  - Timer expiry and dropoff metric reporting

## CI quality gate

GitHub Actions runs this validation pipeline on push and PR:

1. `npm run lint`
2. `npm run typecheck`
3. `npm run test -- --runInBand`
4. `npm run build`
