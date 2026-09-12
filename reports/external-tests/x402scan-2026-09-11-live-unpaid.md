# Experimental offline evaluation of one unpaid x402scan observation

This sanitized report packages a completed observation for review. The evaluator
operates offline; the one-shot collector and original captures remain local and
are not included in this PR. Publication does not broaden the experiment.

Source checkout: `RichardRacette/x402-lab`, local branch
`experiment/offline-seller-contract-check`, HEAD
`710c358b94908a95dc9a405288976b5a15542ca5`. Existing uncommitted experiment work
was retained. This follow-up changes no evaluator, buyer or payment code.
Evaluator `0.1.0`, report schema `seller-contract-report/v1`; evaluator source
SHA-256 `a282fbaefa19e1bee157a67a2f324460342e85d48195ff262f93f2492477622f`.

## Result and narrow significance

**The second observation materially strengthens multi-seller challenge checking
and evidence-gap identification. It does not demonstrate historical capture
drift or a documentation/challenge contradiction.** The unchanged offline
evaluator accepted an original x402scan header, checked its encoding and signing
field shapes, and retained absent documentation and an empty body as distinct
gaps. Ghost and x402scan run through the same report schema; their commercial
terms are not expected to match.

The result contains **14 PASS, 0 FAIL, 18 UNKNOWN and 0 NOT_APPLICABLE** checks.
These counts are bookkeeping, not a score or an overall conformance result.
Fulfillment, settlement, receipt authenticity/verification and credit redemption
remain **UNTESTED**. No refund, identity, payment authorization or safety claim is
made.

## Exactly what was requested and observed

One challenge GET and one GET of its already-referenced public documentation:

```http
GET https://www.x402scan.com/api/x402/merchants/0x7f33b3c113915a0f2981070553ba9538c0f90171/transactions?page=0&page_size=100&chain=base&sort_by=time&sort_order=desc
Accept: application/json
Accept-Encoding: identity

GET https://www.x402scan.com/openapi.json
Accept: application/json
Accept-Encoding: identity
```

Both requests had no body. The merchant address is the public data-query target
already present in Buyer Trace, not a loaded buyer wallet or seller payee.
Transport supplied ordinary Host/connection framing. There were no cookies,
authorization, credentials or request payment headers. A fixed one-shot ledger
prevents the collection script from being run again at its original location.

| Response | Request start UTC | Headers received UTC | Completed UTC | Observation |
| --- | --- | --- | --- | --- |
| Challenge | 2026-09-11T01:37:34.836Z | 2026-09-11T01:37:35.039Z | 2026-09-11T01:37:35.040Z | HTTP 402; one 2,524-byte original PAYMENT-REQUIRED value; complete 0-byte body |
| OpenAPI | 2026-09-11T01:37:35.044Z | 2026-09-11T01:37:35.186Z | 2026-09-11T01:37:35.190Z | HTTP 200; complete 16,544-byte JSON body |

Both responses declared `Content-Type: application/json` and
`Date: Fri, 11 Sep 2026 01:37:35 GMT`. The challenge declared
`Content-Length: 0` and `Cache-Control: no-store`. No content encoding was
declared; no decompression was applied. The empty challenge body was preserved
as a zero-byte file, never replaced with the decoded header or fabricated JSON.

Limits: 8,000 ms per request, 262,144 retained body bytes, 32,768 response-header
bytes, 16,384 PAYMENT-REQUIRED characters, two requests total, zero redirects and
zero retries. Neither response hit a limit. The collector used Node.js 24.19.0
and built-in HTTPS, with certificate verification enabled; the pinned
`@x402/core/http` decoder was used afterward, offline. Strict JSON decoding and
canonical comparison independently agreed with the SDK's decoded result.

Spend, payment attempts, signatures, facilitator transactions and wallet access
were zero. No seller messages, accounts, deployment or publication occurred.

## Preserved provenance

