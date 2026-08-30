# ADR: Retrieval Is Commodity; Evidence Transformation Is Product

- Status: accepted for evaluation; native retrieval remains the production default
- Evaluated: 2026-08-30
- Firecrawl source reviewed: `firecrawl/firecrawl@9bf1242b9562cfc710b85cd74127f2628561737a`
- Firecrawl release described by that checkout: `v2.11.263`
- Evidence Slice customer price: `$0.003` per successful request on Base Sepolia

## Decision

Keep x402-lab's existing secure native HTTP retrieval as the default. Add a narrow
`RetrievalProvider` boundary so controlled experiments can substitute retrieval while the existing
content normalization, hashing, passage extraction, ranking, output schema, price, and payment
endpoint remain unchanged.

The Firecrawl adapter is optional, credential-gated, and not selectable through the paid endpoint.
It calls only `POST /v2/scrape` for Markdown with `onlyMainContent: true`, validates the target URL
locally before forwarding it, bounds timeout and response bytes, rejects redirects at the provider
API boundary, and validates the response shape. No Firecrawl package or transitive dependency was
added.

Firecrawl Cloud is a fallback candidate for pages the native path cannot read, especially
JavaScript-rendered pages. It is not the new default. Self-hosted Firecrawl is rejected for this
slice because its operating surface is much larger than the product and its value does not live in
retrieval itself.

## Current Firecrawl evidence

