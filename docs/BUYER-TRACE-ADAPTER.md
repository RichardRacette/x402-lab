# Buyer Trace adapter: issue 27, offline verification

## Round 2 wired command (2026-09-05)

**LOCAL_E2E_VERIFIED / LIVE_NOT_RUN. Actual spend: $0.00.** The command now
connects real parsing, review validation, a fresh interactive owner decision,
bounded native HTTP, the pinned x402/viem signer interface, response validation
and a durable audit journal. It has no unconditional not-implemented refusal.
The historical Round 1 section below describes the prerequisite commit only.

### Future operator commands

These commands are implemented but are **not approval to execute a purchase**:

```sh
npm run buyer-trace
npm run buyer-trace -- --validate-config --approval REVIEW.json --session RESERVATION.jsonl --key-file OWNER_KEY.txt
npm run buyer-trace -- --execute --approval REVIEW.json --session RESERVATION.jsonl --key-file OWNER_KEY.txt
```

The first is offline. Validation reads only the bounded review file and reports
`credential: NOT_LOADED`, `ownerApproval: STILL_REQUIRED`, `live: NOT_RUN`.
Execution requires a real terminal and an exact newly typed confirmation:
`APPROVE sha256:<displayed-fingerprint> UNTIL <reviewed-UTC-expiry>`.
The review JSON, a model response, or a server challenge cannot mint authority.
Production entrypoints accept no injectable approval callback or fixture switch.

`REVIEW.json` must contain exactly these four keys:

```json
{
  "plan": "REPLACE_WITH_EXACT_CREATE_BUYER_TRACE_PLAN_OBJECT",
  "expiresAt": "REPLACE_WITH_REVIEWED_UTC_ISO_TIMESTAMP",
  "sessionBudgetAtomic": "10000",
  "walletAddress": "REPLACE_WITH_REVIEWED_WALLET_ADDRESS"
}
```

This illustrative JSON deliberately fails validation until placeholders are
resolved. Export the exact plan object, including property/query order, offline:

```sh
node --import tsx --input-type=module -e "import {createBuyerTracePlan} from './src/buyer-trace-adapter.ts'; console.log(JSON.stringify(createBuyerTracePlan(),null,2));"
```

The operator supplies the review-file path, a protected owner-controlled
reservation path, the reviewed wallet address, expiry, and a protected key-file
path. The key file contains a single hex private key; it is loaded only after
fresh interactive approval and challenge validation, and its derived address
must match the review. No credential has been provisioned by this change.

Before any future approval, review the exact current method/origin/path/query,
PDL merchant, page zero and page size (1–100), x402 v2 exact scheme, Base mainnet
`eip155:8453`, USDC asset/decimals/domain, recipient, 10000 atomic amount ($0.01),
300-second authorization validity, current provider quote and facilitator,
wallet identity/funds/protected reserve, expiry, credential custody, and how
settlement will be reconciled. The checked-in August 25 preflight at
`4b29346e90ff12393534adfece1ec32f8dd155b1` is **historical**, not a current quote.
Any drift requires a separately reviewed preflight update; the command refuses
it. No RPC balance check or independent chain reconciliation is implemented.

Expiry must leave the SDK's 300-second validity plus two request timeouts before
approval/reservation (316 seconds with the default 8-second timeout), and must
be no more than 15 minutes away. It is rechecked before signing and sending.
The optional `--timeout-ms` can only reduce the default, within 1–8000 ms.
The same cancellation signal reaches the runtime signer; a delayed key read
cannot start signing after the caller has timed out.

### Protocol and durable outcomes

One initial 402 request plus one approved signed GET is one acquisition. There
is no SDK fetch wrapper, automatic payment retry, recovery acquisition, chain
RPC or unadvertised extension. Redirects, additional challenge alternatives,
binding drift and pagination drift are refused. Signing uses installed
`@x402/evm` 2.23.0 `ExactEvmScheme` and `@x402/core` 2.23.0 `x402Client`, with
viem's account signer. The installed SDK's EIP-3009 source was inspected:
`dist/esm/chunk-REWHAFTU.mjs` computes validity from signing time and signs
`TransferWithAuthorization`; the wrapper validates its domain/message before
the signing capability is invoked. There is no custom cryptography or upgrade.

An exclusive `wx` reservation is fsynced before HTTP, then journal events are
fsynced before signing and sending. Concurrent processes and restart/replay
cannot reuse that path. Any ambiguous failure burns the reservation. Preserve
it for reconciliation: do not delete it or choose another path to repurchase.
This local exclusion is not remote idempotency. The directory and all live
session paths remain part of the owner's trusted control plane.

HTTP 200 is only fulfillment transport evidence. A bounded PAYMENT-RESPONSE
receipt is classified as `reported`, `failed` or `unknown`; no outcome is called
independently `confirmed`. Missing, malformed or inconsistent evidence remains
unknown. Receipt classification is durably recorded before reading the body,
so a failed/oversized fulfillment does not erase known settlement evidence.
The JSON body is capped at 1 MiB and shares the request deadline. Output exposes
only audit fields and row count, never provider rows, keys, authorization
headers or replayable signatures. A response-received result with a failed or
unknown receipt is not settlement success.

### Verification and rollback

Canonical `npm ci`, `npm run typecheck`, `npm test`, and the CLI integration
harness run from the isolated checkout. The suite includes the actual production
executable, transport/adapter/SDK path against loopback, exact drift refusals,
expiry, concurrency, replay, malformed/redirect/timeout/body/receipt failures,
and redaction. The E2E child mocks only owner input, signing capability and
provider responses; its invalid all-zero key cannot be used by a real account
signer and its HTTP transport is structurally confined to loopback. The live
executable has no path to these fixtures. A separate event-controlled test
proves a delayed credential read cannot cause signing after refusal.

After both cores passed, one independently reproduced stretch defect was fixed:
the existing shopper CLI no longer echoes unknown argument contents to stderr.
Its synthetic redaction regression failed before and passed after the fix.
Final counts and exact revisions are recorded in the dependent PR/handoff.

Review the adapter prerequisite first, then this wired-command PR. No seller,
deployment, wallet/network permission or lockfile change is included. Rollback
uses a reviewed revert; preserve any reservation journals. Operator: run the
non-executing validation command only; future live execution requires a new
explicit owner decision after all facts and prerequisites above are reviewed.

## Historical Round 1 record

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