Original material remains ignored at
`artifacts/x402scan-unpaid/2026-09-11-once/`. The directory contains the collection
script, STARTED ledger, observation manifest, selected original response-header
name/value strings, original PAYMENT-REQUIRED value, entity body bytes, decoded
challenge and offline input packet. Headers preserve the values exposed by
Node's HTTP parser, not complete wire framing or whitespace. Cookies and
unrelated headers were excluded. The response header hash covers the retained
ordered name/value array serialized as JSON plus LF, not all wire headers.

| Retained material | Bytes | SHA-256 |
| --- | ---: | --- |
| Original PAYMENT-REQUIRED value | 2524 | `24d78d03f8c713737d07229c3796e619d38a13a89409b0d952537ca748be6ded` |
| Challenge entity body | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| Challenge selected header representation | 2770 | `70e337198dab0988dd7bf5e61d384752655e4fbfd6bb410e25dea9ef7ce44c10` |
| OpenAPI entity body | 16544 | `94710dd685cb3cb5c9678669d90a1c5b53e8158cf8a4679fc9bca0e493c84ed0` |
| OpenAPI selected header representation | 225 | `e4e461b27f41dc5977904641392d699745d5f3d0655ca42a6339a34881aa72bd` |

All five retained-material hashes and sizes were recomputed locally. This binds
local evidence, not seller authenticity. The evaluator separately hashes the
supplied JSON content; its `originHashVerification: NOT_PERFORMED` is unchanged
because origin-byte verification happened in the separate reconciliation step.

Manifest SHA-256: `d585c999842d24b2545f390460c26e09bc8f2a4e3ceef037f3b87af8d66eeaa5`.
Decoded-header SHA-256: `2de56476a8f8513ef3286076d04939f2046a0cd8176a8489f2a734c62c272b24`.
Evaluator input SHA-256: `4ec8801ff8fe75fe2e6ab04b2e2980cf55f7db4dd99d0c51cc62263c94060563`.
Evaluator output SHA-256: `d6be9b07083c08ff50785b45e6c5e91e5bfd8feb79b8bf4ceff873c63ee42427`.
Collector SHA-256: `86bf373222e87cf11a32c811aed0dcec5bdf9ebf8ec0ba424f140518aeb33ced`.

## Current documentation and historical facts

