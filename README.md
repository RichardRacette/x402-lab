# x402-lab

A deliberately tiny public experiment in becoming a real vendor to software agents.

## What has been proven

> An automated client pays this service over x402, receives a useful result, and continues its task.

**Proven on 2026-08-23.** A disposable automated buyer paid `0.01` test USDC over x402 v2 on Base Sepolia, settlement succeeded, and the buyer received the protected `/analyze-job` result.

The permanent record is in [`docs/FIRST-TRANSACTION.md`](docs/FIRST-TRANSACTION.md).

## Product direction

The governing product thesis is:

> **Reduce transaction friction so aggressively that choosing us becomes cheaper for the agent than thinking about alternatives.**

The full governing document is [`docs/PRODUCT-THESIS.md`](docs/PRODUCT-THESIS.md).

The primary buyer is a software agent with a budget and a task. x402-lab competes on total decision and transaction cost — discovery, interpretation, integration, authentication, payment, execution, recovery, and trust — not nominal price alone.

Early success is measured by **repeat autonomous purchases**, not endpoint count, GitHub stars, or nominal revenue.

## First selected shelf item: Evidence Slice

The first product hypothesis selected under Product Thesis v0.1 is **Evidence Slice**:

> **Give x402-lab a public URL and a question. We return the few passages on that page that actually contain evidence relevant to the question, packaged as clean JSON.**

Frozen V0 contract: [`docs/EVIDENCE-SLICE-V0.md`](docs/EVIDENCE-SLICE-V0.md)

Planned paid endpoint:

`POST /extract-evidence`

Testnet price:

`$0.003` USDC on Base Sepolia (`eip155:84532`)

Example request:

```json
{
  "url": "https://example.com/article",
  "question": "When did the company announce the factory closure?"
}
```

Example response shape:

```json
{
  "service": "x402-lab/evidence-slice",
  "network": "eip155:84532",
  "price": "$0.003",
  "source": {
    "url": "https://example.com/article",
    "title": "Example article title",
    "retrievedAt": "2026-08-23T22:00:00.000Z",
    "contentHash": "sha256:..."
  },
  "question": "When did the company announce the factory closure?",
  "evidence": [
    {
      "text": "The company announced Thursday that the plant will close...",
      "score": 0.91
    }
  ]
}
```

V0 is intentionally narrow:

- one public URL
- one question
- 0–3 passages
- deterministic lexical ranking first
- clean JSON
- source provenance + content hash
- no LLM
- no search engine
- no database
- no accounts or API keys
- no MCP yet
- no mainnet

The one area that is not allowed to be naive is URL safety: caller-supplied URLs must be restricted to public HTTP(S) resources with SSRF protections, redirect revalidation, timeout, content-type, and response-size bounds.

## Original learning product

`POST /analyze-job` remains in the repository as the first learning endpoint that proved the payment loop.

It is **not** a commitment that x402-lab must become a recruiting company.

Current testnet price: `$0.01` USDC.

## Product rules

- reliability is a feature
- machine-readable beats decorative
- no unnecessary signup, subscription, API-key, or approval gates
- predictable tiny prices
- clean structured outputs and errors
- operation before abstraction
- one excellent recurring service beats twenty unproven endpoints
- earn complexity

## Proven x402 loop

```text
buyer client
    |
POST /analyze-job
    |
402 Payment Required
    |
$0.01 test USDC
    |
automatic retry + settlement
    |
200 OK + structured analysis
```

First transaction:

- protocol: x402 v2
- network: Base Sepolia (`eip155:84532`)
- amount: `0.01` test USDC
- status: settled
- transaction: `0xd36cf4bb86fbdb97e3ccca01acdf4ea46edf5fd20a4580bf5ae64ab1344d48be`

## Safety rules

1. **Base Sepolia only** until a separate mainnet-readiness decision is made.
2. Use a **fresh disposable test wallet** as the automated buyer.
3. Never commit `.env`, a seed phrase, or a private key.
4. The seller only needs a public receiving address.
5. No candidate PII.
6. No mainnet switch until real utility, external testing, and operational readiness earn it.
7. Do not weaken public-URL safety to make Evidence Slice easier to demo.

## Stack

- Node.js + TypeScript
- Express
- x402 v2 packages
- Base Sepolia (`eip155:84532`)
- Official x402 test facilitator: `https://x402.org/facilitator`
- deterministic V0 behavior
- separate x402 buyer client with a `$0.05` max-per-payment guardrail

## Start locally

### 1. Install

```bash
npm install
```

### 2. Configure

```bash
cp .env.example .env
```

Set `X402_PAY_TO` to an EVM wallet address you control.

Keep buyer private keys only in the local gitignored `.env`.

### 3. Run the seller

```bash
npm run server
```

Free health check:

```bash
curl http://localhost:4021/health
```

### 4. Run the existing buyer

```bash
npm run buy
```

The buyer uses the x402 client flow to handle the `402`, sign the payment, retry, and process settlement.

## Current active milestone

**Milestone 3 — Build Evidence Slice V0 locally.**

See [Issue #3](https://github.com/RichardRacette/x402-lab/issues/3).

The exit condition is intentionally strict: Evidence Slice must safely accept one public URL + one question, survive tests, complete one local paid x402 transaction at `$0.003`, and return useful passages before any public deployment work begins.

## Roadmap

See [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Progress

- [x] public repository
- [x] seller + buyer scaffold
- [x] first HTTP 402 challenge
- [x] first automated x402 settlement
- [x] first protected result returned after payment
- [x] first transaction documented
- [x] Product Thesis v0.1
- [x] first product hypothesis selected: Evidence Slice
- [ ] Evidence Slice local V0
- [ ] public Base Sepolia deployment
- [ ] first external machine purchase
- [ ] first external repeat purchase

## License

MIT
