# x402-lab

[![CI](https://github.com/RichardRacette/x402-lab/actions/workflows/ci.yml/badge.svg)](https://github.com/RichardRacette/x402-lab/actions/workflows/ci.yml)

**A public, AI-assisted research lab for bounded machine-commerce experiments.**

Explore payment-protocol integration, constrained buyer tooling, demand research and evidence-based decisions not to build. Technical feasibility is not commercial demand.

> **Observe demand before building supply.**

## Start with the evidence

Read the [public evidence guide](docs/PUBLIC-EVIDENCE.md) for dated claims, source links, reproduction boundaries and limitations. Documentation was reviewed on **October 28, 2026**; application tests, deployed availability and transactions were **not rerun in that documentation pass**.

| Area | What the reviewed records support |
| --- | --- |
| Seller protocol | Historical Base Sepolia x402 v2 challenge, settlement and protected-fulfillment evidence. Current uptime is unverified. |
| Buyer Trace | An implemented approval-gated adapter with documented local verification. Live execution remains unrun in the reviewed evidence and is not authorized here. |
| Product discovery | A September 9 controlled comparison ended in **NO_BUILD**, rather than another seller without a demonstrated advantage. |
| Commercial traction | External paid use and repeat independent purchase were **not demonstrated**. Testnet activity is not revenue. |

Richard Racette directs the project, experiments and acceptance decisions, with AI-assisted implementation. The x402 protocol, SDKs, chains and third-party dependencies are upstream work. This repository does not claim their authorship.

## The strongest case study: deciding not to build

The [September 9 first-buyer sprint](docs/first-buyer-2026-09-09/decision.md) compared an email-intake candidate with a maintained free substitute. Both scored 19/20 initially; after one defective benchmark expectation was excluded, both met the accepted routing criteria on all 19 valid cases. The unchanged-output diagnostic is not another run.

No independently measured buyer integration saving supplied the alternative qualification gate. The result was **NO_BUILD**. The original results, benchmark correction, cost assumptions and limits remain inspectable. This is evidence of a bounded product decision, not a general claim that machine commerce cannot work.

## Technical components

- Node.js, TypeScript and Express seller experiments.
- x402 v2 seller/payment integration and discovery metadata.
- Evidence Slice: bounded extraction, deterministic passage ranking and provenance.
- A bounded buyer/shopper gateway and approval-gated Buyer Trace adapter.
- Machine Demand Observatory: provider-neutral snapshots, deterministic fixtures, descriptive metrics, comparison and explicit unknown states.
- Kiroshi Optics: a local read-only view of Observatory exports, not a separate commercial product.

See [Buyer Trace's implementation and verification record](docs/BUYER-TRACE-ADAPTER.md), [Kiroshi Optics](docs/KIROSHI-OPTICS.md), and the [evidence guide](docs/PUBLIC-EVIDENCE.md). The historical September 5 [handoff](HANDOFF.md) remains useful background, but its unfinished-Buyer-Trace statements predate later implementation. Do not use that historical next step as authorization for new work.

## Historical seller demonstration

The repository records an Evidence Slice seller on **Base Sepolia testnet**, priced at **$0.003 test USDC** in the dated records. The September 5 handoff's own check reported an HTTP 200 health response and an unpaid HTTP 402 challenge; it explicitly attempted no payment. Earlier settlement evidence is reported separately in that record.

These records do not establish current availability, fresh settlement, independent paying customers or production readiness. The seller's testnet demonstration is separate from Buyer Trace's documented, separately gated purchase path. This README is not an instruction to call either endpoint or execute a purchase.

## Development and verification

Requirements: Node.js 22+ and npm, as specified by the project.

```sh
npm ci
npm run typecheck
npm test
```

These are the required commands, not a claim that they were executed during this documentation pass. Read [CONTRIBUTING.md](CONTRIBUTING.md), inspect scripts before execution and use a scoped branch. Tests and CI must not execute real payments. Merge only after required checks pass and the diff matches the stated scope.

The September 9 decision reports **235 passing tests in that dated local run**. Historical counts must not be presented as today's CI result. See the [evidence guide](docs/PUBLIC-EVIDENCE.md) before citing performance, correctness or test counts.

For local server development, the existing command is `npm run dev`; do not import production configuration or wallet material merely to inspect the portfolio.

## Safety and authority

Default experimental spend remains **$0**. Building purchase capability is not authorization to spend.

- No automatic wallet funding, real-money purchases or silent permission expansion.
- No private keys, API credentials, personal records or environment files in Git or public logs.
- Purchase authority stays separate from external content and model output.
- Live execution needs explicit owner approval, reviewed terms and bounded limits.
- Do not change the network, recipient, price, facilitator or deployment as part of a documentation review.

Start external collaboration with the [seller-review intake](docs/SELLER-REVIEW-INTAKE.md), [security policy](SECURITY.md) and [external-testing policy](docs/EXTERNAL-TESTING.md). No outreach or external testing is authorized by reading this page.

## Product #2 remains unselected

No new seller earns implementation without evidence for observed demand, repeat behavior, buyer breadth, buy-versus-build advantage, current substitutes, a reliable supply path, plausible economics, a project-specific advantage and the cheapest falsification test.

Preserve rejected hypotheses as learning, not a backlog to restart automatically. The [September 9 decision](docs/first-buyer-2026-09-09/decision.md) is the relevant later decision record; earlier opportunity cards and product-discovery documents remain historical research.

Research background: [product thesis](docs/PRODUCT-THESIS.md), [positive-sum doctrine](docs/POSITIVE-SUM-PRODUCT-DOCTRINE.md), [discovery round four](docs/PRODUCT-DISCOVERY-ROUND-4-2026-08-24.md), [roadmap](docs/ROADMAP.md), and [historical handoff](HANDOFF.md).

## License

MIT. See [LICENSE](LICENSE). Third-party dependencies and protocols retain their own licenses and attribution.