H denotes the decoded original header, with `A = /accepts/0`. O is the captured
[current OpenAPI](https://www.x402scan.com/openapi.json), operation
`/paths/~1api~1x402~1merchants~1{address}~1transactions/get`, ID
`x402_merchants_transactions`. P denotes the preserved historical
[`x402scan.json`](../../fixtures/seller-contract-check/x402scan.json), source
`x402scan-preflight`, observed 2026-08-25T12:07:58.000Z. P is report-derived from
the pinned Buyer Trace source; original August header/body bytes remain unavailable.

| Field / H location | Fresh observed value | Current O agreement | P fact agreement |
| --- | --- | --- | --- |
| Protocol version `/x402Version` | `2` | UNKNOWN: generic `protocols[0].x402 = {}`, no version | PASS: `2` |
| Scheme A`/scheme` | `exact` | UNKNOWN: absent | PASS: `exact` |
| Network A`/network` | `eip155:8453` | UNKNOWN: payment network absent | PASS: `eip155:8453` |
| Asset A`/asset` | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | UNKNOWN: asset contract absent | PASS: same address |
| Atomic amount A`/amount` | `10000` | UNKNOWN: USD `0.01` is declared, but no token/decimals/atomic amount | PASS: `10000` |
| Recipient A`/payTo` | `0x2EC4545f96A24876764bF2B04D54E66A1351bE71` | UNKNOWN: absent; syntax cannot prove ownership | PASS: same address |
| Timeout A`/maxTimeoutSeconds` | `300` | UNKNOWN: absent | PASS: `300` |
| Token name A`/extra/name` | `USD Coin` | UNKNOWN: absent | PASS: `USD Coin` |
| Token version A`/extra/version` | `2` | UNKNOWN: absent | PASS: `2` |

H `/resource/url` exactly equals the complete requested URL, including its query.
H `/resource/method` and `/extensions/bazaar/info/input/method` are `GET`. O's
server and templated GET manually bind to the requested route, and O explicitly
documents HTTP 402. This manual binding is separate from the evaluator: its
exact-literal-path parser returns UNKNOWN for this template. Even if the template
were resolved, the signing fields above are absent. The USD price was not
converted into atomic USDC by assuming token identity, decimals or exchange value.
O's `chain` query filter concerns the queried data; it is not a payment-network
declaration. No OpenAPI object was rewritten to obtain PASS.

O guidance mentions `X-Payment`; no request carrying it was attempted. The v2
challenge alone does not establish whether the server accepts that header as an
alias. H's empty Bazaar query example is not treated as an echo of the request.
Neither point establishes a documented/observed contradiction in this experiment.

The nine P facts agree and P also described an empty 402 body. Thus **no difference
from the reported August terms was found**. `drift.terms` nevertheless remains
**UNKNOWN**: a report-derived summary and an original header are not two comparable
captures. No claim of unchanged behavior throughout the intervening period follows.

## Remaining states and comparison with Ghost

| Check family | x402scan result | Ghost schema reference only |
| --- | --- | --- |
| Header encoding | PASS: original header retained | UNKNOWN: original encoding unavailable |
| Header/body consistency | UNKNOWN: known empty body supplies no JSON challenge to compare | PASS only for supplied matching excerpts |
| Signing metadata presence/shape | PASS for nine captured v2 exact EVM fields | Same checks supported on captured excerpts |
| OpenAPI extraction | UNKNOWN: unsupported template and missing declarations | Exact operation supported; omitted terms still UNKNOWN |
| Receipt key/procedure; post-payment failure, credit, payer binding, redemption | UNKNOWN: not documented in the reviewed OpenAPI | Its own separate documentation results; no term equality assumed |
| Dated capture drift | UNKNOWN | UNKNOWN |
| Fulfillment, settlement, receipt authenticity and credit redemption | UNTESTED | UNTESTED |

No FAIL was produced, which does not mean every comparison passed. No
NOT_APPLICABLE was assigned: absent documentation does not establish that a
contract feature is inapplicable. OpenAPI 200/402 descriptions do not document
post-payment failure behavior. Review was limited to this current OpenAPI and
already preserved project evidence; unvisited documentation and behavior remain
unresolved. No seller credit was inferred and no credit was equated to a refund.

The machine-readable reconciliation compares the same check IDs and schema across
sellers, not their recipients, prices or timeouts. It records two demonstrated
experiment outcomes: reuse of challenge checks on a second independently observed
seller, and more precise evidence-gap identification than HTTP status alone.
Complete automatic documentation parsing and meaningful capture drift detection
were not demonstrated.

## Validation and owner decision

- Full `npm test`: 281 passed, 0 failed, one existing Windows symlink-privilege skip.
- Focused evaluator suite: 40 passed. One-shot collector's synthetic offline tests: 5 passed.
- Repository typecheck and evaluator/collector JavaScript syntax validation passed.
- Fresh, historical and Ghost inputs each produced byte-identical results over two CLI runs.
- The original header also decoded consistently through the pinned SDK and strict local JSON parser.
- Raw material hashes/sizes, original-to-input bindings, nine historical fact comparisons and schema states were checked offline.

Fixture tests validate code; they are not extra seller observations. The collector
is local inspection work, not a new repository execution framework. At the
observation checkpoint, only the capture ignore rule and this report were added
to the existing local experiment. Prior fixtures/reports, lockfile, evaluator and
buyer/payment paths were unchanged by that observation.
Raw captures and the input containing the original header remain ignored. At
completion of the observation, sanitized reports were local deliverables and
nothing had been pushed, published, merged or deployed. The later owner-authorized
packaging publishes the evaluator and sanitized reports only; it performs no
additional seller request or payment.

**Smallest justified decision:** retain this as a local evidence-gap checking
experiment and stop at owner review. The evidence supports that narrow use; it
does not justify expanding into monitoring, paid testing or a hosted service.
