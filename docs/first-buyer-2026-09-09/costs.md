# First-buyer sprint: implementation, supply, and operating costs

Assessment date: 2026-09-09. Scope: exactly three hypotheses. Research uses current primary public sources; no account was created, paid provider called, wallet accessed, or live payment attempted. Spend in this lane: $0. This note does not authorize deployment or establish demand.

## Decision relevance

1. **Email-domain DNS/disposable verification:** technically cheap, with permitted public/OSS supply, but a capable buyer has essentially the same supply for free. This merits only a small comparison if packaging plausibly saves integration work. It cannot honestly sell mailbox existence, delivery certainty, identity, or a complete disposable-domain verdict.
2. **Credentialless spend-capped Apify access:** upstream already has accountless x402 access. There remains a narrow minimum-commitment gap, but no demonstrated advantage sufficient to justify a general wrapper. Per-Actor rights, exact supply cost and success rates require a specific Actor. A generic catalog is out of scope.
3. **Deterministic public agent-readiness checks:** free hosted machine access and free OSS exist; a direct paid competitor already sells x402 scans. Public checks are executable, but their scores are not a proven proxy for a buyer's successful agent task. No scarce supply identified.

## A. Email-domain DNS/disposable verification for agent CRM intake

### Supply and strongest realistic substitutes

