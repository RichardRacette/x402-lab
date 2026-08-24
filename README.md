# x402-lab

A deliberately tiny public experiment in becoming a real vendor to software agents.

## Live shelf

**Evidence Slice** is live on Base Sepolia testnet:

`POST https://x402-lab-production.up.railway.app/extract-evidence`

> Extract query-relevant evidence from one public webpage. Use after search when you need supporting passages rather than an entire page.

- input: `url`, `question`
- output: source metadata + 0–3 relevant evidence passages
- price: `$0.003` test USDC
- network: Base Sepolia (`eip155:84532`)
- payment: x402 v2
- signup: none
- API key: none

An unpaid request returns HTTP `402 Payment Required`. The `payment-required` header contains the price, network, seller, canonical HTTPS resource URL, and an x402 Bazaar discovery extension with the POST body example, required input schema, and output example.

Frozen V0 contract: [`docs/EVIDENCE-SLICE-V0.md`](docs/EVIDENCE-SLICE-V0.md)

## What has been proven

x402-lab has completed a paid machine-to-machine transaction against the public Railway deployment.

First public Evidence Slice sale:

- endpoint: `https://x402-lab-production.up.railway.app/extract-evidence`
- price: `$0.003` / `3000` atomic test USDC
- network: Base Sepolia (`eip155:84532`)
- payment status: settled
- final HTTP status: `200`
- measured payment-to-result latency: `1317 ms`
- transaction: `0xcf34c6d0543dab55426f4a3348501393ce7a6ee52d1ca621385583a0233eb599`

The original payment-loop proof used `/analyze-job` and is permanently recorded in [`docs/FIRST-TRANSACTION.md`](docs/FIRST-TRANSACTION.md).

Evidence Slice now serves primarily as the stable protocol/payment proof and compatibility fixture. It demonstrates that x402-lab can expose, sell, settle, and fulfill a public machine-payable service. It does **not** by itself prove that the capability is commercially strong enough for an external agent to prefer buying it over reproducing it.

## Product direction

The governing product thesis is [`docs/PRODUCT-THESIS.md`](docs/PRODUCT-THESIS.md).

The commercial correction and Product #2 qualification gate are defined in [`docs/PRODUCT-VIABILITY-2026-08-24.md`](docs/PRODUCT-VIABILITY-2026-08-24.md).

The current discovery decision is [`docs/PRODUCT-DISCOVERY-ROUND-2-2026-08-24.md`](docs/PRODUCT-DISCOVERY-ROUND-2-2026-08-24.md).

> **Reduce transaction friction so aggressively that choosing us becomes cheaper for the agent than thinking about alternatives.**

The commercial objective is now explicit:

> **Profitable repeat autonomous purchases.**

The next product must give a capable agent a rational reason to purchase instead of reproduce the result itself. Strong candidates are expected to involve useful data/access, operational infrastructure, external actions, or multi-step orchestration rather than generic text transformation.

Market research on 2026-08-24 found stronger observed paid activity around data/enrichment access, browser/document infrastructure, specialist research, and agent-commerce data than around many broad catalogs of generic AI utilities.

A company-level **Recruiting Pressure / Agency Opportunity** product was researched and then deliberately rejected before implementation because current products already cover too much of the proposed hiring-velocity, repost, first-hire, and agency-intent surface.

The active validation candidate is now **Role Reality Check**:

> **Give us a U.S. role, location, proposed compensation, and key constraints. Return a source-backed market reality packet showing how the req compares with the labor market and what should be calibrated before meaningful sourcing begins.**

Role Reality is **not yet Product #2**. It must first survive real-data review and external recruiter validation. The working contract is [`docs/ROLE-REALITY-CHECK-V0.md`](docs/ROLE-REALITY-CHECK-V0.md), and the evening implementation gate is [`docs/CODEX-SESSION-PLAN-2026-08-24.md`](docs/CODEX-SESSION-PLAN-2026-08-24.md).

The initial provider hypothesis uses CareerOneStop/U.S. Department of Labor open data behind seller-side credentials. The hoped-for access-model wedge is **on-demand talent-market intelligence without requiring the buyer to purchase or integrate a full enterprise talent-intelligence platform**. That is a hypothesis to test, not a claimed moat.

## Evidence Slice contract

Request:

```json
{
  "url": "https://example.com/",
  "question": "What is this domain used for?"
}
```

Response shape:

```json
{
  "service": "x402-lab/evidence-slice",
  "network": "eip155:84532",
  "price": "$0.003",
  "source": {
    "url": "https://example.com/",
    "title": "Example Domain",
    "retrievedAt": "2026-08-24T01:44:30.214Z",
    "contentHash": "sha256:..."
  },
  "question": "What is this domain used for?",
  "evidence": [
    {
      "text": "This domain is for use in documentation examples without needing permission. Avoid use in operations.",
      "score": 0.485
    }
  ]
}
```

Evidence Slice V0 is intentionally narrow:

