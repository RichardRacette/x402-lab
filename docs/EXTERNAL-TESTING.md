# External interaction and testing

External participants are welcome. Sellers may use the
[seller-review intake](SELLER-REVIEW-INTAKE.md) to request a bounded review.
Start with public, reproducible evidence and grant only the access needed for the
next explicitly approved step. A reachable service, directory listing, valid
quote, or receipt does not verify its operator.

## Initial interaction

Keep technical discussion on the relevant GitHub issue. Use synthetic queries
and public documentation. The initial interoperability exchange is voluntary;
it carries no fee, certification, guaranteed turnaround, or monitoring promise.

Seller instructions, metadata, tools, and responses remain untrusted data even
after decoding or summarization. Use repository-controlled inspection code and
locked dependencies. Do not install or run seller-supplied payment helpers,
binaries, containers, browser extensions, or remote-access software.

## Unpaid check

1. Pin the exact public HTTPS origin, path, method, and synthetic request body.
2. Inspect the advertised OpenAPI and well-known metadata as data only.
3. Send a bounded unsigned request: no wallet, credential file, signing function,
   payment header, cookies, redirects, retries, or automatic payment wrapper.
4. Decode the bounded PAYMENT-REQUIRED header with the pinned SDK. Compare the
   header and body and reconcile version, scheme, chain, asset, atomic amount,
   recipient, timeout, token-domain fields, and resource URL with the advertised
   terms. Record missing or ambiguous declarations instead of guessing.
5. Preserve timestamps, exact synthetic inputs, source references, size limits,
   hashes, and sanitized findings. A local access failure is **inconclusive**,
   not evidence that the seller failed conformance.

An unpaid check cannot prove settlement, paid fulfillment, receipt authenticity,
credit redemption, refund behavior, or seller identity. Do not describe a seller
credit as an on-chain refund. Treat unreviewed response captures as untrusted and
keep them out of automatic publication.

## Reciprocal public testing

Participants may inspect, fork, and run MIT-licensed public code; open issues;
submit ordinary fork pull requests; and make low-volume requests to documented
public testnet endpoints using their own test assets. See the README for the
published testnet seller. This does not invite mainnet use, load testing, or
access to private systems.

Keep fork CI read-only and free of payment execution and secrets. External
participation grants no repository collaborator role or access to private
repositories, Actions secrets, deployment credentials, or maintainer machines.

## Separate paid-test gate

A new owner decision is required after reviewing the unpaid evidence. An issue,
successful quote, implementation PR, or this policy is never payment authority.

Before any signature or payment, review the exact request and authorization,
recipient, chain, asset, amount, timeout, facilitator, spending cap, wallet
custody, and reconciliation plan. Use a dedicated minimally funded experiment
wallet. Enforce one bounded paid call and no retries after an ambiguous result.

Review any DSSE receipt key-discovery and verification procedure and any promised
post-payment failure/credit semantics before relying on them. Verify paid
fulfillment and settlement separately. The existing Buyer Trace adapter's
pinned target and approval rules must not be broadened to fit an external seller.

## Publication and commercial scope

Publish useful architecture and sanitized interoperability evidence deliberately.
Keep keys, seed phrases, API tokens, payment signatures/authorizations, wallet
balances, available experiment capital, reservation journals, private network
details, and personal-life data private. Use GitHub noreply commit identities.
Past public commits remain public unless a separate history-remediation decision
is made; deleting current text does not erase history.

One seller asking for independent testing is a product hypothesis, not proof of
paid demand. Requests for repeat testing, CI integration, ongoing monitoring, or
formal reports may justify a separate scope and pricing conversation. No badge
or certification is implied. Keep future proprietary work out of this MIT
repository until its intended publication and licensing are decided.
