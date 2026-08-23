# Security notes

x402-lab handles payment authorization, so even a tiny experiment gets basic wallet hygiene.

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

## Incident rule

If a private key is ever pasted into chat, committed to GitHub, printed in a screenshot, or otherwise exposed, treat it as compromised and replace the wallet/key.