At the evaluated revision, Firecrawl advertises Search, Scrape, Interact, Agent, Crawl, Map, and
Batch Scrape. The v2 scrape contract accepts a URL plus options such as `formats`,
`onlyMainContent`, actions, parsers, and timeout, and returns a document containing Markdown,
HTML, raw HTML, JSON, media, metadata, and other optional forms. The adapter intentionally consumes
only Markdown and title metadata. Sources: [Firecrawl repository](https://github.com/firecrawl/firecrawl)
and [v2 SDK scrape method](https://github.com/firecrawl/firecrawl/blob/main/apps/js-sdk/firecrawl/src/v2/methods/scrape.ts).

The repository root is AGPL-3.0; several client SDKs have their own MIT licenses. This prototype
copies no Firecrawl implementation and links no SDK—it implements the documented HTTP contract in
the MIT-licensed x402-lab codebase. A future self-host deployment would need an AGPL and deployment
review; hosted service use is also governed by Firecrawl's service terms.

Firecrawl's current hosted pricing snapshot says:

| Plan | Annual-billing monthly price | Included credits | Nominal basic scrape cost |
| --- | ---: | ---: | ---: |
| Free | $0 | 1,000/month | $0 within quota |
| Hobby | $16 | 5,000/month | $0.0032/page |
| Standard | $83 | 100,000/month | $0.00083/page |
| Growth | $333 | 500,000/month | $0.000666/page |
| Scale | $599 | 1,000,000/month | $0.000599/page |

Basic Scrape costs one credit per page; advanced features can cost more. Hobby overage is $5 per
1,000 credits ($0.005/page), Standard $5 per 2,000 ($0.0025/page), Growth $5 per 2,500
($0.002/page), and Scale $5 per 5,000 ($0.001/page). Failed requests are not charged, and most
self-serve credits do not roll over. Source: [current Firecrawl
pricing](https://www.firecrawl.dev/pricing).

The Cloud `/scrape` rate limits shown on 2026-08-30 are 10 requests/minute on Free, 100 on Hobby,
500 on Standard, 5,000 on Growth, and 10,000 on Scale. Concurrent browser limits are 2, 5, 25, 50,
and 100+ respectively. A 429 signals either rate or concurrency pressure. Source: [Firecrawl rate
limits](https://docs.firecrawl.dev/rate-limits).

Firecrawl MCP currently offers keyless Search, Scrape, and Parse within daily limits, OAuth sign-in,
or bearer-key access to the plan's full tool surface. That is useful for human/agent exploration but
is the wrong runtime contract for a fixed paid HTTP product: x402-lab needs a bounded server-side
adapter, not a general MCP tool surface. Source: [Firecrawl MCP
setup](https://docs.firecrawl.dev/mcp-server).

The official self-host guide starts multiple services: API/workers, Playwright, Redis, RabbitMQ,
and PostgreSQL, with an optional FoundationDB queue. Its first-run configuration is explicitly
unauthenticated, lacks durable volumes, TLS, high availability, and production controls, and makes
the operator responsible for security, upgrades, monitoring, recovery, and compliance. The default
stack covers core scrape/crawl/map/search, while screenshots/actions, advanced anti-bot Fire-engine,
Agent/Browser/Interact, and several specialized formats need other services or Cloud. Source:
[Firecrawl self-hosting guide](https://docs.firecrawl.dev/contributing/self-host).

## Unit economics at a $0.003 sale price

Hobby's included-credit rate already costs `$0.0032` for a one-page basic scrape, before payment
fees, chain operations, compute, retries, observability, or evidence transformation. It is
structurally incompatible with a `$0.003` sale price. Standard's nominal `$0.00083` leaves about
`$0.00217` gross per successful one-page request before every other cost, but only if volume uses
the annually billed capacity efficiently. Unused credits, multipage results, advanced features,
and overages can erase that margin.

Free/keyless credits can fund evaluation but are not durable production economics. Self-hosting
removes per-credit billing but adds a multi-service operating burden that overwhelms the economics
and intent of this lab. Therefore Firecrawl cannot be in the default request path without a higher
price, materially better conversion/quality, or a routing/caching policy proven by live data.

## Build-versus-buy comparison

| Option | Strength | Cost/operations | Decision |
| --- | --- | --- | --- |
| Existing native HTTP + parser | Pinned-IP SSRF defense, redirects revalidated, 1 MiB/8 s bounds, deterministic output, zero vendor cost | Misses JS-only and sophisticated anti-bot pages | Keep as default |
| New simple HTTP/parser | Small on paper | Rebuilds weaker versions of controls already present; still misses JS pages | Reject |
| Firecrawl Cloud | JS rendering, managed browser/proxy/orchestration, clean Markdown | Variable credits, external data flow, rate limits, margin pressure | Controlled fallback experiment only |
| Self-host Firecrawl | Source/infrastructure control | AGPL review plus API, workers, browser, queues, databases, security, persistence, upgrades | Reject for Evidence Slice |

The important product path begins after retrieval: normalized source text, stable hashing,
question-conditioned evidence selection, bounded results, provenance, and a payment-compatible
contract. Those remain x402-lab code and are identical for every provider.

## Benchmark evidence

`npm run benchmark:retrieval -- --fixtures` runs 15 zero-spend cases: three provider shapes across
static, long, navigation-heavy, JavaScript-shell, and upstream-failure fixtures. All 15 matched the
declared expectation matrix. Native and naive-simple fixtures found the expected passage in the
three server-rendered cases and failed on the JavaScript shell; the Firecrawl-shaped mock also
returned the rendered JavaScript-shell passage. All providers surfaced the failure fixture.

This is a contract and harness benchmark, not a claim about live Firecrawl quality or latency. The
mock intentionally proves the one expected leverage point and guards the adapter/transformation
boundary. No paid call or external scrape occurred; `externalCostUsd` is exactly zero.

A later live benchmark should use the same five case classes and fixed questions, pin provider
options, record response bytes/latency/evidence phrase recall, cap total credits, and keep results
out of the product endpoint. It should run only with explicit credential and spend authorization.

## Failure and security model

| Risk | Control |
| --- | --- |
| User selects a costly provider | No request/API field exists; server still calls the native default |
| SSRF through forwarded target | Reuse `validatePublicUrl` before Firecrawl receives the URL |
| API key disclosure | Key is constructor-only; never in URL, response, logs, or client contract |
| Provider redirect/endpoint confusion | Firecrawl base URL is operator configuration and fetch redirects are rejected |
| Slow or oversized provider | Overall abort timeout and streamed response-byte limit |
| Provider schema drift | Require HTTP success, JSON content, `success: true`, and non-empty Markdown |
| Provider outage/rate limit | Typed `PROVIDER_FAILED`; no silent native retry that could double work or cost |
| Output drift | Every provider feeds the same extraction, hashing, and ranking functions |
| Private self-host API exposure | Adapter can explicitly use unauthenticated mode, but deployment is not supplied or recommended |

## Continuation point

Do not expose provider selection or add another paid endpoint. If the zero-spend harness later
justifies a live test, add a maintainer-only benchmark manifest and explicit cost ceiling. A
production fallback would require a routing rule based on a specific native failure class,
idempotency/cost accounting, telemetry that excludes page content, a revised price model, and a
privacy review of the external data flow.
