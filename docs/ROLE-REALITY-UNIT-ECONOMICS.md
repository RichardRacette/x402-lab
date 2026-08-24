# Role Reality Check — Unit Economics & Profit Gates

Status: **commercial model for validation**

Date: **2026-08-24**

## Objective

Role Reality is not successful because it generates x402 transactions.

It is successful only if repeated customers buy useful packets at a price that leaves positive contribution margin and does not require disproportionate support.

## Initial cost structure

### V0 provider

CareerOneStop/USDOL open-data API.

Expected provider data fee for the prototype: **$0 per call** based on the public open-data access model.

This does not mean infrastructure is free or unlimited. Track provider rate limits, service constraints, hosting, network and payment costs.

### Payment processing

The project should track the actual facilitator fee in production rather than hard-code assumptions into product logic.

For planning, even a roughly one-tenth-of-a-cent payment fee is trivial at a $0.50 selling price but material to sub-cent products.

### Compute

V0 intentionally uses deterministic rules and ordinary HTTP/API calls:

- no LLM
- no embeddings
- no browser
- no vector database

This keeps variable compute cost near the minimum needed to validate the product.

## Validation price

Base Sepolia test price if/when the sample earns a paid route:

> **$0.50 test USDC per Role Reality packet**

This is not a permanent market price.

The point is to test whether the buying decision can be materially larger than a novelty micropayment while still being trivial relative to recruiter economics.

## Price ladder to test later

Do not expose all of these at once.

Possible sequence after external usefulness is established:

```text
$0.50  machine/basic packet
$1.00  price-sensitivity test
$2.00  human/developer per-role packet
$5.00  richer report only if additional value/data earns it
```

A product worth only $0.003 is probably too weak unless call frequency is enormous and fulfillment is effectively free.

## Per-call contribution model

Track:

```text
sale price
- provider/data cost
- payment facilitator cost
- variable model/browser/compute cost
- variable network/hosting allocation
- expected failure/refund allowance
= contribution per fulfilled call
```

Do not confuse gross revenue with profit.

## Illustrative economics

These are planning examples, not forecasts.

### $0.50 sale, near-zero upstream data cost

If total direct variable cost were $0.01:

```text
revenue       $0.50
variable cost $0.01
contribution  $0.49
margin        98%
```

If future premium data raised direct variable cost to $0.15:

```text
revenue       $0.50
variable cost $0.15
contribution  $0.35
margin        70%
```

That still clears the project's current >=60% target.

If required data cost rose to $0.30:

```text
revenue       $0.50
variable cost $0.30
contribution  $0.20
margin        40%
```

At that point either price must increase, provider economics must improve, or the feature/data should not be added.

## Revenue-scale reality

At $0.50 per call:

```text
100 calls/month      = $50 revenue
1,000 calls/month    = $500 revenue
10,000 calls/month   = $5,000 revenue
100,000 calls/month  = $50,000 revenue
```

This is a reminder that **high margin is not enough**. Repeat frequency and distribution determine whether the product becomes meaningful income.

The early objective is not 100,000 calls.

It is to prove that a small number of independent users repeatedly choose to buy.

## Human/developer channel

The same product should not depend exclusively on autonomous wallets.

If humans or recruiting software prefer ordinary billing, future options can include:

- one-off reports
- prepaid API credits
- small monthly API plans
- embedded partner pricing

Do not build subscription billing before repeat use exists.

## Economic value to the buyer

Recruiter economics make a low-dollar calibration packet plausible because the avoided cost is primarily **human time and low-probability search effort**, not just another API call.

A single role can represent:

- hours of sourcing/research effort
- recruiter capacity that could be spent on another req
- a placement fee worth thousands to tens of thousands of dollars if successful

Role Reality does not need to predict a placement.

It needs to improve the odds that recruiter effort is aimed or calibrated intelligently enough to justify the packet price.

## Price-value test

During validation, record separately:

- utility at $0.50
- utility at $2
- utility at $5

If every user loves the product at $0.50 but refuses $1, that is important evidence about the ceiling.

If users would pay $5 or more, do not artificially hold price at $0.50 merely to preserve a "microtransaction" identity.

Price should maximize profitable repeat purchase volume.

## Profit milestones

### P0 — useful free sample

Real recruiter says the packet changes an action or saves meaningful research.

No revenue requirement.

### P1 — first external willingness to pay

A user chooses a stated price for another packet or requests a paid integration.

### P2 — first independent paid sale

Real money eventually changes hands for a useful result.

### P3 — repeat paid buyer

Same independent buyer purchases again because a new req triggers the need.

### P4 — $100 cumulative external revenue

Small but meaningful proof that revenue is not a one-off demo.

### P5 — $500 monthly revenue with positive contribution margin

Now the project has evidence of a tiny business.

### P6 — $1,000 monthly contribution profit

This is the first milestone where the project meaningfully validates itself as a side-business asset rather than only a technical portfolio piece.

### P7 — $5,000 monthly contribution profit

At this level evaluate whether a standalone commercial brand, formal business infrastructure, premium-data contracts and more deliberate acquisition deserve investment.

These milestones are directional and should be revised with actual economics.

## Customer-concentration rule

Do not celebrate transaction volume from one self-controlled wallet or one experimental buyer as market validation.

Track:

- independent paying buyers
- repeat buyers
- revenue by buyer
- share of revenue from top buyer

A thousand calls from one test harness are one customer, not a market.

## Provider-cost gate

Before adding any paid data source, document:

1. exact per-call/per-row cost
2. resale/derived-use rights
3. maximum cost per Role Reality request
4. effect on contribution margin at current price
5. what buyer-visible field improves because of it
6. evidence users asked for that improvement

No premium data purchase solely to make the packet look richer.

## Support-cost gate

A high-margin API can still be a bad business if every customer needs manual explanation.

Track qualitatively:

- integration questions per buyer
- failed/ambiguous role mappings requiring intervention
- provider outages
- custom requests
- refund/failure burden

The machine-native product should become **more self-explanatory as it improves**, not create a services business accidentally.

## Mainnet gate

Do not launch real-money Role Reality solely because Base Sepolia succeeds.

Require:

- external usefulness
- acceptable data quality
- known provider rights
- bounded variable cost
- intentional price
- safe failure/refund semantics
- dedicated production wallet/credentials
- basic accounting/logging plan

The first mainnet sale should be an exchange of real utility for real money, not a ceremonial transaction.
