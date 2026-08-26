# Contributing to x402-lab

x402-lab is a public R&D repository for machine-commerce experiments. Changes should preserve the project's core rule: **earn complexity and keep payment authority separate from untrusted data or model context.**

## Development workflow

1. Start from the latest `main`.
2. Create a narrowly scoped branch.
3. Keep commits small enough that the history explains what changed and why.
4. Run the full local verification set before opening a pull request:

```bash
npm ci
npm run typecheck
npm test
```

5. Open a pull request into `main` and describe:
   - what changed;
   - why it changed;
   - what explicitly did not change;
   - validation performed;
   - whether the change can execute, authorize, or alter any payment.
6. Merge only after CI is green and the diff matches the stated scope.

## Safety and payment invariants

- Never commit private keys, wallet secrets, API credentials, or `.env` files.
- Tests and CI must not execute real payments.
- Building purchase capability is not authorization to spend.
- Any path that can authorize a purchase must remain separate from external content, model output, and ordinary application data.
- New paid execution paths require explicit owner authorization, bounded spend limits, and fail-closed behavior.
- Do not silently broaden wallet, network, credential, or data-provider permissions.

## Dependency changes

`package-lock.json` is committed and CI uses `npm ci`. Dependency changes must update both `package.json` and `package-lock.json` together. Dependabot may propose updates, but updates should be reviewed rather than auto-merged, especially for x402 protocol packages.

## Commit style

Prefer short, specific prefixes that make the history scannable:

- `feat:` new capability
- `fix:` bug correction
- `security:` security boundary or invariant
- `test:` verification only
- `docs:` documentation only
- `ci:` automation or verification pipeline
- `chore:` maintenance with no product behavior change

## Scope rule

A pull request should be easy to explain in one paragraph. If it contains unrelated product, infrastructure, security, and documentation changes, split it unless keeping them together is necessary to preserve a single invariant.
