# x402-lab

A deliberately tiny public experiment in becoming a real vendor to software agents.

## North-star milestone

> An automated client pays this service over x402, receives a useful result, and continues its task.

The first version sells exactly one thing:

`POST /analyze-job` — structured recruiting signals from a job title + job description.

**Testnet price:** `$0.01` on Base Sepolia.

This repository is intentionally narrow. The goal is to prove the economic loop before adding AI models, candidate data, databases, authentication, dashboards, or a marketplace.

## Why this exists

x402 turns HTTP `402 Payment Required` into a machine-readable payment flow. A client can request a resource, receive payment requirements, sign a payment, retry automatically, and receive the resource.

This lab tests the simplest meaningful seller/buyer loop:

```text
buyer client
    |
POST /analyze-job
    |
402 Payment Required
    |
$0.01 test USDC
    |
automatic retry
    |
structured analysis
```

## Safety rules

1. **Base Sepolia only** until the testnet milestone is complete.
2. Use a **fresh disposable test wallet** as the buyer.
3. Never commit `.env`, a seed phrase, or a private key.
4. The seller only needs a public receiving address.
5. No candidate PII in V0.
6. No mainnet switch until the transaction is reproducible and understood.

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

That `402` is **Milestone 1A**.

### 4. Run the buyer

After the disposable buyer wallet has Base Sepolia test USDC and `EVM_PRIVATE_KEY` is set:

```bash
npm run buy
```

The buyer uses the official x402 client flow to handle the `402`, sign the payment, retry the request, and print the settlement result.

That successful response is **Milestone 1B**.

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
  "confidence": 0.9
}
```

The analysis is intentionally deterministic in V0. This keeps payment debugging separate from model/API debugging.

## Roadmap

See [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Definition of done for V0.1

- [x] Public GitHub repository exists
- [x] Initial seller + buyer scaffold exists
- [ ] CI installs, typechecks, and tests successfully
- [ ] `/health` returns `200`
- [ ] unpaid `/analyze-job` returns `402`
- [ ] disposable buyer wallet is funded on Base Sepolia
- [ ] buyer automatically satisfies the payment requirement
- [ ] settlement result is recorded
- [ ] seller receives the testnet payment
- [ ] transaction is documented in `docs/FIRST-TRANSACTION.md`

Only then do we deploy publicly and begin work toward a tiny mainnet sale.

## License

MIT
