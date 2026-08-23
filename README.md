# x402-lab

A deliberately tiny public experiment in becoming a real vendor to software agents.

## North-star milestone

> An automated client pays this service over x402, receives a useful result, and continues its task.

**Milestone achieved on 2026-08-23.** A disposable automated buyer paid the service `0.01` test USDC over x402 v2 on Base Sepolia, the payment settled successfully, and the buyer received the structured `/analyze-job` response.

The first version sells exactly one thing:

`POST /analyze-job` — structured recruiting signals from a job title + job description.

**Testnet price:** `$0.01` on Base Sepolia.

This repository is intentionally narrow. The first goal was to prove the economic loop before adding AI models, candidate data, databases, authentication, dashboards, or a marketplace. That loop now works.

## Product direction

x402-lab is now moving from protocol experiment toward a tiny agent-native business experiment.

The governing product thesis is:

> **Reduce transaction friction so aggressively that choosing us becomes cheaper for the agent than thinking about alternatives.**

The full governing document is [`docs/PRODUCT-THESIS.md`](docs/PRODUCT-THESIS.md).

The primary buyer is a software agent with a budget and a task. x402-lab should compete on total decision and transaction cost: discovery, interpretation, integration, authentication, payment, execution, recovery, and trust — not nominal price alone.

`/analyze-job` is a learning product, not a commitment that x402-lab must become a recruiting company.

The next question is:

> **What is the smallest recurring X that machine buyers already need, where x402-lab can make buying X easier than thinking about how else to get it?**

Early success is measured by **repeat autonomous purchases**, not endpoint count, GitHub stars, or nominal revenue.

## Product rules

- reliability is a feature
- machine-readable beats decorative
- no unnecessary signup, subscription, API-key, or approval gates
- predictable tiny prices
- clean structured outputs and errors
- operation before abstraction
- one excellent recurring service beats twenty unproven endpoints
- earn complexity

## Why this exists

x402 turns HTTP `402 Payment Required` into a machine-readable payment flow. A client can request a resource, receive payment requirements, sign a payment, retry automatically, and receive the resource.

The proven seller/buyer loop is:

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

The permanent record of the first successful transaction is in [`docs/FIRST-TRANSACTION.md`](docs/FIRST-TRANSACTION.md).

## Safety rules

1. **Base Sepolia only** until a separate mainnet-readiness decision is made.
2. Use a **fresh disposable test wallet** as the automated buyer.
3. Never commit `.env`, a seed phrase, or a private key.
4. The seller only needs a public receiving address.
5. No candidate PII in V0.
6. No mainnet switch until real utility, external testing, and operational readiness earn it.

## Stack

- Node.js + TypeScript
- Express
- x402 v2 packages
- Base Sepolia (`eip155:84532`)
- Official x402 test facilitator: `https://x402.org/facilitator`
- Deterministic job analysis for V0
- A separate x402 buyer client with a `$0.05` max-per-payment guardrail

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

Do **not** add `EVM_PRIVATE_KEY` until you have created a disposable Base Sepolia buyer wallet.

### 3. Run the seller

```bash
npm run server
```

Free health check:

```bash
curl http://localhost:4021/health
```

An unpaid request to the protected endpoint should return `402`:

```bash
curl -i \
  -X POST http://localhost:4021/analyze-job \
  -H "content-type: application/json" \
  -d '{"title":"Senior Software Engineer","description":"Build TypeScript APIs on AWS using PostgreSQL and Docker."}'
```

### 4. Run the buyer

After the disposable buyer wallet has Base Sepolia test USDC and `EVM_PRIVATE_KEY` is set:

```bash
npm run buy
```

The buyer uses the official x402 client flow to handle the `402`, sign the payment, retry the request, and print the settlement result.

## What the endpoint returns

Example shape:

```json
{
  "normalizedTitle": "Senior Software Engineer",
  "seniority": "senior",
  "skills": ["TypeScript", "AWS", "PostgreSQL", "Docker"],
  "searchTerms": [
    "Senior Software Engineer",
    "TypeScript",
    "AWS",
    "PostgreSQL",
    "Docker"
  ],
  "confidence": 0.95
}
```

The analysis is intentionally deterministic in V0. This keeps payment debugging separate from model/API debugging.

## Roadmap

See [`docs/ROADMAP.md`](docs/ROADMAP.md).

The current active milestone is **Milestone 2 — Product thesis and opportunity selection**. No new paid endpoint should be added until one service hypothesis wins the qualification test defined in Product Thesis v0.1.

## Definition of done for V0.1

- [x] Public GitHub repository exists
- [x] Initial seller + buyer scaffold exists
- [x] `/health` returns `200`
- [x] unpaid `/analyze-job` returns `402`
- [x] disposable buyer wallet is funded on Base Sepolia
- [x] buyer automatically satisfies the payment requirement
- [x] settlement result is recorded
- [x] seller receives the testnet payment
- [x] transaction is documented in `docs/FIRST-TRANSACTION.md`
- [x] Product Thesis v0.1 is formalized
- [ ] first external machine purchase
- [ ] first external repeat purchase

## First transaction

- protocol: x402 v2
- network: Base Sepolia (`eip155:84532`)
- amount: `0.01` test USDC
- status: settled
- transaction: `0xd36cf4bb86fbdb97e3ccca01acdf4ea46edf5fd20a4580bf5ae64ab1344d48be`

## License

MIT
