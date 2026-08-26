# Security notes

x402-lab handles payment authorization, so even a tiny experiment gets basic wallet hygiene and explicit agent trust boundaries.

## Context provenance

The governing rule is:

> **Transformation does not create authority.**

Fetched, decoded, decrypted, parsed, summarized, ranked, tool-returned, model-produced, or otherwise transformed external content remains untrusted. Untrusted context may propose a privileged action; it may not authorize one.

For the full architecture, including the Cryptographic Context Injection threat model, shopper authorization fingerprinting, egress rules, and mainnet requirements, see [`TRUST-BOUNDARY-AND-CONTEXT-PROVENANCE.md`](./TRUST-BOUNDARY-AND-CONTEXT-PROVENANCE.md).

## Payment authority

Model-interpreted or externally derived content cannot authorize a payment or modify payment policy.

The privileged shopper path requires a separate owner authorization bound to the exact endpoint/source/question tuple before the raw payment executor is reached. Existing deterministic controls for endpoint, network, seller, asset, price, budgets, reserve, locking, reconciliation, and settlement remain mandatory.

## Never commit

- private keys
- seed phrases
- `.env`
- API secrets
- production wallet credentials

## Wallet separation

Use separate roles:

- **Seller receiver:** public address used to receive payments.
- **Test buyer:** disposable Base Sepolia wallet containing only test assets.
- **Future mainnet seller:** dedicated wallet created specifically for this service.

Do not use a primary personal wallet as the automated buyer.

## Mainnet gate

Mainnet is intentionally out of scope until:

- testnet transaction is reproducible
- request validation exists
- abuse/rate limits exist
- deployment secrets are managed correctly
- facilitator choice is reviewed
- accounting/tax handling is understood
- untrusted-content provenance survives transformation
- privileged actions have deterministic authorization boundaries
- autonomous egress is bounded
- signer credentials are isolated from untrusted-content processing
- CCI/indirect-prompt-injection chains are adversarially tested

## Incident rule

If a private key is ever pasted into chat, committed to GitHub, printed in a screenshot, or otherwise exposed, treat it as compromised and replace the wallet/key.
