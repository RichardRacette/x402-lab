# Ghost: one live unpaid observation

- Observed at: **2026-09-10T23:50:39.128Z** (UTC, probe completion time).
- Source commit: [`8f51d3aadb662188bbb7ca5662210526048be963`](https://github.com/RichardRacette/x402-lab/commit/8f51d3aadb662188bbb7ca5662210526048be963), current `main` when cloned; PR #51's probe and policies are present and unchanged.
- Scope: [issue #50](https://github.com/RichardRacette/x402-lab/issues/50), one invocation of the existing unpaid probe, Node.js **v24.19.0**, locked dependencies.
- Original outcome: **`CAPTURED_REQUIRES_METADATA_REVIEW`**, not a pass.
- Reviewed verdict: **observed core payment terms agree; metadata completeness and paid behavior remain unresolved**. No contradictory core payment value was found in this observation.
- Wallet loaded: no. Credential files inspected: no. Signing/payment attempts: **0**. Spend: **$0**.

The [earlier access-blocker report](ghost-2026-09-10.md) is preserved. This observation supersedes its lack of live evidence, without changing what happened in that earlier environment. Neither report certifies Ghost, verifies its operator or recipient ownership, proves settlement or paid fulfillment, or authorizes spending.

## Execution and retained evidence

A fresh, clean clone of `RichardRacette/x402-lab` preserved other checkouts and their uncommitted work. No applicable `AGENTS.md` was found in this checkout or its task-directory ancestors. The contributor, security, external-testing and Ghost-probe instructions were reviewed. Issue #50 and its latest comments were read: the existing acknowledgement and DSSE/credit questions had no seller reply at preparation time.

The offline command was inspected first, then the live command was executed **once**:

```bash
node --import tsx src/ghost-unpaid-probe-cli.ts
node --import tsx src/ghost-unpaid-probe-cli.ts --run-unpaid
```

The sandbox's offline attempt failed in tsx's OS user lookup (`uv_os_get_passwd` / `ENOMEM`) before the CLI started. Normal scoped approval allowed the offline plan and then the one live invocation. There was no live retry or alternative transport for the probe.

All requests used `https://ghost-identity.ghost-agent-os.workers.dev`, sequentially:

1. `GET /openapi.json`, `Accept: application/json`.
2. `GET /.well-known/x402`, `Accept: application/json`.
3. `POST /v1/search`, `Accept: application/json`, `Content-Type: application/json`, with this exact UTF-8 body (no trailing newline):

```json
{"query":"x402 machine commerce","results":10}
```

The unchanged probe used 8,000 ms per request, 262,144 bytes per response body, and 16,384 characters for `PAYMENT-REQUIRED`; credentials were omitted, redirects rejected, and retries absent. It supplied no cookies, authorization, payment signature, or credit token. No seller helper was installed or run.

| Response | HTTP | Body bytes | SHA-256 of received body bytes |
| --- | --- | --- | --- |
| `/openapi.json` | 200 | 34,290 | `0356d2b4f0c44f858f376d2b073449911b0174bbb2ead1cb49f10d1f0a3164bc` |
| `/.well-known/x402` | 200 | 6,562 | `9e36cb7205715880d4a57e9508eb62ebaa026e6e648122995a3af89263ab0b7e` |
| `POST /v1/search` | 402 | 2,869 | `dee6f6873027e253b660434a499551121385bf371f976a8b83a1476fce1cafbc` |

Local `observation.json` and `UNTRUSTED-captures.json` were read as data beneath ignored `artifacts/ghost-unpaid/2026-09-10T23-50-39-129Z/`. The probe preserves parsed response JSON and the SDK-decoded header, plus original response-body hashes. It does **not** retain the raw header string, a header hash, complete HTTP headers, or original body serialization; no such evidence is claimed. The raw captures remain local and ignored. Only reviewed values and necessary public source references appear here.

## Terms comparison

Source locations below refer to the captured JSON, not a subsequent fetch:

- **I**: [issue #50](https://github.com/RichardRacette/x402-lab/issues/50), advertised request and payment bullets. The issue says USDC/$0.01; the expected native-USDC address and 10,000-unit pin come from this experiment's policy/probe.
- **O**: [OpenAPI](https://ghost-identity.ghost-agent-os.workers.dev/openapi.json), exact `/paths/~1v1~1search/post/x-payment-info`; operation ID `verified_search_v1_search_post`. Method comes from the enclosing `post` operation, origin from `/servers/0/url`.
- **W**: [well-known descriptor](https://ghost-identity.ghost-agent-os.workers.dev/.well-known/x402), `/resources/4`, the unique entry whose `/resource/url` is the search URL. Its protocol version is at document root `/x402Version`.
- **H**: SDK-decoded `PAYMENT-REQUIRED` on the captured POST 402; local capture `/2/decodedPaymentRequired`.
- **B**: captured POST 402 JSON body; local capture `/2/body`.

Abbreviations: **R** = `https://ghost-identity.ghost-agent-os.workers.dev/v1/search`; **U** = `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (the pinned native-USDC asset); **P** = `0x26c536F9FB50d5Bd3f6eFE4738807d88E23FA13e` (advertised recipient, ownership unknown). **A** means `/accepts/0` relative to W, H or B. Each cell marks agreement of an explicit declaration as **MATCH**, a conflicting declaration as **MISMATCH**, or an absent/ambiguous declaration as **UNKNOWN**. MATCH cells do not fill UNKNOWN cells in other sources or constitute an overall pass.

| Field | I: advertised claim | O: exact POST payment block | W: search descriptor | H: decoded header | B: 402 body |
| --- | --- | --- | --- | --- | --- |
| Method | MATCH: `POST`, request bullet | MATCH: enclosing operation `post` | MATCH: `/method = POST` | MATCH: `/extensions/bazaar/info/input/method = POST` | MATCH: same extension location, `POST` |
| Resource URL | MATCH: R, request bullet | MATCH: `/servers/0/url` + exact path = R | MATCH: `/resource/url`, `/endpoint`, `/url` = R | MATCH: `/resource/url = R` | MATCH: `/resource/url = R` |
| Protocol/version | MATCH: x402 v2 | MATCH: `/protocols = ["x402"]`, `/x402Version = 2` | MATCH: root `/x402Version = 2` | MATCH: `/x402Version = 2` | MATCH: `/x402Version = 2` |
| Scheme | MATCH: `exact` | UNKNOWN: no scheme in `x-payment-info`; `/info/x-guidance` separately says `exact` | MATCH: A`/scheme = exact` | MATCH: A`/scheme = exact` | MATCH: A`/scheme = exact` |
| Network | MATCH: `eip155:8453` | MATCH: `/network = eip155:8453` | MATCH: A`/network = eip155:8453` | MATCH: A`/network = eip155:8453` | MATCH: A`/network = eip155:8453` |
| Asset | MATCH: USDC label; UNKNOWN: issue omits contract | MATCH: `/asset = U`, `/price/currency = USDC` | MATCH: A`/asset = U` | MATCH: A`/asset = U` | MATCH: A`/asset = U` |
| Atomic amount / price | MATCH: $0.01; UNKNOWN: issue omits atomic integer | MATCH: `/price/amountMinor = 10000` (number), `/price/amount = "0.01"` | MATCH: A`/amount = "10000"`, `/price_usd = 0.01` | MATCH: A`/amount = "10000"`, `/price/amount = "0.01"`, `/price/amount_minor = 10000` | MATCH: same values and locations as H |
| Recipient | UNKNOWN: omitted | MATCH: `/payTo = P` | MATCH: A`/payTo = P` | MATCH: A`/payTo = P` | MATCH: A`/payTo = P` |
| Payment timeout | UNKNOWN: omitted | UNKNOWN: omitted | MATCH: A`/maxTimeoutSeconds = 600` | MATCH: A`/maxTimeoutSeconds = 600` | MATCH: A`/maxTimeoutSeconds = 600` |
| Token-domain name/version | UNKNOWN: omitted | UNKNOWN: omitted | MATCH: A`/extra/name = "USD Coin"`, A`/extra/version = "2"` | MATCH: same name/version | MATCH: same name/version |
| Advertised facilitator | UNKNOWN corroboration: issue names `facilitator.payai.network` | UNKNOWN: omitted | UNKNOWN: omitted | UNKNOWN: omitted | UNKNOWN: omitted |

The single W offer is deeply equal to H's offer; W's resource object also equals H's. Offline reconciliation additionally found the **entire decoded H object deeply equal to B**, beyond the probe's narrower version/accepts/resource/extensions check. This is parsed-object equality, not raw byte/header equality. All 11 existing probe checks were true.

No MISMATCH was found in the core payment declarations above. OpenAPI's `price.amountMinor` is a numeric atomic amount; expecting an `accepts[0].amount` string there would be an unsupported parser assumption, not contradictory pricing. Its `info.version = "1.0.0"` is the API's own version, not the x402 protocol version. The omitted scheme, timeout, token-domain and facilitator fields remain missing in the exact payment block; prose elsewhere does not add them to it.

The 600-second quote timeout agrees across W/H/B; it is not the probe's 8-second transport timeout or approval of a payment authorization window. P passes address syntax only. U matches the repository pin; no token contract call, payer proof, recipient-ownership check, signature, facilitator request, or settlement verification occurred.

Two ancillary fields deserve clarification without changing the core verdict: H/B `/price/task_class` is `schema_freshness` even though the resource is Verified Web Search (taxonomy meaning unresolved); the Bazaar input example says `recent x402 news`, not our synthetic query. That example is discovery metadata, not evidence that the POST body was rewritten or that a search was fulfilled.

## DSSE and failure-credit documentation

The already-captured public OpenAPI and descriptor were reviewed as documentation. Seller instructions to sign, retry, top up or use a helper were treated only as untrusted text and were not followed. The descriptor links `/provider/listing` to `/.well-known/ghost-service.json`; one separate web-document retrieval was refused by the web tool as **unsafe to open (non-retryable)**. It was not retried through another transport. This limits documentation review; it is not an origin availability or conformance finding. No additional seller API operation was exercised.

| Question | What the reviewed public documentation establishes | Still unresolved |
| --- | --- | --- |
| Receipt contents and verification | O `/info/description` and `/info/x-guidance`, and W search `/description`, advertise a DSSE receipt over the query/results, returned URLs and provider. | No DSSE verification key, receipt key-discovery URL, payload type, signature algorithm/procedure, or rotation/revocation contract was identified in those captured sources. No receipt was obtained or verified. |
| Refund versus credit | O `/info/x-guidance` and exact search operation `/description` promise Ghost credit if providers fail after settlement. O `/paths/~1v1~1gate~1decide/post/description` says Ghost has no outbound payment path for machine refunds. | These describe future-service credit, not demonstrated on-chain repayment. No post-payment 502 or refund was observed. |
| Payer binding | O `/paths/~1v1~1gate~1credit/get/description` says balance/history access is scoped to the presented token; the GET and search POST declare optional `x-ghost-credit-token` headers. | This describes token access, not a demonstrated cryptographic binding to the x402 payer. How a failed search credits the correct payer and delivers a usable token, particularly to a first-time payer, remains unspecified in the reviewed material. |
| Redemption and recovery | O `/info/x-guidance` describes reading credit at `GET /v1/gate/credit` and spending with `X-Ghost-Credit-Token`. O credit-topup POST `/description` says a token is returned once, only its hash is stored, and a lost token is not recoverable. | Applicability of topup rules to failure credits, exact 502 response/token schema, expiry, atomic redemption, insufficient-credit behavior, and prevention of a second charge remain unresolved. None was exercised. |

There is a documentation tension to resolve: O credit-topup POST `/description` describes topup as the only way credit enters, while the search documentation separately promises failure credit. The material reviewed does not reconcile these paths. The exact search OpenAPI operation lists only 200/402/422 responses, with no 502 schema. Its 200 schema is empty and does not specify the DSSE receipt. These are documentation gaps, not evidence that credits or receipt verification fail in operation. The registry-auth key mentioned for `/.well-known/mcp-registry-auth` is described as a domain-control key; it must not be assumed to be the DSSE receipt key.

## Local validation and publication scope

No concrete probe defect was demonstrated; **no code, tests, dependencies, paid Buyer Trace adapter, network targets, or policy checks were changed**. The original observation is retained. No live observation was repeated after review.

Validation uses fixture/mocked tests and is separate from the three live responses above. `npm ci` and `npm run typecheck` passed. The first `npm test` run passed 184 of its first 185 tests; the existing shopper-argument test's child hit its 15-second deadline. That unchanged test passed in isolation, then the full canonical `npm test` rerun passed: 241 passed, 1 existing Windows symlink-privilege skip, 0 failed. This includes all seven synthetic Ghost tests. No timeout or assertion was changed. PR CI remains the merge gate; its result is recorded in the accompanying PR. The dependency lockfile remains unchanged (SHA-256 `eb82c2d0d08b9f5e8cfe661ca14dc18f374041eb4f892e9c607117b497637b67`).

This report is the sole intended repository change. Public text and the diff were reviewed for private data, with an independent evidence review; captures remain ignored. Repository-local effective author/committer identity was checked as `RichardRacette <306977684+RichardRacette@users.noreply.github.com>`; actual commit identity is checked before publication. The earlier blocker report is unchanged.

## Single next justified action

Ask Ghost on issue #50 to supply the missing machine-readable declarations and the public DSSE verification/failure-credit contract, including payer binding and redemption without a second charge. Continue documentation reconciliation from that reply. **Stop before signing or payment**; even complete unpaid agreement would require a separate owner decision for any paid experiment.
