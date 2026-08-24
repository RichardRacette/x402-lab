# x402-lab

A public R&D experiment in becoming a real vendor in the machine economy.

Current commercial rule:

> **Revenue before ritual. Repeat before scale. Productize what repeats.**

## Live technical proof

**Evidence Slice** remains live on Base Sepolia testnet:

`POST https://x402-lab-production.up.railway.app/extract-evidence`

- price: `$0.003` test USDC
- payment: x402 v2
- signup/API key: none
- current role: stable protocol/payment proof + compatibility fixture

Evidence Slice proved public 402 challenge → automated payment → settlement → retry → protected fulfillment, plus machine-readable Bazaar metadata.

It did **not** prove commercial demand.

## Current commercial direction

Read these first:

- [`docs/PRODUCT-THESIS.md`](docs/PRODUCT-THESIS.md)
- [`docs/PRODUCT-DISCOVERY-ROUND-3-2026-08-24.md`](docs/PRODUCT-DISCOVERY-ROUND-3-2026-08-24.md)
- [`docs/BUSINESS-PLAN-V0.4.md`](docs/BUSINESS-PLAN-V0.4.md)
- [`docs/RECRUITING-AGENT-EVAL-V0.md`](docs/RECRUITING-AGENT-EVAL-V0.md)
- [`docs/CODEX-SESSION-PLAN-2026-08-24.md`](docs/CODEX-SESSION-PLAN-2026-08-24.md)

### Leading first-revenue hypothesis

**Recruiting Agent Practitioner Eval — Human Domain Review**

> **Send sanitized recruiting-agent test runs/traces. A recruiting practitioner labels what works, what fails in real recruiting, why it fails, what the agent should have done, and which cases should become regression tests.**

The buyer is initially a recruiting-agent builder/product team, not necessarily an autonomous agent.

The service is practitioner product-quality evaluation — **not** legal/compliance certification or a bias audit.

## Why the project moved here

Product discovery has deliberately rejected multiple technically buildable but commercially weak ideas:

1. **Evidence Slice as the business** — weak buy-vs-build advantage.
2. **Recruiting Pressure / Agency Opportunity** — crowded hiring-signal market.
3. **Automated Role Reality** — free/SMB competitors already offer richer role-market intelligence and public-data workflows are cheap to reproduce.
4. **Search Preflight as the primary service** — useful workflow, but many recruiting-agent customers already have recruiter approvers, so an outside review can be redundant.

The current eval hypothesis has a better compounding path:

```text
human practitioner labels
        ↓
recruiting failure taxonomy
        ↓
golden/regression cases
        ↓
human-labeled benchmark
        ↓
automated evaluator calibrated to humans
        ↓
machine-native paid eval + human escalation
```

No moat is claimed before customer labels exist.

## Tonight's Codex target

Do **not** add another public endpoint.

Build an internal **Recruiting Agent Eval Workbench** on branch:

`milestone-4-5-recruiting-agent-eval-harness`

The workbench should:

- define eval project/scenario/run/review schemas
- preserve explicit human practitioner judgment
- seed a recruiting-specific failure taxonomy
- create 15–20 synthetic non-PII scenarios
- create synthetic fixture agent outputs
- validate structured reviews
- aggregate failure patterns
- export JSON + Markdown reports
- export selected golden/regression cases
- preserve all existing x402 behavior/tests

Exact plan: [`docs/CODEX-SESSION-PLAN-2026-08-24.md`](docs/CODEX-SESSION-PLAN-2026-08-24.md).

## Commercial validation path

If the workbench/rubric passes internal review:

1. create a polished 3–5-run mini-eval artifact
2. show it to at least 3 recruiting-agent builders/product people
3. offer a tiny free practitioner review to a very small number
4. test `$99–$149` for ~10 runs
5. test around `$249` for 20–25 runs + failure summary + golden cases
6. seek the **same builder again** after a release/change

First external payment matters.

Repeat external payment matters much more.

## Safety and IP boundary

V0 uses only synthetic/public/customer-authorized sanitized material.

Do not require:

- real candidate PII
- protected-class scoring
- live adverse employment decisions
- employer-confidential candidate records
- private credentials

Do not market the service as:

- employment-law advice
- NYC Local Law 144 audit
- algorithmic bias certification
- legal/model-safety certification

Before accepting paid work, verify applicable outside-work/conflict/IP/confidentiality obligations and use only personal equipment/accounts/time.

## Existing technical assets

- Node.js + TypeScript + Express
- x402 v2 seller/payment middleware
- Base Sepolia public deployment
- Bazaar metadata
- Evidence Slice deterministic service
- bounded buyer + shopper gateway
- public-source/SSRF safety work
- tests/typecheck
- compatibility research

These are reusable infrastructure, not product-market fit.

## Machine-commerce posture

x402 remains strategically useful, but the business is not tied to one protocol.

A validated future evaluator could be sold through:

- x402
- MCP
- MPP
- conventional API billing
- agent marketplaces
- human payment channels

The first dollar does not need to be crypto.

## Current milestone

**Milestone 4.5C — Recruiting Agent Practitioner Eval + first revenue.**

See **Issue #14**.

## Progress

- [x] public repository
- [x] automated x402 settlement
- [x] public Base Sepolia seller
- [x] first public paid Evidence Slice transaction
- [x] Bazaar metadata
- [x] bounded buyer/shopper gateway
- [x] product viability/profit gate
- [x] Recruiting Pressure rejected
- [x] automated Role Reality rejected
- [x] Search Preflight downgraded to scenario family
- [x] Recruiting Agent Practitioner Eval V0 selected
- [ ] build eval workbench + synthetic benchmark
- [ ] manually review first synthetic runs
- [ ] validate mini-eval with external builders
- [ ] first external paid eval
- [ ] first repeat builder
- [ ] automate one eval dimension only after labeled evidence

## License

MIT
