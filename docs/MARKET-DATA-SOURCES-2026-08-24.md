# Market Data Sources — Machine Demand Observatory

Status: **implementation/research reference**

Date: **2026-08-24**

The observatory should not depend on one dashboard's methodology.

Use multiple sources with explicit provenance and keep raw source snapshots separate from derived metrics.

## Source A — x402stats free data

Current public data page:

`https://x402stats.io/data`

Free endpoints documented by the provider:

```text
GET https://x402stats.io/api/stats
GET https://x402stats.io/api/stats/csv
GET https://x402stats.io/api/facilitators
```

The provider states these data are available under **CC BY 4.0** and cached approximately hourly.

Preserve attribution to:

> x402stats — State of x402, x402stats.io

### Useful fields

The current dataset includes:

- daily series
- volume
- sellers
- buyers
- transactions
- an organic snapshot
- weekly record
- facilitator series/market share

The exact response schema should be validated at implementation time rather than guessed from prose docs.

### Organic methodology

Current methodology version observed: `v2026-07-01.v1`.

A seller wallet counts toward the provider's "organic" revenue heuristic when all of the following hold:

- revenue >= `$100` in the analysis window
- >= `3` distinct buyer wallets
- average payment >= `$0.001`
- wallet is not an identified facilitator settlement address

This is a **heuristic**, not ground truth.

The provider explicitly notes limitations, including:

- sophisticated self-dealing may still pass
- facilitator coverage can overlap
- upstream indexer gaps propagate
- buyer counts are per-seller unique counts
- cross-seller buyer overlap is not available from the published aggregate dataset

Never relabel x402stats `organic` as proven independent demand.

### Current August context

The provider's August 2026 report (published 2026-08-01, using its then-current trailing window) reported approximately:

- `$503K` organic 30-day volume
- `$691K` raw 30-day volume
- `124` seller wallets clearing its organic-business filter
- `71%` of organic volume concentrated in the top 10 wallets
- `$0.01` median seller revenue across the broader receiving-wallet population

Interpretation:

> the ecosystem can show large raw counts while economically meaningful seller activity remains small and concentrated.

This is a strong reason for the observatory to model concentration and methodology explicitly.

## Source B — x402stats paid machine feed

The same provider currently advertises x402-payable endpoints:

```text
GET https://x402stats.io/api/x402/stats
GET https://x402stats.io/api/x402/facilitators
```

Observed price:

`$0.005 USDC / call` on Base mainnet.

The provider describes the paid version as a fresh, stable-schema, machine-payable feed.

### Observatory posture

Do **not** pay for this feed during initial development because equivalent free data is already available for human/research use.

The paid endpoint is useful later as:

- a buyer compatibility test
- an example of machines paying for schema/freshness/reliability even when human-accessible data is free
- a controlled experiment in the economics of machine convenience

Any live payment still requires explicit owner approval and existing spend controls.

## Source C — x402scan public marketplace/server pages

Current public explorer:

`https://www.x402scan.com/`

Useful public observations include:

- server/origin descriptions
- resource catalogs
- prices
- tags
- 30-day transactions
- 30-day volume
- unique buyers
- chain/facilitator context

These pages are useful for qualitative product review and manually curated seed snapshots.

Do not build a brittle HTML scraper by default merely because the pages are public.

Prefer documented APIs or manual import for the first slice.

## Source D — x402scan paid market-data API

x402scan currently advertises paid resources including approximately:

```text
GET /api/x402/merchants
GET /api/x402/merchants/{address}/stats
GET /api/x402/merchants/{address}/transactions
GET /api/x402/facilitators
GET /api/x402/facilitators/stats
GET /api/x402/origins/{id}/resources
```

Observed price is roughly `$0.01` per call, but the runtime `402` challenge is authoritative.

### Why this source matters

Transaction-level merchant history may let the observatory calculate things aggregate dashboards cannot, such as:

- repeat-buyer share
- buyer concentration
- median calls per buyer
- top-buyer share
- possible cross-seller shoppers when the same buyer is observed in multiple merchant histories

These are high-value discovery metrics.

### Spend posture

Default: **dry-run / no spend**.

Before any paid collection:

- explicit owner approval
- explicit paid-execution CLI flag
- runtime price check
- proposed max `$0.02` per call
- proposed max `$0.25` collection-session budget
- reuse existing shopper spend controls
- no automatic wallet funding
- no silent network permission broadening
- transaction/audit record without secrets

If the existing x402-lab shopper is testnet-only or otherwise incompatible with the provider's network, report the gap and continue using free/manual data.

## Provider precedence for tonight

Use this order:

1. deterministic fixtures for tests
2. x402stats **free JSON/CSV** for global/raw-vs-organic baseline
3. manually imported x402scan public server observations for product metadata/examples
4. x402scan paid transaction-level data only if deeper buyer analysis is worth the cost and a live collection is explicitly approved

This order minimizes spend and implementation risk while still letting the observatory answer useful questions.

## Cross-source rules

### Preserve windows

A 24-hour source and a 30-day source are not directly comparable without explicit normalization/limitations.

### Preserve methodology

Do not merge `raw`, `organic`, `registered seller`, `receiving wallet`, `server`, `origin`, and `merchant` into one semantic concept.

### Preserve timestamps

Every snapshot needs `observedAt` and source-specific time-window metadata.

### Preserve provenance

Derived metrics must retain enough information to trace them to their raw source snapshot.

### Disagreement is evidence

If x402scan and x402stats disagree materially, do not silently choose one.

Record:

- both values
- source/methodology
- plausible reason for disagreement
- which metric is suitable for the current question

The purpose of the observatory is not to manufacture one authoritative number. It is to improve decisions under imperfect market data.
