# x402-lab roadmap

The rule: **earn complexity**.

The governing product direction is defined in [`PRODUCT-THESIS.md`](PRODUCT-THESIS.md).

The selected first product hypothesis is defined in [`EVIDENCE-SLICE-V0.md`](EVIDENCE-SLICE-V0.md).

## Milestone 0 — Public seed ✅

Goal: establish a small, legible public repository.

Exit condition: repository is public and clonable.

**Status: complete.**

## Milestone 1 — First testnet x402 transaction ✅

Goal: prove the complete payment loop locally.

Proven flow:

```text
buyer → 402 → signed payment → settlement → automatic retry → protected result
```

Exit condition: a buyer program paid a seller program and received the protected result.

**Status: complete.** See [`FIRST-TRANSACTION.md`](FIRST-TRANSACTION.md).

## Milestone 2 — Product thesis and first recurring X ✅

Goal: move from “x402 works” to “we know what tiny recurring need we want to serve.”

### 2A — Product Thesis v0.1

Product Thesis v0.1 defines the machine buyer, transaction friction, product principles, evidence hierarchy, anti-goals, and repeat autonomous purchase as the primary early signal.

### 2B — Select the first recurring X

Selected hypothesis: **Evidence Slice**.

> Give x402-lab a public URL and a question. Return the few passages on that page that actually contain evidence relevant to the question, packaged as clean JSON.

Exit condition: exactly one hypothesis selected with price, contract, repeat-purchase rationale, and falsification conditions.

**Status: complete.** See [`EVIDENCE-SLICE-V0.md`](EVIDENCE-SLICE-V0.md).

## Milestone 3 — Build Evidence Slice V0 locally

Goal: make the selected shelf item work safely before exposing it publicly.

- implement `POST /extract-evidence`
- one public URL + one question
- return 0–3 relevant passages
- deterministic lexical ranking first
- source metadata + SHA-256 content hash
- Base Sepolia price: `$0.003` test USDC
- enforce public-URL/SSRF safety boundary
- keep `/analyze-job` intact
- typecheck and tests green
- complete one local paid x402 Evidence Slice transaction

Hard non-goals:

- no model/LLM
- no embeddings/vector database
- no search engine
- no multi-URL input
- no fact checking
- no answer generation
- no PDF/browser rendering
- no accounts/API keys
- no MCP
- no public deployment
- no mainnet

Exit condition: Evidence Slice safely works locally end-to-end as a paid x402 service and returns useful passages from a real public page.

**Active issue: [#3](https://github.com/RichardRacette/x402-lab/issues/3).**

## Milestone 4 — Put Evidence Slice on the public testnet shelf

Goal: make Evidence Slice reachable by another machine over the internet.

Only after Milestone 3 succeeds:

- deploy the seller on Base Sepolia
- expose the frozen Evidence Slice contract
- add only the minimum machine-readable discovery information required for an external test
- make price/schema obvious
- verify an external buyer can complete a payment
- record latency, failures, settlement behavior, and integration friction

Exit condition: a client outside the local machine can discover enough about Evidence Slice to purchase it successfully.

## Milestone 5 — First external repeat buyer

Goal: prove utility rather than novelty.

- obtain a purchase from an external machine buyer
- observe whether it purchases again
- preserve stable price/input/output contracts unless evidence requires change
- fix only friction exposed by real integrations

Exit condition:

> the same external agent purchases Evidence Slice more than once without a human explicitly directing each individual purchase.

This is the first strong product signal.

## Milestone 6 — Improve access only where earned

Goal: make a proven capability easier for agents to discover and invoke.

Possible additions only when justified by observed friction:

- OpenAPI improvements
- structured discovery metadata
- `.well-known/x402` or successor convention where appropriate
- Bazaar participation
- MCP exposure
- explicit health/reliability signals

MCP is not a milestone by itself. It is a distribution surface that should be added only when it reduces buyer friction.

Exit condition: an access change measurably reduces integration or decision cost for external agents.

## Milestone 7 — Improve Evidence Slice only where earned

Goal: increase usefulness without losing the low-friction contract.

Potential future upgrades must be earned by buyer evidence, for example:

- better passage segmentation
- better deterministic ranking
- stronger provenance metadata
- optional semantic ranking
- multi-source evidence packets
- support/contradict evidence classification

None of these is pre-approved.

Avoid databases, dashboards, broad integrations, and model dependencies until measured usage justifies them.

Exit condition: measured usefulness or repeat usage improves without materially increasing buyer friction.

## Milestone 8 — First mainnet sale

Goal: exchange real value for real utility.

Before switching:

- Evidence Slice or its evidence-backed successor has a clear reason to exist
- external testnet buyer behavior supports the hypothesis
- endpoint threat model is reviewed
- request/rate limits are intentional
- seller wallet and credentials are dedicated appropriately
- mainnet facilitator is chosen intentionally
- pricing is deliberate
- transaction logging and accounting implications are understood

Then:

- Base mainnet
- USDC
- one real external buyer
- one successful sale for genuinely useful output

Exit condition: real value moves from an external buyer to x402-lab in exchange for real utility.

## Milestone 9 — Ecosystem participation and larger-business decision

Only where it improves discovery, learning, credibility, or buyer access:

- participate in x402 community channels
- attend relevant working-group/TSC sessions
- submit the project to appropriate ecosystem listings
- publish a short demonstration
- evaluate grants if current and strategically useful

After operating the service and observing real buyers, evaluate whether a larger opportunity has emerged, such as:

1. a focused family of agent-native paid utilities
2. evidence/provenance infrastructure
3. specialist recruiting tools
4. agent spend-policy / observability
5. service quality / reputation / routing
6. payment infrastructure
7. something discovered from actual buyer behavior

No pre-commitment.

The preferred outcome is discovering a place where x402-lab becomes the **path of least resistance for a recurring machine need**.
