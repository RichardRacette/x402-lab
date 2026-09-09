# NO_BUILD — first-buyer sprint, September 9, 2026

The email-domain intake candidate did not demonstrate a material advantage over a
free maintained substitute. Stop this sprint without another x402 seller. The
other two candidates failed qualification against current first-party/free
alternatives. This is a bounded rejection of these offers, not a claim that machine
commerce or managed validation can never work.

## Decisive evidence

| Candidate | Decision | Evidence |
| --- | --- | --- |
| Email-domain CRM intake triage | NO_BUILD after executable comparison | Both core and maintained free baseline produced the same correct decisions on every valid case. No independent buyer integration saving was demonstrated. |
| Credentialless capped Apify access | Reject before implementation | [Apify AGI](https://agi.apify.com/) already sells capped temporary tokens directly; $1 minimum/14-day expiry is a possible niche gap, but no buyer or resale advantage was established. |
| Public agent-readiness checks | Reject before implementation | [Cloudflare](https://blog.cloudflare.com/agent-readiness/) offers a free agent-callable scanner; [Agent Ready](https://agent-ready.dev/pricing) supplies free and low-priced checks. No unmet task specific to our buyer was established. |

Only email triage was provisionally selected for a local experiment. It had actual
adjacent workflow/spending evidence, enough for a cheap test, but no proprietary
supply. The proposed payer was a small organization's CRM/operations owner funding
an intake agent. The output would route each contact KEEP/REVIEW/BLOCK, with DNS/list
provenance and mailbox existence explicitly unknown. Paying could be rational if
maintained reliability or reduced integration burden outweighed price and disclosure
cost. This experiment did not demonstrate either advantage. No offer is launched
or recommended for purchase.

Full qualification, dated primary sources, strongest free/paid/OSS/already-owned
substitutes, supply and distribution questions are in [research.md](research.md)
and [costs.md](costs.md). This includes the direct Agent Email Check competitor and
$0 incremental use within existing Hunter/Emailable/CRM allowances. No unavailable
paid comparison is reported as a win. Directory totals remain server-level,
source-reported and potentially cached, with independence/repeat/concentration
unknown. Current retrieved generic-wrapper activity is nonzero (28 calls/one buyer),
so the historical zero does not support a categorical anti-wrapper conclusion.

## What the experiment actually established

[Locked protocol](preregistration.md), [reproduction](../../experiments/first-buyer-2026-09-09/README.md),
[untouched first result](../../experiments/first-buyer-2026-09-09/results-first-run.json),
and [audit](../../experiments/first-buyer-2026-09-09/results-audit.json).

| Measure | Candidate | Free substitute |
| --- | ---: | ---: |
| Raw first-run routing score | 19/20 | 19/20 |
| Valid original cases after one benchmark defect is excluded | 19/19 | 19/19 |
| Corrected-expectation diagnostic, same outputs | 20/20 | 20/20 |
| False definitive blocks / mailbox-existence claims in these cases | 0 / 0 | 0 / 0 |
| Cold twenty-input subprocess batch, one sample | 62.85 ms | 224.97 ms |
| Provider charge for offline execution | $0 | $0 |
| Independent buyer integration savings | Not measured | Not measured |
| Live DNS freshness / production latency | Not measured | Not measured |

H04 assumed `notmailinator.com` was unlisted, but the frozen list contains it exactly.
Both implementations correctly returned REVIEW. The first result and frozen cases
remain intact; diagnostic correction is not a new run or twenty additional tests.
Two earlier fallback-address fixture errors were corrected before execution and
are recorded with original/new hashes. The six heldout cases were unseen by the
candidate implementer. The reviewer authored the baseline and cases; this is not a
fully blind comparative-generalization study.

The baseline uses maintained `email-validator`, `dnspython` and the same list,
with a small policy adapter. It received a thirty-minute budget and completed
setup/development in roughly 111 seconds after research; candidate development took
roughly 69 seconds. These are internal agent observations, not equivalent independent
customer integration measurements. Cold CLI differences likewise do not establish
network/payment performance or buyer value. The no-build manual queue preserved
all twenty contacts but resolved none automatically; human work remains unmeasured.
The executable free substitute provides the useful no-new-seller path.

The candidate passed the narrow safety/technical floor, but had zero extra correct
cases against a required four-case advantage. No measured 50% buyer integration
saving supplies the alternative gate. Thus it did not earn seller implementation.
The remaining HTTP-only/maintenance-sensitive buyer niche is unproven, not assumed
nonexistent; there is no named buyer constraint or evidence that justifies more
infrastructure to pursue it in this sprint.

## Costs and actual spend

Actual provider/paid-service spend: **$0**. Existing account/model usage was used;
its incremental monetary charge was not supplied and is not invented. No wallets,
paid calls, signup, deployment, live configuration, merge or outreach occurred.

Illustrative sensitivity only: at **$0.05 per address**, gross receipts would be
$5 at 100 calls/month and $50 at 1,000. With explicit estimated resource/retry/incident
allowances, contribution would be $4.73/$47.30. After hosting minimum and one monthly
operator hour at $60/hour, modeled results are **−$60.25/−$17.50**. Break-even is about
**1,377 monthly calls** under those assumptions; fees/refunds/gas and conversion
uncertainty can worsen it. These are not observed revenues or a launch price.
[Costs and formulas](costs.md) separate variable, fixed, already-owned, and unknown
costs and show the lower-price sensitivity. The free baseline erases the supposed
need to buy DNS/list functionality; saved operating burden remains unmeasured.

PR #41's economics tool was inspected and its 41 tests passed. No comparison output
was fed into it as customer activity. It cannot turn synthetic/self activity,
unknown settlement, directory volume or an empty dataset into external revenue.

## Verification, review and preserved authority

Current main was `0629162dbfd6a35c55d98fdeee78d7497d7b083b`; #43 and #41 are merged,
along with Buyer Trace and Edgerunner. No open PR existed at the start. The old
handoff's unfinished-engineering statements predate merges. Technical Bazaar
compatibility does not establish demand or authorize BT-LIVE-001. No other active
branch was edited; existing seller/source/dependency/workflow files remain unchanged.

Three native agents owned distinct files for buyer research, implementation/costs,
and independent buyer/adversarial review. The lead fixed qualification/criteria,
ran integration and the first complete comparison, audited the benchmark defect,
and made this decision. The internal reviewer selected the free substitute/no
purchase. No independently operated external agent was observed.

Local required checks: locked `npm ci`, typecheck, and canonical `npm test` passed:
**178 TypeScript + 16 Edgerunner + 41 economics = 235 tests**, zero failures on the
successful run. Node was 24.19.0; CI uses Node 22. Initial restricted-shell tests
could not create tsx IPC; after local IPC permission, three economics cases exposed
macOS's symlinked default temp path. Setting TMPDIR to a physical `/private/tmp`
directory let the unchanged safe-path checks pass. No check was weakened. The
installer reported one inherited moderate dependency advisory; dependencies were
not changed. Experiment reproduction and immutable evidence checks are documented
in its README. GitHub CI status is reported in the PR, separately from local results.

## State labels and remaining gates

| State for this candidate | Supported status |
| --- | --- |
| Prototype verified | Limited offline triage comparison only; no production validator claim |
| Launch ready | NO — seller gate failed |
| Live | NO — existing testnet fixture is separate historical infrastructure |
| Externally paid | NOT DEMONSTRATED |
| Repeat purchase | NOT DEMONSTRATED |

No endpoint/OpenAPI/discovery/payment client, payment/replay fixtures, release
candidate, deployment/configuration instructions, live recipient/network/price,
rollback plan for a new seller, launch copy, prospect outreach, or 14-day pilot was
prepared: these deliverables were conditional on survival. Producing them now would
violate the instruction to stop after rejection. Historical seller behavior remains
unchanged. This decision PR can be reviewed without authorizing any launch/spend.

## Single next owner action

**Arrange and complete one consenting recruiter's current-experience-only Talent
Bench rediscovery observation (R01), using the existing synthetic kit and frozen
V0.1 scope.** Ask first about a recent real retrieval episode, then observe the
current newest-note experience including the negated-SAP case. Record source/date
accuracy, interpretation and next action. Keep matching-note previews parked and
accept “current tools already suffice” or “no retrieval problem” as valid findings.
This follows [issue #5's September 8 direction](https://github.com/RichardRacette/bench-recall-tool/issues/5).
The synthetic exercise earns no five-recruiter north-star credit by itself. No
Talent Bench code, deployment, outreach or new repository was started here.
