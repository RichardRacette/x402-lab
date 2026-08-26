## Summary

<!-- What changed, in plain language? -->

## Why

<!-- What problem or hypothesis does this address? -->

## Scope boundaries

<!-- What explicitly did NOT change? -->

- [ ] No unrelated product behavior changed
- [ ] No wallet/network/credential permissions were broadened silently

## Validation

- [ ] `npm ci`
- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] Other validation is documented below, if applicable

## Payment impact

- [ ] This PR cannot execute or authorize a real payment
- [ ] This PR changes payment-capable behavior and the exact authorization/spend boundary is documented below

<!-- If payment-capable behavior changes, explain the maximum spend, authorization boundary, network, and fail-closed behavior. -->

## Follow-up

<!-- Optional: intentionally deferred work, issue links, deployment verification, or falsification criteria. -->
