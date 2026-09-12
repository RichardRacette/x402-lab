# Experimental offline seller contract checker

**Experimental research utility; offline evaluation only.** This evaluator asks
whether supplied seller evidence agrees with a stated
contract. It does not contact an endpoint, load credentials, sign, pay, verify a
receipt, or decide whether a seller is safe. It prints JSON for local review.

```sh
node scripts/seller-contract-check.mjs --input fixtures/seller-contract-check/ghost.json
node scripts/seller-contract-check.mjs --input fixtures/seller-contract-check/x402scan.json
node --test scripts/seller-contract-check.test.mjs
npm run typecheck
```

## Design-partner CLI/CI alpha

The repository also contains a thin release-gate interface over the unchanged
offline evaluator. It adds stage labels, machine-readable evidence groupings and
deterministic CI exit codes; it adds no fetch or verification capability.

```sh
npm run seller-contract:gate -- --stage pre-deploy --input fixtures/seller-contract-check/ghost.json
npm run seller-contract:gate -- --stage post-deploy --input fixtures/seller-contract-check/ghost.json
```

The caller prepares the evidence packet. `pre-deploy` and `post-deploy` are labels
for the operator's release workflow and do not change evaluation logic. A
post-deploy packet must contain separately collected unpaid evidence; the gate
never contacts an endpoint.

| Exit | Decision | CI interpretation |
| ---: | --- | --- |
| `0` | `NO_CONTRADICTION_FOUND` | Every supplied evidence check is PASS or NOT_APPLICABLE. This is not payment authorization. |
| `1` | `BLOCKED_BY_CONTRADICTION` | At least one supplied evidence check is FAIL. |
| `2` | `REFUSED` | Usage, input, schema or file access was refused. |
| `3` | `REVIEW_REQUIRED` | No contradiction was found, but at least one check remains UNKNOWN. |

The output schema is `seller-contract-gate/v1`. It lists verified, contradicted,
unresolved and not-applicable check IDs separately, while payment authorization,
fulfillment, billing, settlement, credit redemption and receipt verification stay
explicitly `UNTESTED`. CI may invoke the same command directly:

```yaml
- name: Seller contract pre-deploy gate
  run: npm run seller-contract:gate -- --stage pre-deploy --input path/to/reviewed-evidence.json
```

This alpha is repository-local and unpromoted. It is not an npm package, hosted
service, certification, generic receipt verifier or paid experiment. Advancement
requires successful repeated use by the Ghost operator plus one or two independent
sellers/reviewers, including evidence that the output affected a release decision.

No installation, network access, wallet SDK or payment library is needed for the
evaluator itself. It reuses `canonical`, `decode`, `hash`, `instant` and the bounded
ordinary-file reader from `scripts/economic-report.mjs`. That module's CLI is not
invoked on import. The existing economic, buyer and Ghost probe code is unchanged.
The full `npm test` command includes the new regressions.

## Evidence packet v1

The two small fixtures are executable input examples. Required root keys:
`schema: "seller-contract-evidence/v1"`, `seller` (an opaque ID), `current`, and
`documentation`. Optional `previous` supplies one earlier capture for the same
seller. No supplied file path, URL, command or instruction inside the packet is
executed or followed. The only file read is the CLI's explicit `--input` path.

Each capture has `observedAt` (strict UTC ISO timestamp or null), `request`
(`method`, exact HTTPS `url`, optional JSON `body`), `httpStatus` (integer or null),
and `sources`. The status is supplied evidence, not an independently verified
HTTP transcript. Source timestamps remain separately visible.
Header/body source URLs must match the request, and known source/capture times
must agree before extracting their terms. Unknown times cannot support drift.

Each source requires `id`, `role`, `kind`, `coverage`, `url`, `observedAt`, `content`
and `note`. Optional `originSha256` and `originLocation` describe the preserved
source from which the supplied excerpt or facts were derived. Explain the origin
hash's basis in the note/location: response bytes, local source-file bytes, etc.

| Source property | Supported values / interpretation |
| --- | --- |
| `kind` | `capture`, `report-derived`, `public-documentation`, `synthetic`; never interchangeable |
| `coverage` | `complete` for the supplied representation, or `excerpt`; excerpt omissions do not establish origin omissions |
| `role: header` | Original base64 PAYMENT-REQUIRED string; bounded strict UTF-8/JSON decoding |
| `role: decoded-header` | Preserved decoded JSON; encoded-header validation stays UNKNOWN |
| `role: body` | Supplied parsed 402 body JSON |
| `role: openapi` | Exact request path/method with `x-payment-info` and one explicit matching server origin |
| `role: well-known` | Root `x402Version`, and one `resources[]` entry matching the exact request URL/method |
| `role: advertised` | Reviewer-normalized flat declarations: `version`, `scheme`, `network`, `asset`, `amount`, `recipient`, `timeout`, `domainName`, `domainVersion` |
| `role: reported-challenge` | The same flat fields, optionally `resource`, strictly `report-derived`; never encode these into a fabricated original header/body |
| `role: documentation` | Supplied prose/JSON available for explicit cited documentation claims |

Inputs are limited to 512 KiB, depth 32, at most 16 sources per capture and 24
documentation claims. Duplicate JSON keys, invalid UTF-8, invalid UTC dates,
duplicate source IDs and unexpected envelope fields are refused. Encoded headers
have a 16,384-character limit. The evaluator does not implement a fetch option.

## Documentation is reviewed input, not automated prose interpretation

Each documentation claim has `topic`, `coverage`, `value` and `refs`:

