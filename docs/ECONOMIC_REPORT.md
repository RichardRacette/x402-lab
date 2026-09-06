# Supplied-record service economics → Flywheel

A small, offline first slice of issue #40. It answers: what supplied activity is
customer-facing fulfillment, what is provider spend, what was test/self activity,
what money/costs are actually known, and what should a human review next?

It neither performs nor authorizes a payment. It does not fetch logs, a chain,
wallets, customer identities, a bank account, or social accounts. It does not run a
model, create tasks, install dependencies, alter a schedule, or write canonical
Ledger history. Existing seller, buyer, Buyer Trace, Observatory and Edgerunner code
are unchanged. This is a user-invoked report, not autonomous revenue generation.

## Use the tool

Requires the repository's Node.js 22+ runtime; the new utility has **no dependencies**.
No npm install, API key, wallet, GitHub App, or Windows scheduler access is required
for these commands. Choose an existing PRIVATE parent outside Git and cloud sync:

```text
node scripts/economic-report.mjs --input data/economics/activity.example.json --output-dir /PRIVATE/PARENT/demo
node scripts/economic-report.mjs --input data/economics/activity.empty.json --output-dir /PRIVATE/PARENT/empty
node --test scripts/economic-report.test.mjs
```

Equivalent npm commands: `npm run economics:report -- --input INPUT --output-dir OUTPUT`
and `npm run economics:test`. Canonical npm test retains the original TypeScript
suite and appends these tests. Dependency declarations/lockfile are unchanged.

The supplied example is clearly SYNTHETIC and exports **no economic signals**. The
empty template reports NO_OBSERVATIONS_SUPPLIED and UNKNOWN, not zero revenue. It
is a shape example, not an attestation that a real service had no transactions.

With an operator-reviewed input file, the same command writes report.md, report.json,
signals.json, decision.md, and a last-written manifest.json. Exact repeats return
UNCHANGED without altering file bytes, timestamps or separate human notes. Changed
inputs/reports and incomplete output directories refuse while preserving evidence;
there is no automatic overwrite, repair or retry. Keep ordinary notes in decision.md.
Use a quiescent local directory, one writer and owner-controlled OS permissions.
The path checks are not protection against a hostile same-user process or filesystem.

## Narrow input contract: `x402.activity-input/1`

Start with one example's exact fields; unknown fields are refused. One file covers
one `service_id`, one UTC operation window [start, end), and an `as_of` observation
cutoff. Dates need actual UTC seconds (optional milliseconds); do not invent an
instant for historical documents that provide only a date. Settlement can occur
after window.end but must be on/after operation start and no later than as_of.
Therefore this is an **operation-cohort report, not period cash flow or accounting
revenue recognition**. The source's observed/refund state is a snapshot at as_of.

`reviewed_for_local_analysis: true` means the operator has reviewed this input for
local analysis. It is a declaration, not an authenticated approval credential or
permission for any external action. `classification` is synthetic or project_safe.
Use only minimized records, opaque IDs, and source references/hashes; no customer
names, email addresses, wallet keys, credentials, raw headers, resumes or private
message contents. The utility is NOT an automatic PII detector.

Coverage has a state (complete/partial/unknown), an expected distinct in-window
operation count when complete, and a declared evidence reference. A matching count
checks internal consistency; it cannot authenticate source completeness. Partial or
unknown coverage MUST have expected_records=null. Do not label a selected excerpt
complete merely because every supplied row parsed successfully.

Each record is one finalized snapshot of a logical operation, not every log line
or retry. Assign a stable operation_id; identical repeats collapse and conflicting
snapshots refuse. A settled payment reference cannot fund two operations of the
same role/network in this profile. Batch allocations and incremental reconciliation
are intentionally unsupported; normalize those explicitly before using this tool.

Required record fields:

