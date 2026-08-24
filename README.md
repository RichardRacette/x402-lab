# x402-lab

A public R&D experiment in becoming a real vendor in the machine economy — with one rule now governing the commercial work:

> **Revenue before ritual. Profit before protocol.**

## What is live

**Evidence Slice** remains live on Base Sepolia testnet:

`POST https://x402-lab-production.up.railway.app/extract-evidence`

- price: `$0.003` test USDC
- payment: x402 v2
- signup/API key: none
- purpose now: stable protocol/payment proof + compatibility fixture

Evidence Slice proved that x402-lab can expose a public paid service, return a 402 challenge, settle an automated payment, retry, fulfill the request, and advertise machine-readable discovery metadata.

It did **not** prove that Evidence Slice itself is a strong commercial product.

The first public paid Evidence Slice transaction is preserved in this repository, along with the original `/analyze-job` payment-loop proof.

## Current commercial direction

The current source of truth is:

- [`docs/FULL-PROJECT-AUDIT-2026-08-24.md`](docs/FULL-PROJECT-AUDIT-2026-08-24.md)
- [`docs/BUSINESS-PLAN-V0.3.md`](docs/BUSINESS-PLAN-V0.3.md)
- [`docs/CODEX-SESSION-PLAN-2026-08-24.md`](docs/CODEX-SESSION-PLAN-2026-08-24.md)
- [`docs/ROADMAP.md`](docs/ROADMAP.md)

Older product-discovery documents remain as historical evidence of hypotheses that were tested and rejected.

### What research invalidated

1. **Evidence Slice as the business** — weak buy-vs-build advantage.
2. **Agency Opportunity / Recruiting Pressure** — substantial overlap with current recruiting-intelligence products.
3. **Automated Role Reality Check** — current free/SMB tools already provide richer role-level talent-market intelligence, and public-data talent-intelligence workflows are increasingly easy to reproduce.

The viability gate is working: weak products are being killed before engineering turns them into sunk-cost traps.

## Current revenue experiment

The next test is **service-first, productize-second**.

Working service concept:

> **Recruiting Search Preflight — Human Review Gate**

A recruiter or recruiting agent submits one U.S. requisition plus its important constraints/search assumptions. A real recruiter reviews what is unrealistic, what is underspecified, what should be challenged, and what should change before heavy sourcing/outreach begins.

The customer is buying **human recruiting judgment**, not another salary table.

### Why this direction

- capable agents can already obtain a lot of public labor-market data themselves
- free and enterprise tools already cover much of generic market intelligence
- human expert work is already purchasable by agents through x402-native marketplaces
- the project's recruiting-domain knowledge is harder to reproduce than public wage data
- manual fulfillment creates paid product discovery: every review teaches us what buyers repeatedly value and what deserves automation

The initial service is intentionally not maximally scalable.

The plan is:

```text
sell useful human judgment
        ↓
measure what buyers value
        ↓
reduce fulfillment time with internal tooling
        ↓
observe repeated patterns
        ↓
automate only what has earned automation
        ↓
expose proven components as machine-native paid products
```

## Tonight's engineering target

Codex should **not** add a new public paid endpoint.

It should build an internal **Search Preflight Workbench** that helps a human reviewer produce consistent, source-backed draft reviews quickly.

Success condition:

> a knowledgeable human can turn the workbench draft into a credible review in roughly 25–30 minutes or less.

If the tool does not make the reviewer faster or more consistent, stop rather than adding features.

See [`docs/CODEX-SESSION-PLAN-2026-08-24.md`](docs/CODEX-SESSION-PLAN-2026-08-24.md).

## Data-rights posture

Data licensing is a product dependency.

- **O*NET Database/content** may be used/adapted where covered by CC BY 4.0 with correct attribution and modification notices.
- **BLS public data** is a preferred public-domain source; preserve retrieval date/source and required BLS disclaimer language for downstream analyses.
- **CareerOneStop** registration was submitted transparently, but the click-license shown during registration contains a no-modification/alteration condition. Until written clarification exists, CareerOneStop is optional internal/validation evidence — not the foundation of a proprietary transformed commercial score.
- No candidate PII, contact enrichment, or proprietary talent dataset is required for the current experiment.

## Machine-commerce posture

x402 remains strategically relevant, but it is not the total addressable market.

The protocol now has formal Linux Foundation governance, and AWS AgentCore Payments supports autonomous discovery/payment for x402 services alongside other payment protocols. The ecosystem is real but still early and noisy; raw transaction count is not treated as adoption or TAM.

The eventual commercial product should remain protocol-neutral and may use:

- x402
- MPP
- MCP
- conventional APIs
- normal human payment channels
- agent marketplaces for human services

The buyer should never need to care which payment protocol won the standards race.

## Product rules

- **first external dollar > another testnet milestone**
- **second purchase > first purchase**
- human time is a real variable cost
- public/open data is not automatically a moat
- free competitors count in buy-vs-build analysis
- licensing/use rights are product dependencies
- no generic AI-wrapper catalog
- no product is saved merely because it was already spec'd
- no LLM/premium data/frontend unless buyer evidence earns it
- one repeated paid job-to-be-done beats twenty clever endpoints
- earn complexity

## Existing technical assets

- Node.js + TypeScript + Express
- x402 v2 seller/payment middleware
- Base Sepolia public deployment
- Bazaar discovery metadata
- Evidence Slice deterministic service
- bounded buyer + shopper gateway/spend controls
- public-source/SSRF safety work
- tests + typecheck
- compatibility research

These are reusable infrastructure, **not proof of product-market fit**.

## Current milestone

**Milestone 4.5C — First-revenue discovery / Search Preflight Workbench.**

The next proof we want is not another endpoint.

It is:

> **somebody outside the project values a recruiting decision enough to pay for it — and ideally comes back.**

## Progress

- [x] public repository
- [x] automated x402 settlement
- [x] public Base Sepolia seller
- [x] first public paid Evidence Slice transaction
- [x] Bazaar shelf metadata
- [x] bounded buyer/shopper gateway
- [x] viability/profit gate adopted
- [x] Recruiting Pressure hypothesis rejected before implementation
- [x] automated Role Reality hypothesis rejected after deeper competitive audit
- [x] service-first Business Plan v0.3 adopted
- [ ] build internal Search Preflight Workbench
- [ ] generate 3–5 credible sample reviews
- [ ] validate with external recruiters
- [ ] first real external payment
- [ ] first repeat payer
- [ ] automate a component only after paid evidence

## License

MIT