- Topics: `receipt-key`, `receipt-procedure`, `failure`, `credit`, `payer-binding`,
  `redemption`.
- Coverage: `complete`, `partial`, or `not-applicable`. The reviewer decides
  whether the cited material actually specifies the topic. A key alone does not
  establish its verification procedure; token access alone does not establish
  binding to a payer; a credit promise alone does not establish redemption.
- `value` is the reviewer's normalized semantic declaration. Compatible claims
  must use the same normalized value. Different complete values for one topic
  mean conflicting declarations, not automatically different wording for the
  same promise. This interpretation is not independently checked by the tool.
- Each reference is `{ "source": "source-id", "pointer": "/json/pointer",
  "quote": "exact nonempty substring" }`. An empty pointer selects a source's
  root string. Every cited substring must exist in a supplied documentation,
  OpenAPI, descriptor or advertisement source. References never trigger fetching.

A complete, consistently cited declaration produces PASS **for documentation
presence under that review**, not for the truth, sufficiency or fulfillment of
the promise. Partial claims or missing citations/evidence stay UNKNOWN; a quote
that contradicts its cited bytes or conflicting normalized complete claims FAIL.
Cited explicit exclusion produces NOT_APPLICABLE. Missing receipt documentation
does not silently become NOT_APPLICABLE. No keyword scanner, model or semantic
classifier is involved. A mistaken reviewer classification can still produce an
incorrect documentation conclusion; citation checks do not fix interpretation.

## Report v1 and scope

Output uses `schema: "seller-contract-report/v1"`, `evaluatorVersion: "0.1.0"`,
the exact input-byte SHA-256, supplied observation time/request, and evidence
descriptors with source URLs and computed `contentSha256` values. Content hashes
cover canonical JSON with sorted object keys and a trailing LF, not original HTTP
bytes. Claimed original hashes are retained with `originHashVerification:
"NOT_PERFORMED"`. Hashes bind supplied data; they do not authenticate a seller.

Each check has `id`, one of PASS/FAIL/UNKNOWN/NOT_APPLICABLE, `reason`, `refs` and
`values`. References address source JSON; `view: "decoded-header"` means a JSON
pointer after decoding an original header, while `view: "content"` means the
supplied source content. Packet references identify evidence such as HTTP status.
Pointers to missing fields explain UNKNOWN/absence findings.

Automated checks cover header/body decoded-JSON equality, each advertised core
term, token-domain name/version and timeout, required signing-field shapes for
the x402 v2 exact EVM profile, exact resource binding, optional Bazaar method
agreement, documentation citations and normalized conflicts. They do not verify
a token contract, complete EIP-712
domain, ownership, facilitator, payment authorization, or cryptographic receipt.
Unrecognized profiles/layouts and multiple offers remain unresolved; no first-offer
fallback is used. Excerpt equality is explicitly limited to the supplied projection.

Drift compares only two supplied, strictly ordered captures with identical method,
URL and canonical request body, unpaid 402 status, matching representation/kind/
coverage and capture timestamps, and all comparable payment fields present.
Report-derived facts cannot establish drift. Synthetic pairs test the algorithm,
but their reports retain synthetic provenance. This does not establish what
happened between observations or detect changes in omitted response fields.

Identical input bytes yield identical output bytes; there is no generated clock,
random ID or external state. The CLI returns exit 0 when it evaluated evidence,
even if checks FAIL or remain UNKNOWN, and exit 2 for refused input. Exit 0 is
not a conformance pass. `observedBehavior.fulfillment`, `creditRedemption`,
`settlement` and `receiptVerification` remain **UNTESTED** in this unpaid-only
experiment. There is no overall status, score, badge, or payment recommendation.

## Fixture provenance and privacy

`ghost.json` contains reviewed payment-field, Bazaar method and documentation
excerpts from the 2026-09-10 preserved captures, plus separately labeled
report-derived explicit issue declarations. Benchmark-derived asset and atomic
amount values are not attributed to the issue. Its descriptor excerpt moves
original `resources[4]` to `resources[0]`.
The raw base64 header was never retained and is not recreated. Hashes of original
response bodies are reported provenance; hashes of supplied excerpts are computed
separately. The original ignored files and earlier reports remain untouched.

`x402scan.json` describes the unrelated **x402scan API seller**, not the merchant
whose transactions its proposed GET would query. It derives flat facts from
`createBuyerTracePreflight().x402scan` and `targets[0]` at the recorded source
commit. Those are historical 2026-08-25 observations reported by repository code,
not fresh seller documentation or original raw captures. Original response hashes
are unavailable; the retained origin hash covers the local preflight source file.
Signing-metadata presence and raw consistency therefore stay UNKNOWN.

Both fixtures run without private/ignored files. The regressions construct clearly
synthetic examples in memory. The [initial offline experiment report](../reports/external-tests/seller-contract-check-2026-09-11.md)
records the fixture-only checkpoint. A [separately authorized x402scan observation](../reports/external-tests/x402scan-2026-09-11-live-unpaid.md)
subsequently exercised the unchanged evaluator with a preserved original header.
Its nine payment fields agreed with the historical summary, while original-capture
drift remained UNKNOWN. Its original header, response bytes and input packet remain
local and ignored; the historical fixture above is not replaced with that capture.

The sanitized reports publish reviewed facts and hashes. They do not make local
raw evidence available or establish independently reproducible live observations.
The one-shot collection script is not included in this offline evaluator package.
Generated output remains subject to explicit review before publication; there is
no automatic capture or publication behavior.