The [disposable-email-domains project](https://github.com/disposable-email-domains/disposable-email-domains) permits copying, modification, distribution and commercial use. It also explicitly disclaims that every listed domain is still disposable. A production result should therefore say **listed in source snapshot**, include the list revision/time, and preserve false-positive appeal/review. A negative list lookup establishes only **not listed**, not non-disposable. Registrable-domain matching must respect public suffix boundaries; arbitrary suffix matching is incorrect.

[python-email-validator](https://github.com/JoshData/python-email-validator) is Unlicense OSS, normalizes internationalized email input, checks MX with A/AAAA fallback, rejects Null MX and can share a caching DNS resolver. It intentionally does not perform SMTP probes. This is a particularly strong substitute for a developer-operated agent with Python. Node's built-in DNS plus the same list is another realistically available workflow; it has no provider signup or per-call license fee. The incumbent CRM or sending service may already offer validation, with zero incremental spend inside its allowance. No buyer's actual subscription has been inspected.

[RFC 7505](https://www.rfc-editor.org/info/rfc7505/) defines Null MX as a domain declaring that it does not accept mail. Absence of ordinary MX alone is insufficient to reject a domain because SMTP has an address-record fallback. Resolver timeout/SERVFAIL, stale list evidence, ambiguous/unsupported syntax and untested SMTP must remain explicit uncertainty. DNS observations prove only configuration at query time; a maintained list is still not live verification of every entry.

For a paid adjacent substitute, [Abstract's public pricing and API page](https://www.abstractapi.com/api/email-verification-validation-api) advertises 100 free requests/month and a Starter display of $17/month for 5,000 requests; broader plans include more signals. Its free sample includes richer checks than the candidate. Interactive checkout was not tested and the page includes monthly/annual displays, so confirm billing before treating this as an actionable quote. Provider accuracy claims were not tested. At 100 calls a fresh buyer may pay $0; at 1,000 calls an already-subscribed buyer may also have $0 incremental expense. We must not allocate a new subscription to that buyer to manufacture savings. These are substitutes, **not licensed upstream resale supply**.

### Bounded operational design and effort estimates

Permitted basic supply path: normal public DNS queries through a configured resolver, plus a vendored, versioned, commercially reusable list. Do not transmit full local-parts to a resolver; do not send SMTP or messages. Preserve list licensing. Revalidate update syntax/size and retain last known good snapshot; never silently label stale evidence current. Cache DNS only according to bounded freshness policy and recorded observation time.

Principal burdens: resolver availability and negative responses, IDNA/suffix normalization, false positives and appeals, list refresh failures, telemetry privacy, abusive/high-cardinality input, request/retry bounds and payment reconciliation. A bare DNS/list function is small; operating trustworthy claims and fulfillment dominates engineering.

Estimates, not measurements: 30–60 minutes for a narrow local comparison core; 4–8 additional engineer hours for a production-shaped endpoint, contract and relevant offline fulfillment tests if it survives. Operator burden starts at approximately 1 hour/month, with incident-driven time additional. No integration advantage or accuracy gain has yet been measured in this lane.

## B. Credentialless spend-capped Apify access

[Apify's June 26, 2026 launch](https://apify.com/change-log/pay-for-apify-actors-with-x402) advertises no Apify account, billing setup or API-key provisioning for eligible Actors. The [current x402 integration docs](https://docs.apify.com/integrations/x402) clarify that payment purchases a **prepaid bearer token** used against the existing API; this is accountless, not literally credential-free. It includes a maximum payment amount in the client example. Direct buyer setup still requires a suitable funded wallet. No wallet flow was exercised.

[Apify AGI terms](https://agi.apify.com/) state a $1 minimum prepayment; unused credit is non-refundable and the temporary account/token currently expires after 14 days. This leaves a possible benefit for a sporadic user needing less than $1 of work within that window. That is a narrow cash-commitment hypothesis, not proof of an unmet recurring task. A wrapper adds another payee and another uncertain-outcome boundary.

[Actor eligibility](https://docs.apify.com/actors/publishing/monetize) requires pay-per-event, no extra platform-usage charges, limited permissions, no Standby mode, and creator KYC. For such Actors, platform compute is included in the event price. [Apify's pay-per-event explanation](https://help.apify.com/en/articles/10700066-what-is-pay-per-event) documents a maximum run charge and warns about storage access costs. Current Actor-specific documentation overrides old generalized pricing prose.

[Current platform pricing](https://apify.com/pricing) lists $5 monthly free usage; Starter $19/month including $19 usage; $0.20/compute-unit at these tiers; external transfer $0.20/GB; dataset reads $0.0004/1,000. Existing account credits are a real substitute and not a new cost. PPE price, proxy need, start events, result count, retries and optional platform billing are Actor-specific; platform resource rates alone cannot establish the cost of an unspecified capability.

[General terms effective July 9, 2026](https://docs.apify.com/legal/general-terms-and-conditions) give a non-transferable service license, prohibit sublicensing, and put required third-party permissions on the customer. Actor use has separate terms. This does **not** establish that every API integration or resale of a derived result is prohibited; it means a generic resale entitlement has not been verified. Need the specific Actor, its terms and the intended output before claiming reliable permitted supply. Public scraping availability is not permission to republish every target's content.

Estimates: at least 8–16 engineer hours for one allowlisted Actor wrapper with bounded cost, asynchronous outcomes, replay protection, restart reconciliation, deletion and failure recovery. Routine maintenance approximately 2 hours/month plus incidents. These estimates are scope warnings, not reasons to extend this sprint. At a hypothetical $0.01 upstream task cost, 100/1,000 tasks consume $1/$10 before our hosting/support/retries; at $0.10 each, $10/$100. **Neither rate was measured or quoted for a selected Actor.** At positive wrapper markup the direct route is cheaper once prepaid credit is used; below $1 use, expiry can reverse the cash comparison. Without specific output and run measurements, numerical contribution margin is unavailable.

## C. Deterministic public agent-readiness checks

[Cloudflare's agent-readiness announcement](https://blog.cloudflare.com/agent-readiness/) documents the public scanner, a stateless `scan_site` MCP surface, and checks for discovery, machine-readable content, access declarations and capabilities. Public machine use already exists; an HTTP-only runtime does not automatically lack access. Its overall score measures selected conventions, not successful use by all agents. The scanner can flag missing optional conventions that may be irrelevant to the buyer's task.

[Agent Readiness Auditor](https://github.com/asish-singh/agent-readiness-auditor) is MIT OSS with CLI/structured check output and published check code. Buyer may run it locally on their existing host; marginal license price is $0. Its safety heuristics are not proof that a page is safe. A baseline should receive comparable public HTTP access, timeout and integration budget.

[Agent Ready pricing, updated July 18, 2026](https://agent-ready.dev/pricing), includes anonymous free scans, keyless CLI/MCP quotas, $19/month Pro, and accountless x402/MPP at $0.02 for 25-page scans or $0.25 for 250-page scans. At 100/1,000 paid 25-page scans, posted charge is $2/$20 before the buyer's wallet/funding costs; this is a published quote, not observed spend. No paid scans or account registrations were made. [Developer docs updated September 2, 2026](https://agent-ready.dev/docs) supply REST/OpenAPI, SDK and MCP integration paths. A new wrapper cannot claim payment compatibility or JSON output as unique.

Supply can be our own bounded public HTTP observations, respecting denial/access controls and retaining timestamps and observed status. No need to resell a scanner's output. Principal costs: redirects/DNS rebinding and private-network exclusion, decompression/body caps, timeout/redirect fanout, partial results, schema evolution, repeated-fetch consistency, private URL leakage and reports incorrectly calling authentication a broken endpoint. Estimate 6–12 engineer hours for a small robust public-URL checker plus contract/fulfillment tests; 1–2 operator hours/month. Runtime demand and freshness advantage unmeasured.

## Common low-volume economics: sensitivity, not an offer or revenue claim

The existing seller is hosted on Railway according to `HANDOFF.md`. [Railway's current pricing](https://railway.com/pricing) lists Hobby $5 minimum including $5 usage, CPU $0.00000772/vCPU-second, and egress $0.05/GB. Actual account plan, invoices, headroom and production resource use were not inspected. A new endpoint on an already-owned host may add little cash; a standalone service must account for its minimum. The comparison must show both honestly.

[CDP's current FAQ](https://docs.cdp.coinbase.com/x402/support/faq) states 1,000 facilitator transactions/month free, then $0.001/transaction. Gas is separate in that FAQ; other current CDP pages describe sponsorship. Exact launch billing/sponsorship is therefore **unverified** here, not assumed zero. This rate is a sensitivity input; existing Base Sepolia x402.org configuration is a technical fixture and is unchanged.

Illustration for A only, in USD budgeting terms: exploratory price **$0.05 per single-address request** (not per batch), $0 upstream API fee, conservative resource-use allowance **$0.0002 per address**, and incident handling **0.5% × 5 minutes × $60/hour = $0.0025 per address**. A CLI may process a batch of these individual tasks; this table models one payment per address. These are deliberately explicit estimates, not a price supported by willingness to pay or measured incidents. Routine operator time is **1 hour/month × $60 = $60 fixed**. Hosting cash is `max($5, resource allowance)` for an isolated small instance; unused minimum is separated below to avoid counting credits twice. Refunds, tax, exchange/conversion fees and additional gas are unknown and excluded, so this is an optimistic partial estimate.

| Monthly successful paid requests | 100 | 1,000 |
| --- | ---: | ---: |
| Hypothetical gross receipts at $0.05 | $5.00 | $50.00 |
| Resource allowance, including failed/retried work budget | $0.02 | $0.20 |
| Estimated variable incident labor | $0.25 | $2.50 |
| Facilitator fee if free allowance remains | $0.00 | $0.00 |
| Contribution after these estimated variable costs | $4.73 | $47.30 |
| Remaining hosting minimum | $4.98 | $4.80 |
| Routine fixed operator labor | $60.00 | $60.00 |
| After shown fixed costs, before unknown costs/tax | **−$60.25** | **−$17.50** |

With these assumptions, the cash/labor break-even is approximately **1,377 calls/month**, accounting for $0.001 facilitator fees beyond 1,000, while resource use remains below the $5 host minimum. At $0.01, comparable break-even is approximately 9,847 calls/month. At 100/1,000 requests/month these prices do not cover the modeled routine burden. If an existing host has spare paid capacity, remove only the $5 incremental hosting minimum; do not erase operator time. If operator time is voluntarily uncompensated, report cash surplus separately from economic profit. If the service truly avoids incidents or maintenance, measure that before replacing these assumptions.

Price alone does not qualify A: the buyer can use a $0 OSS baseline; a $0.05 call must save enough recurring work or improve quality to justify the new integration and wallet burden. At $0.02 readiness-competitor pricing, even before correctness/supply issues, 100/1,000 scans yield only $2/$20 gross for us. An Apify passthrough starts with additional upstream charges and a second payment-risk boundary.

## Measurement and reporting discipline

**Observed in this lane:** repository documents and public source terms/prices; $0 authorized/actual provider spend. **Estimated:** engineering effort, resource reserve, incident frequency/time, fixed operator cost, sensitivity prices and break-even. **Unavailable:** paid substitute performance, customer willingness to pay, independently funded agent demand, production latency/costs, actual account allowances, live payment fees/refunds, real incident rates.

PR #41's `scripts/economic-report.mjs` and `docs/ECONOMIC_REPORT.md` distinguish supplied seller operations from buyer-provider purchases, fixtures/testnet/self activity, unknown outcomes and coverage. Do not feed this sensitivity table into that tool as observed operations. Do not convert USDC into USD implicitly; the budget illustration is not a mixed-currency ledger. The production accounting inputs should eventually carry genuine costs of unpaid/failed attempts, refunds and uncertain fulfillment. No synthetic comparison can create independent demand.