- one public HTTP(S) URL
- one question
- 0–3 passages
- deterministic lexical ranking
- clean JSON
- source provenance + content hash
- no LLM
- no search engine
- no database
- no accounts or API keys
- no MCP
- no mainnet

Caller-supplied URLs are protected by public-address validation, redirect revalidation, DNS/IP checks, timeout, content-type limits, and response-size bounds.

## Machine-readable shelf label

The public `402` carries x402 v2 Bazaar metadata through `extensions.bazaar`.

It advertises:

- service: `x402-lab`
- method: `POST`
- body type: JSON
- required inputs: `url`, `question`
- realistic request example
- realistic Evidence Slice output example
- tags: `evidence`, `research`, `extraction`, `agents`

Price, network, payment scheme, USDC asset, and receiving address remain authoritative in the core x402 payment requirements.

## Minimal testnet buyer example

This example performs a real **Base Sepolia test-USDC** payment. Use only a disposable testnet wallet and keep the private key outside source control.

```ts
import { x402Client, wrapFetchWithPayment } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";

const signer = privateKeyToAccount(
  process.env.EVM_PRIVATE_KEY as `0x${string}`
);

const client = new x402Client();
client.setSpendControls({ maxAmountPerPayment: "$0.01" });
client.register("eip155:*", new ExactEvmScheme(signer));

const paidFetch = wrapFetchWithPayment(fetch, client);

const response = await paidFetch(
  "https://x402-lab-production.up.railway.app/extract-evidence",
  {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      url: "https://example.com/",
      question: "What is this domain used for?"
    })
  }
);

console.log(response.status);
console.log(await response.json());
```

The client encounters the `402`, signs the bounded payment, retries automatically, and receives the protected JSON response if settlement succeeds.

## Original learning product

`POST /analyze-job` remains in the repository because it proved the first x402 payment loop. It is not the current product thesis and does not commit x402-lab to becoming a recruiting company.

Current testnet price: `$0.01` test USDC.

## Product rules

- reliability is a feature
- machine-readable beats decorative
- no unnecessary signup, subscription, API-key, or approval gates for machine buyers
- profitable repeat purchase matters more than first-purchase novelty
- buy-vs-build advantage must be explicit
- licensing/upstream use rights are product dependencies
- instrument variable fulfillment cost from the first commercial test
- kill overlapping/weak hypotheses before coding them
- one excellent recurring service beats twenty unproven endpoints
- earn complexity

## Safety

1. **Base Sepolia only** until a separate mainnet-readiness decision is made.
2. Use a fresh disposable test wallet for automated buying.
3. Never commit `.env`, a seed phrase, a private key, or provider API credentials.
4. The deployed seller needs only the public `X402_PAY_TO` receiving address for the existing payment routes.
5. Do not weaken Evidence Slice public-URL safety for convenience.
6. Do not switch to mainnet until real utility, external testing, licensing clarity, and positive expected unit economics earn it.

## Stack

- Node.js + TypeScript
- Express
- x402 v2 packages pinned to `2.23.0`
- `@x402/extensions` Bazaar metadata
- Base Sepolia (`eip155:84532`)
- x402.org test facilitator
- Railway public deployment
- deterministic Evidence Slice V0
- bounded buyer + shopper gateway

The commercial product logic should remain independent of payment frontage so a future validated service can add MPP, MCP, ordinary APIs, or other machine-payment access without duplicating the product.

## Run locally

```bash
npm install
cp .env.example .env
npm run server
```

Set `X402_PAY_TO` to a public EVM receiving address you control. Keep any buyer private key only in the local gitignored `.env`.

Free health check:

```bash
curl http://localhost:4021/health
```

## Current milestone

**Milestone 4.5B — Validate Role Reality Check before paid launch.**

See **Issue #13** and [`docs/CODEX-SESSION-PLAN-2026-08-24.md`](docs/CODEX-SESSION-PLAN-2026-08-24.md).

The next step is intentionally **not** to add another public endpoint immediately. Build the provider-neutral decision engine and bounded CareerOneStop adapter, generate sample packets, and inspect whether the result is materially more useful than a salary lookup plus ordinary web/AI research.

If the packet fails that gate, reject the hypothesis. If it passes, then a `$0.50` Base Sepolia paid route can be earned.

## Roadmap

See [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Progress

- [x] public repository
- [x] seller + buyer scaffold
- [x] first automated x402 settlement
- [x] Product Thesis
- [x] Evidence Slice V0
- [x] public Base Sepolia deployment
- [x] first public paid Evidence Slice transaction
- [x] live x402 v2 Bazaar shelf label
- [x] bounded shopper gateway
- [x] product viability/profit gate adopted
- [x] Recruiting Pressure hypothesis rejected before implementation
- [x] Role Reality validation contract + Codex session plan prepared
- [ ] build Role Reality validation core
- [ ] generate and review real sample packets
- [ ] external recruiter validation
- [ ] select Product #2 only if it passes the gate
- [ ] first external machine purchase of Product #2
- [ ] first external repeat purchase
- [ ] first profitable mainnet sale

## License

MIT
