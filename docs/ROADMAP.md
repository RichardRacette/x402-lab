# x402-lab roadmap

The rule: **earn complexity**.

## Milestone 0 — Public seed

Goal: establish a small, legible public repository.

- Public repo: `x402-lab`
- README explains the economic experiment
- no secrets
- one seller endpoint
- one buyer client
- Base Sepolia only

Exit condition: repository is public and clonable.

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

## Milestone 2 — Public testnet vendor

Goal: make the seller reachable by another machine over the internet.

- deploy the server
- retain Base Sepolia
- add OpenAPI description
- add structured discovery metadata
- verify external buyer can complete a payment
- record latency, failures, and settlement behavior

Exit condition: a client outside the local machine can purchase the service.

## Milestone 3 — Paid MCP tool

Goal: expose the same useful capability as an MCP tool using the current `@x402/mcp` path.

- MCP tool: `analyze_job`
- same input/output contract
- paid invocation
- demonstrate an agent choosing and invoking it

Exit condition: an agent can purchase the capability as a tool, not just call an HTTP demo script.

## Milestone 4 — Make the product worth buying

Goal: improve usefulness without losing scope.

Possible upgrades, only after Milestone 3:

- better title normalization
- configurable skill ontology
- occupation-family classification
- Boolean-search seed generation
- location/work-mode extraction
- structured confidence/evidence
- optional model-backed analysis

Avoid candidate PII and ATS integrations until there is evidence they help the core vendor experiment.

Exit condition: at least one person other than the builder says the output is useful enough that a paid call makes sense.

## Milestone 5 — First mainnet sale

Goal: one tiny real sale.

Before switching:

- threat-model endpoint
- validate request limits
- rate-limit abuse paths
- choose a mainnet facilitator intentionally
- use a dedicated seller wallet
- choose a deliberately tiny price
- document tax/accounting implications
- establish transaction logging

Then:

- Base mainnet
- USDC
- one real external buyer
- one successful sale

Exit condition: real value moved from an external buyer to the service in exchange for a useful result.

## Milestone 6 — Ecosystem participation

- add Bazaar/discovery support
- add `.well-known/x402` if appropriate to current spec
- join x402 Slack
- attend an open working-group/TSC session
- submit the project to relevant ecosystem listings
- publish a <=2 minute demonstration
- assess the Foundation micro-grant path if still available and appropriate

## Milestone 7 — Decide the real business angle

Only after operating the thing:

1. specialist paid recruiting tools
2. agent spend-policy / observability
3. service quality / reputation / routing
4. payment infrastructure
5. something discovered from actual x402 users

No pre-commitment. Let operating experience reveal the opportunity.
