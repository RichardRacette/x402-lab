# x402-lab roadmap

The rule: **earn complexity**.

The governing product direction is defined in [`PRODUCT-THESIS.md`](PRODUCT-THESIS.md).

## Milestone 0 — Public seed

Goal: establish a small, legible public repository.

- Public repo: `x402-lab`
- README explains the economic experiment
- no secrets
- one seller endpoint
- one buyer client
- Base Sepolia only

Exit condition: repository is public and clonable.

**Status: complete.**

## Milestone 1 — First testnet x402 transaction

Goal: prove the complete payment loop locally.

### 1A — Seller challenge

- run server
- call `/health` successfully
- call `/analyze-job` without payment
- observe HTTP `402 Payment Required`

### 1B — Automated buyer payment

- create a disposable Base Sepolia buyer wallet
- obtain test USDC
- put the private key only in local `.env`
- run `npm run buy`
- x402 client automatically handles the payment
- endpoint returns analysis
- record transaction details

Exit condition: a buyer program paid a seller program and received the protected result.

**Status: complete.** See [`FIRST-TRANSACTION.md`](FIRST-TRANSACTION.md).

## Milestone 2 — Product thesis and opportunity selection

Goal: move from “x402 works” to “we know what tiny recurring need we want to serve.”

### 2A — Freeze Product Thesis v0.1

- define the machine buyer
- define transaction friction
- define product principles
- define success around repeat autonomous purchases
- define anti-goals
- define evidence hierarchy
- preserve `/analyze-job` as a learning product rather than a permanent business commitment

Exit condition: [`PRODUCT-THESIS.md`](PRODUCT-THESIS.md) governs the next build decision.

### 2B — Find the first recurring X

Research and score a small set of candidate services using the Product Thesis service-qualification test.

Prioritize evidence that agents already need or pay for the capability.

Do not add another paid endpoint during this step.

Exit condition: choose exactly one service hypothesis to test publicly and document why it won.

## Milestone 3 — Public testnet vendor

Goal: make the chosen service reachable by another machine over the internet.

- deploy one seller capability
- retain Base Sepolia
- add only the discovery surfaces required for external testing
- provide a precise machine-readable contract
- verify an external buyer can complete a payment
- record latency, failures, settlement behavior, and integration friction

Exit condition: a client outside the local machine can discover enough about the service to purchase it successfully.

## Milestone 4 — First external repeat buyer

Goal: prove utility rather than novelty.

- obtain a purchase from an external machine buyer
- observe whether it purchases again
- minimize friction exposed during the first integration
- preserve stable price/input/output contracts unless evidence requires change

Exit condition: the same external agent purchases the chosen capability more than once without a human explicitly directing each individual purchase.

This is the first strong product signal.

## Milestone 5 — Improve access only where earned

Goal: make a proven capability easier for agents to discover and invoke.

Possible additions only when justified by observed friction:

- OpenAPI improvements
- structured discovery metadata
- `.well-known/x402` or successor convention where appropriate
- Bazaar participation
- MCP exposure
- explicit health/reliability signals

MCP is not a milestone by itself. It is a distribution surface that should be added when it reduces buyer friction.

Exit condition: the chosen access mechanism measurably reduces integration or decision cost for external agents.

## Milestone 6 — Improve the product only where earned

Goal: increase usefulness without losing the low-friction contract.

For `/analyze-job`, possible upgrades might include:

- better title normalization
- configurable skill ontology
- occupation-family classification
- Boolean-search seed generation
- location/work-mode extraction
- structured confidence/evidence
- optional model-backed analysis

For another chosen service, apply the same principle: improve only the capability agents are actually buying.

Avoid candidate PII, dashboards, databases, and broad integrations until evidence says they improve the core transaction.

Exit condition: measured usefulness or repeat usage improves without materially increasing buyer friction.

## Milestone 7 — First mainnet sale

Goal: exchange real value for real utility.

Before switching:

- service has a clear reason to exist
- external testnet buyer behavior supports the hypothesis
- threat-model endpoint
- validate request limits
- rate-limit abuse paths
- choose a mainnet facilitator intentionally
- use a dedicated seller wallet
- choose deliberate pricing
- document tax/accounting implications
- establish transaction logging

Then:

- Base mainnet
- USDC
- one real external buyer
- one successful sale for a genuinely useful capability

Exit condition: real value moved from an external buyer to x402-lab in exchange for real utility.

## Milestone 8 — Ecosystem participation

Only where it improves discovery, learning, or credibility:

- participate in x402 community channels
- attend relevant working-group/TSC sessions
- submit the project to appropriate ecosystem listings
- publish a short demonstration
- evaluate grant opportunities if still current and strategically useful

## Milestone 9 — Decide whether a larger business has emerged

After operating the service and observing real buyers, evaluate possibilities such as:

1. a focused family of agent-native paid utilities
2. specialist recruiting tools
3. agent spend-policy / observability
4. service quality / reputation / routing
5. payment infrastructure
6. something discovered from actual buyer behavior

No pre-commitment.

The preferred outcome is not a predetermined category. It is discovering a place where x402-lab becomes the **path of least resistance for a recurring machine need**.