| Field | Meaning |
| --- | --- |
| operation_id / occurred_at | Stable logical operation identity and actual start time. |
| role | seller (we serve the user) or buyer (we buy a provider's output). Never infer this from the sign of an amount. |
| environment / network | production, testnet or fixture; current supported labels are Base mainnet 8453, Base Sepolia 84532, offchain or unknown. These are metadata, not a network-selection permission. |
| counterparty | external_confirmed/self/unknown and a stable opaque resolved ID or null. A wallet is not automatically a person/customer. |
| fulfillment | succeeded/failed/unknown. An HTTP status alone is not settlement evidence. |
| payment | settled/not_settled/unknown, opaque settlement reference, settled_at, currency USD/USDC/null, amount and refunded. |
| cost | currency, amount, complete/partial/unknown variable-cost coverage for this operation. Unknown currency/amount must be null. |
| evidence | Opaque reference, SHA-256 and OBSERVED/OWNER_REPORTED/UNVERIFIED source status. |

Money is a nonnegative decimal STRING with at most six fractional places and nine
whole digits per record. It is aggregated using integer micro-units, not floating
point. Negative contribution is computed rather than accepting negative payments.
USD and USDC are never converted or presumed equivalent. Use null for unknown
refunds or costs; `0` is an explicitly known zero. A settled payment needs its
reference and timestamp even when its amount is not supplied.

The evidence hashes are **declared and not fetched**. Record hashes and output
manifests check supplied bytes and arithmetic, not original execution or settlement
authenticity. UNVERIFIED production rows are kept in dispositions, not admitted as
established customer activity. Counterparty qualification must be supported by the
operator's source, not by a model's guess or a public chain address count.

## Reading the result correctly

Every unique supplied row receives a disposition, including outside-window,
fixture, testnet, self, unknown relationship/network and unverified sources. Nothing
ambiguous silently becomes income or disappears from the evidence inventory.

Paid fulfillments require a succeeded seller operation, declared settled positive
payment and a confirmed external relationship in production. Buyer purchases never
become seller receipts. Refunds alter net cash, not the original positive-payment
fulfillment count. A refunded request is not evidence of retained revenue.
Unique/repeat buyers count operator-resolved IDs on paid fulfillments within this
window. Missing IDs produce a lower bound and UNKNOWN exact count; they are not
dropped to make a precise-looking result. This is not a count of distinct humans.

Cash tables separate gross and net external receipts from provider outlay. The
JSON also preserves known subtotals and missing counts. Totals/counts stay UNKNOWN
when coverage or relevant classification is incomplete. Known variable costs are
not automatically complete cost. Provider purchase totals are NOT subtracted a
second time from seller cost; only explicitly attributed per-operation costs enter
the cohort contribution proxy.

The proxy is net fulfilled receipts minus declared variable costs across the
classified seller cohort (including failed/unpaid operations' costs). It is withheld
when payment/outcome/refund/cost inputs are missing, there is a settled unfulfilled
request, or currencies cannot be combined. It excludes fixed overhead and tax; it
is not audited profit, accounting revenue, lifetime value or a savings estimate.
A partial dataset's calculable proxy remains only that supplied cohort's arithmetic.

One deterministic next-review card prioritizes actual paid-but-unfulfilled activity,
then known fulfillment failures, absent buyer evidence, unknown costs or negative
cohort contribution. It can recommend validating a buyer problem rather than building
more supply. All recommendations remain RECOMMENDATIONS_ONLY, not execution orders,
pricing changes, product strategy decisions, financial advice or evidence of demand.
The full record/disposition catalog remains available for human review.

## Existing Flywheel boundary, unchanged

signals.json uses the adopted `flywheel.signals/0.1` shape exactly. It can emit
paid_fulfillments, fulfillment_failures, unique_buyers, repeat_buyers, variable_cost_usd,
and contribution_margin_usd when that metric is established within the declared
complete service/window coverage. Missing metrics are omitted with reasons, not
coerced to zero. USD-only signals require actual declared USD inputs; USDC-only
arithmetic stays in the readable report, with no implicit currency conversion.
Totals too large to round-trip micro-units through safe numeric signals are withheld
while the exact decimal report remains available.

Synthetic input, incomplete coverage, unverified coverage evidence, or unresolved
production classification withhold the whole economic export. Exported statuses are
conservatively OWNER_REPORTED even when a supplied source calls itself OBSERVED:
the compiler did not independently verify those sources. Signal source_ref and
evidence_sha256 point to the exact canonical report.json, which retains the window,
service scope and missingness. Keep that file with its signals. Do not sum overlapping
snapshots or treat repeating the same report as growth. No distribution/lead source
was supplied by this profile, so distribution remains empty, not zero followers/leads.

This does not change Lawn ranking/authority, remotely dispatch a worker, or replace
the adopted producer/consumer. Tests additionally exercise these outputs against
the exact adopted Lawn validator outside this repository; no private Lawn module
is copied into this public project or required to run the normal Node tests.

## Delivery and adoption

Review this PR and use its standalone utility from a separate checkout. No daily
Lawn environment update is required. `main` was the parent; open #35/#36 (Buyer Trace)
and #38 (Edgerunner) are not dependencies and were not edited. Future adoption must
preserve all npm script additions and rerun the actually combined tree; this PR's
CI does not certify an untested combined stack.

Production log ingestion, external-customer qualification, exchange-rate valuation,
and distribution telemetry remain later source adapters, driven by available actual
evidence. No credentials or new collectors were added just to populate a report.
The latest user-approved direction is to find useful buyer-facing work, not resume
the parked Windows timestamp investigation. This task's report is a decision aid,
not another model benchmark or an assertion of autonomous revenue.

Rollback: stop invoking this standalone command and close/revert the reviewed PR.
Keep the input, output manifests and review notes; no database, service, payment,
scheduler or canonical Ledger rollback is involved.
