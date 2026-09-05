# Buyer Trace adapter: issue 27, offline verification

The adapter constructs one People Data Labs merchant-transactions request from
`createBuyerTracePreflight()`. The proposal uses Base mainnet `eip155:8453`,
10,000 atomic USDC ($0.01), page zero and a page size from 1 through 100. These are
the **dated preflight fixture terms**, not a current quote. The seller and
existing shopper still use Base Sepolia.

## What is implemented

`runBuyerTrace()` defaults to a dry-run that performs no HTTP, wallet, RPC or
ledger access. Its optional execution path requires all of the following:

- `execute: true` and the existing opaque `PurchaseAuthorization`;
- authorization fingerprinted over method, exact URL including query order,
  network, scheme, asset, recipient, amount, signing domain, timeout, page,
  page size, source provenance, question, session path and one-call ceiling;
- an owner-controlled session file and an atomic budget no greater than 10,000;
- explicitly injected transport and payment-construction components.

It reserves the session with exclusive file creation, writes the secret-free
reservation and fsyncs it before invoking dependencies. Concurrent attempts,
fresh authorizations replayed against the same session, and later process runs
using the same file are refused. Failed and ambiguous attempts consume the
reservation. There is no automatic deletion, refund, recovery or retry. Do not
delete a reservation or switch session paths to retry a possibly settled call.
The session path/directory is trusted owner configuration, never model/provider
input. A different path is a different explicitly approved session; the adapter
does not enforce a wallet-wide lifetime budget across independently approved
sessions. No live wallet is connected.

The execution seam makes one challenge request and at most one signed request.
It requires the x402 v2 `PAYMENT-REQUIRED` header, an exact matching resource URL
and a single matching requirement. It rejects network, asset, recipient, price
(including a lower price), pagination, signing-domain and timeout drift,
additional payment alternatives and extensions. Requests forbid redirects.
Only reconstructed preflight terms reach the payment component, so extra
caller/provider metadata cannot expand its signing input.

Fulfillment must be HTTP 200 with the approved page/page_size, boolean
has_next_page and no more than the approved number of rows. Even when more pages
exist, none are requested. Data stays explicitly untrusted through JSON parsing.
Audit records contain public request/term fields and an authorization fingerprint;
they exclude signed headers, wallet output, response rows and dependency errors.

The adapter reports `response-received-settlement-unverified`. It **does not
claim a confirmed transaction, on-chain settlement, or actual spend** from an
HTTP response. All fixture executions spent $0.00. Future live wiring must add
reviewed balance/reserve and settlement reconciliation controls before use.

## Demo and canonical checks

```sh
npm ci
npm run typecheck
npm test
npm run buyer-trace
```

The final command emits the dated one-page proposal with `mode: dry-run`, zero
authorized spend and zero payment attempts. Existing `buyer-trace:preflight`
continues to work independently.

The deterministic tests inject fake HTTP responses and a synthetic payment
string, never a private key. They cover successful request construction,
missing/forged/mismatched approval, all bound payment/request fields, budget
refusal, atomic concurrency, replay, caller mutation, dependency failures,
pagination/row overflow, prompt-like metadata and a second 402 response. CLI
tests prove the default dry-run and explicit-execution refusal.

Verified on Windows with Node 24.19.0 and npm 11.17.0, based on `main` commit
`bd7d301bebc8342cdada9abab59360b5b93943ac`:

- `npm ci`: passed, 125 locked packages installed; no dependency or lockfile changes.
- `npm run typecheck`: passed with the canonical TypeScript configuration.
- `npm test`: **124 passed, zero failed/skipped**, including 37 new adapter/CLI tests.
- `npm run buyer-trace`: passed; emitted an offline proposal with zero spend.
- `git diff --check`: passed.

The initial sandbox `npm test` failed before collection because Node's
`os.userInfo()` returned `uv_os_get_passwd ENOMEM`. The same canonical command
passed using normal Windows identity access; no substitute runner or suite
reduction was needed for the final result. A focused 32-test development run
used `node --import tsx --test src/buyer-trace-adapter.test.ts` before the final
five tests were added. `npm ci` reported one moderate advisory in the locked
dependency tree and an esbuild install-script approval notice; no audit fix,
script-permission change or broad upgrade was performed.

The base commit's existing CI run
[33945024873](https://github.com/RichardRacette/x402-lab/actions/runs/33945024873)
is successful. That result belongs to the base, not this unpushed patch.

## Future live entrypoint: unavailable, do not execute

The actual CLI recognizes this proposed entrypoint:

```sh
npm run buyer-trace -- --execute
```

It currently **always refuses** before authority minting, credentials or network
access. Its refusal branch was exercised only by deterministic CLI tests. There
is no runnable live purchase command in this patch; no transport, signer or
mainnet permission is silently installed. Programmatic callers can exercise the
adapter with injected components and an owner capability, as the tests do.

A future explicit owner approval must first cover the reviewed live transport,
signer/credential boundary, balance/protected reserve, receipt verification,
reconciliation and persistent session ownership. Revalidate the exact PDL
merchant URL and query, current challenge date, scheme/version, Base mainnet
network, USDC asset/decimals/signing domain, recipient, amount, timeout,
facilitator, page size, wallet identity and one-call maximum. Update the reviewed
preflight if the dated terms changed. No quote, recipient or credential is
invented here, and the dated recipient must not be treated as freshly verified.

## Rollback and next action

This patch has no deployment, database migration, credential change or seller
network change. Revert the patch commit to remove the adapter and CLI. Preserve
any reservation files if this seam is ever exercised outside fixtures: uncertain
payments require reconciliation, not file deletion.

Next action: review the fixture adapter and the remaining live integration
boundary. Keep issue 27's live-spend authorization at $0.00. A technical fixture
does not establish demand or select Product #2.
