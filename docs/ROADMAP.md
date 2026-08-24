# x402-lab Roadmap

The rule remains:

> **Earn complexity.**

The commercial rule is now stronger:

> **Earn revenue before automating more product.**

Current governing docs:

- `FULL-PROJECT-AUDIT-2026-08-24.md`
- `BUSINESS-PLAN-V0.3.md`
- `PRODUCT-VIABILITY-2026-08-24.md`
- `CODEX-SESSION-PLAN-2026-08-24.md`

Older product-discovery docs are historical records, not active implementation instructions.

## Milestone 0 — Public seed ✅

Public repository established.

## Milestone 1 — First automated x402 transaction ✅

Proven flow:

```text
buyer → 402 → signed payment → settlement → retry → protected result
```

## Milestone 2 — Initial product exploration ✅

`/analyze-job` proved the first payment loop.

Evidence Slice was selected as the first cleaner agent-native shelf item.

## Milestone 3 — Evidence Slice V0 ✅

Delivered deterministic extraction, source provenance, public-URL safety, tests and paid Base Sepolia flow.

## Milestone 4 — Public seller proof ✅

Delivered:

- public Railway seller
- x402 V2
- first public paid Evidence Slice transaction
- Bazaar metadata
- bounded buyer/shopper gateway

What this proved:

> x402-lab can expose, sell, settle and fulfill a machine-payable service.

What it did not prove:

> a commercially strong product exists.

## Milestone 4.5 — Product viability gate 🚧

The purpose of this phase is to reject weak commercial ideas before sunk-cost engineering.

### Discovery A — Evidence Slice

**Status: protocol proof, weak commercial confidence.**

Do not rescue with features.

### Discovery B — Agency Opportunity / Recruiting Pressure

**Status: rejected before implementation.**

Reason: substantial overlap with current hiring-signal / recruiting-intelligence products.

### Discovery C — automated Role Reality Check

**Status: rejected as a paid automated SKU.**

Reason:

- current free/SMB tools already provide richer role-level market intelligence
- market-calibration agents are already emerging
- public-data talent-intelligence workflows are increasingly cheap to reproduce
- CareerOneStop rights require additional clarification before transformed commercial use

Role Reality concepts may still be used internally as research/fulfillment helpers.

## Milestone 4.5C — Search Preflight Workbench + first-revenue experiment 🚧

### Goal

Find out whether **human recruiting judgment** can be sold as a bounded service while software reduces fulfillment time.

Working service:

> **Recruiting Search Preflight — Human Review Gate**

The buyer supplies one requisition/search plan. A human recruiter reviews what is unclear, unrealistic, contradictory, or worth changing before heavy sourcing/outreach begins.

### Engineering task

Build an internal Search Preflight Workbench, not a paid public endpoint.

It should:

- normalize requisition/search-plan inputs
- organize clearly licensed/public market facts where useful
- preserve source geography/vintage/limitations
- surface obvious compensation/constraint inconsistencies
- generate traceable calibration questions
- produce Markdown + JSON drafts
- leave an explicit human-review layer
- measure draft generation / review time

### Pass condition

A knowledgeable reviewer can turn a draft into a credible deliverable in roughly **25–30 minutes or less**, without rewriting most of it.

### Fail condition

If the workbench is mainly salary lookup/template filler or creates more checking than it saves, stop and document why.

No LLM, premium data, candidate scraping, database, frontend, MCP or new paid endpoint is automatically allowed to rescue it.

## Milestone 4.6 — External usefulness validation

Show 3–5 finished sample reviews to real recruiters.

Before showing the output, ask what they would normally research/challenge on the req.

Continue when:

- at least 3/5 report a meaningful action/research change; and
- at least 2/5 request another review / recurring use; and
- no systemic factual-quality problem appears.

Compliments do not count as demand.

## Milestone 4.7 — First external revenue

Offer the next review at a stated pilot price.

Candidate learning ladder:

- free samples for validation
- `$25` pilot
- `$49` early normal test
- `$75–$99` only if the review materially changes a live search/intake decision

Human fulfillment time is treated as a variable cost.

Exit condition:

> **A real external buyer pays real money for one Search Preflight review.**

Payment channel should be the easiest legitimate option for that buyer. Do not force a human buyer into crypto merely to preserve the experiment's aesthetic.

## Milestone 4.8 — First repeat payer

Exit condition:

> **The same external buyer chooses to purchase a second review.**

This is more important than first payment and more important than additional protocol work.

Record:

- price
- fulfillment minutes
- what the buyer changed
- what research/tooling was replaced
- missing facts
- whether the buyer returned

## Milestone 5 — Agent-native human-service distribution

After the service can be fulfilled reliably, test an agent-native marketplace listing.

Candidate channel: a marketplace that allows AI agents to purchase human expert services through x402 escrow with machine-readable inputs and asynchronous delivery.

This tests a distinctive thesis:

> **Can a recruiting agent purchase human recruiter judgment as a callable escalation step?**

Do not confuse listing availability with demand. Track genuine external purchases only.

## Milestone 6 — Productize what repeats

After paid reviews reveal repeated value, identify one component that is:

- repeatedly requested
- rule-like enough to automate safely
- supported by appropriate data rights
- economically useful
- machine-consumable

Only then expose that component as an automated paid SKU.

Possible examples may emerge from:

- title/occupation normalization
- constraint contradiction detection
- compensation calibration
- search-plan completeness
- specialty-specific intake questions
- another repeated need discovered from buyers

No component is pre-approved.

## Milestone 7 — Machine-native Product #2

Goal:

> an external machine buyer pays for a component that was first proven inside real paid work.

Reuse the existing x402 seller/payment/discovery stack.

Payment frontage remains protocol-neutral at the business level.

## Milestone 8 — First repeat autonomous buyer

Exit condition:

> the same external machine buyer purchases the validated automated component more than once without a human explicitly directing each transaction.

Track contribution margin, not transaction count.

## Milestone 9 — Profitable real-money automation

Before mainnet/production automated sales require:

- validated repeated utility
- clear data rights
- bounded costs
- production credential/wallet separation
- failure/refund semantics
- intentional price
- accounting/logging

Exit condition:

> real automated external sales with positive contribution per fulfilled transaction.

## Milestone 10 — Business decision

Evaluate the whole operation on:

- external revenue
- repeat payer rate
- revenue per buyer
- contribution after owner time
- fulfillment time trend
- buyer concentration
- support burden
- acquisition channel
- data/vendor risk
- which work has become automatable

Possible outcomes:

1. deepen the winning service
2. automate a proven subcomponent
3. build a protocol-neutral commercial brand
4. specialize in a recruiting niche that shows stronger demand
5. pivot to a newly exposed agent-commerce bottleneck
6. stop commercial investment if buyers do not appear

## Profit milestone ladder

- `$1` external revenue — crossed into commerce
- `$100` cumulative external revenue — non-ceremonial demand
- first repeat payer — strongest early signal
- `$500/month` revenue — tiny business signal
- `$1,000/month` contribution after owner time — meaningful side-business validation
- `$5,000/month` contribution — evaluate deeper automation, formal commercial brand and deliberate acquisition

These are learning milestones, not forecasts.

## Protocol posture

x402 remains worth learning and operating. It has formal Linux Foundation governance and production cloud support, but raw settlement volume is noisy and should not be treated as TAM.

The eventual commercial product can use whichever front door makes buying easiest:

- x402
- MPP
- MCP
- ordinary API billing
- agent marketplaces
- conventional human payments

The business is not loyal to a payment protocol. It is loyal to profitable customer value.
