# Experimental offline seller-contract-check: initial checkpoint

This report preserves the initial fixture-only checkpoint. The subsequent
[separately bounded x402scan observation](x402scan-2026-09-11-live-unpaid.md)
adds independently preserved evidence without changing the evaluator. Both reports
are packaged for review; observation results and their limits remain unchanged.

- Source checkout: `RichardRacette/x402-lab`, clean at `710c358b94908a95dc9a405288976b5a15542ca5`; current remote `main` was checked read-only before implementation.
- Local branch: `experiment/offline-seller-contract-check`.
- Evaluator/report versions: `0.1.0` / `seller-contract-report/v1`.
- New seller requests: 0. Wallet/credential access, signing, payments and spend: 0 / $0.
- Publication at this checkpoint: none; no push, PR, merge, deployment or seller contact had occurred.

## Result

**Useful as a local structured-evidence checker; not yet evidence of a commercial
testing service.** The evaluator turns reviewed evidence into repeatable JSON
checks, exposes contradictions and missing fields that an HTTP-402 check cannot
distinguish, and refuses to promote historical summaries into original captures.
Documentation interpretation remains an explicit reviewer input. The evaluator
checks its citations and consistency; it does not independently understand prose.

The implementation is one offline script with tests, two curated input fixtures,
a [usage and input-contract guide](../../docs/SELLER-CONTRACT-CHECK.md), and one
addition to the existing test command. It reuses the existing bounded strict JSON
parser, canonical serialization, SHA-256, UTC validation and input reader. There
are no new dependencies or changes to the buyer, wallet, payment, collection or
deployment code. Identical input bytes produce identical JSON output bytes.

## Evidence actually used

| Evidence | Provenance | Limits preserved |
| --- | --- | --- |
| Ghost, 2026-09-10T23:50:39.128Z | Reviewed payment-field, Bazaar method and documentation excerpts from the preserved ignored metadata/402 captures; explicit issue declarations separately derived from the [earlier report](ghost-2026-09-10-live-unpaid.md) | No original base64 header; original response hashes are supplied provenance, not recomputed from JSON excerpts; no second comparable capture |
| x402scan, 2026-08-25T12:07:58.000Z | Historical flat facts from the repository's pinned Buyer Trace preflight, including its provider source commit | Report-derived only: original raw header/body and response hashes unavailable; not current seller status; no reconstruction as original x402 JSON/base64 |
| Matching, mismatching and conflicting regression cases | Synthetic examples built in tests | Demonstrate evaluator behavior only; not additional seller observations |

The x402scan fixture concerns the x402scan seller, not People Data Labs. The
merchant address in its historical GET identifies the requested transaction data.
No optional second-seller live check was made at this initial checkpoint. The
existing unpaid collector was fixed to Ghost; collection was deferred to a
separately authorized follow-up.
Both fixtures run without access to the ignored/private originals.

## What the machine now checks

| Check | Ghost evidence | x402scan evidence | Value beyond HTTP 402 |
| --- | --- | --- | --- |
| HTTP status | PASS: supplied 402 | PASS: reported historical 402 | Baseline only; never an overall result |
| Encoded header / decoded header-body agreement | UNKNOWN original encoding; PASS for the supplied matching payment-field projections | UNKNOWN | Detects malformed base64/UTF-8/JSON and inconsistent supplied challenges; records what was not retained |
| Advertised version, scheme, chain, asset, amount, recipient | Supplied explicit values agree; exact OpenAPI scheme and issue asset address, atomic amount and recipient remain UNKNOWN | UNKNOWN independent advertisement evidence | Identifies the specific field/source, actual and declared values, rather than treating a paywall as a contract |
| Timeout and token-domain signing metadata | Present in captured offer; absent from exact OpenAPI block and explicit issue declarations | UNKNOWN original metadata presence | Separates field presence/shape from successful signing or a valid EIP-712 domain |
| Documentation / challenge consistency | Available declarations agree; omitted fields stay UNKNOWN | UNKNOWN | Numeric OpenAPI `amountMinor` is compared correctly; unrecognized shapes are not silently guessed |
| Dated payment-term drift | UNKNOWN | UNKNOWN | No drift claim without a comparable earlier capture; synthetic paired cases exercise stable/changed terms |
| Receipt key/procedure | UNKNOWN | UNKNOWN | Missing verification documentation remains a distinct gap |
| Post-payment failure | PASS for a cited, reviewer-normalized 502 promise only | UNKNOWN | Keeps a documented failure policy separate from having observed it |
| Credit, payer binding and redemption | UNKNOWN incomplete contract | UNKNOWN | Keeps service-credit promises, token access, payer linkage and no-second-charge redemption separate |

Ghost's topup-only wording and failure-credit promise remain a cited incomplete
contract requiring interpretation; this experiment does not invent an automatic
prose verdict. Similarly, the earlier report's `schema_freshness` taxonomy concern
is retained in that report, not converted into a new protocol failure here.
Facilitator settlement, seller identity, receipt authenticity, refunds and paid
fulfillment are outside the evaluator's proof. Every output keeps fulfillment,
settlement, receipt verification and credit redemption **UNTESTED**.

## Incremental evidence and validation

The regressions hold HTTP status at 402 while separately changing network, asset,
amount, recipient, scheme or protocol version: field checks FAIL with both source
references. A matching body cannot rescue a malformed header. Absent metadata,
unavailable original captures and missing citations remain UNKNOWN; explicit
cited exclusion yields NOT_APPLICABLE. Conflicting normalized complete document
claims FAIL without calling the promise observed behavior. Duplicate JSON keys,
unsupported alternatives, source/request/time mismatches and incompatible drift inputs
have dedicated checks. No aggregate score or safety recommendation is generated.

Repository typecheck passed. The full suite's 241 existing tests passed, with one
existing Windows symlink-privilege skip; the final focused evaluator suite passed
40 tests. The new JavaScript files also passed syntax checks (the repository's
TypeScript check does not cover these `.mjs` files). Repeated CLI evaluation of
each fixture produced identical output bytes. Independent review identified
source/request binding and advertised-field provenance defects; both were fixed
with regression coverage. Tests did not exercise sellers or execute real
payments. The lockfile and prior reports remain unchanged; original captures
remain ignored.

## Decision recorded at this checkpoint

Decide whether one independently preserved, separately bounded unpaid capture of
the second seller would add enough evidence to justify extending this local
research helper. The current result supports keeping the offline checker; it does
not establish demand for a hosted service or authorize more collection or payment.
The owner subsequently authorized the single unpaid observation documented in
the linked follow-up. That result supersedes this collection decision, while the
fixture-only findings above remain a historical record.
