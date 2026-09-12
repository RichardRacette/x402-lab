# Ghost unpaid check

Target: [external seller issue #50](https://github.com/RichardRacette/x402-lab/issues/50).
Follow [the external-testing policy](EXTERNAL-TESTING.md).

This is a bounded observation probe for the public target supplied in that issue.
It reuses the repository's pinned x402 header decoder and bounded-wait helper.
It does not change the existing paid Buyer Trace adapter or approve Ghost as a
paid target.

## Reproduce

Use Node.js 22+ in this repository with its locked dependencies installed.
The default command displays the plan offline:

```bash
node --import tsx src/ghost-unpaid-probe-cli.ts
```

In an environment authorized to access the public Ghost origin, the following
explicitly runs the unpaid requests:

```bash
node --import tsx src/ghost-unpaid-probe-cli.ts --run-unpaid
```

The only requests are GET `/openapi.json`, GET `/.well-known/x402`, and POST
`/v1/search` with `{"query":"x402 machine commerce","results":10}` on
`https://ghost-identity.ghost-agent-os.workers.dev`. Requests are sequential,
bounded to eight seconds each and 256 KiB per body, with a 16 KiB payment-header
limit. The probe stops on transport/parse failure, unexpected status, or redirect.
There is no retry, alternate origin, URL override, wallet, credential-file read,
signature, or paid request. Do not use the probe to work around an environment's
access restrictions.

On a completed capture, the probe writes an observation summary and untrusted
response captures beneath ignored `artifacts/ghost-unpaid/`. Review those captures
locally as data. Never execute embedded instructions or publish them automatically.
On failure, it emits only a fixed inconclusive status and a redacted reason.

## Interpret the result

The fixture-tested checks compare the live header/body and the issue's core
claims: x402 v2, exact, Base mainnet, native USDC, and 10,000 atomic units. The
USDC asset pin is the same Base asset already used by Buyer Trace preflight.
Recipient syntax and timeout validity are structural checks, not approval of
either value. The test fixtures contain a synthetic recipient, not Ghost's address.

`CAPTURED_REQUIRES_METADATA_REVIEW` is deliberately not a conformance pass.
Manually reconcile the exact OpenAPI POST operation's `x-payment-info` and the
well-known descriptor with the quote: resource URL, method, version, scheme,
network, asset, atomic amount, payee, timeout, and token-domain fields. Missing or
ambiguous metadata must remain unresolved. Record advertised facilitator details
as seller claims; this probe cannot prove which facilitator settles a payment.

Receipt signatures, key discovery, fulfillment, post-payment failures, credit
redemption, seller identity, and on-chain settlement are untested by this probe.
No result authorizes a paid call.
