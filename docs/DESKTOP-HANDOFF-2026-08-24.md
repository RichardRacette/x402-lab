# Desktop Handoff — 2026-08-24 Evening

Status: **start here when returning to the development desktop**

## 1. Pull the latest project state

Open the local `x402-lab` clone and make sure `main` contains today's strategy/docs commits.

Do not begin from an older local branch that still treats Recruiting Pressure as the active product.

The active product-validation issue is **#13**.

The company-level Recruiting Pressure plan is invalidated and its old Codex brief is marked HOLD.

## 2. Read only these four decision docs first

In this order:

1. `docs/PRODUCT-DISCOVERY-ROUND-2-2026-08-24.md`
2. `docs/ROLE-REALITY-CHECK-V0.md`
3. `docs/CODEX-SESSION-PLAN-2026-08-24.md`
4. `docs/ROLE-REALITY-VALIDATION-PROTOCOL.md`

The rest are supporting references.

## 3. Check CareerOneStop developer access

Role Reality V0 uses CareerOneStop/USDOL data.

The provider requires:

```text
CAREERONESTOP_USER_ID
CAREERONESTOP_API_TOKEN
```

If credentials are already available, place them only in the local gitignored `.env`.

If not, request CareerOneStop Web API data access through the official CareerOneStop developer Web API page.

**Do not delay the Codex session if access is pending.**

The session plan explicitly supports fixture mode and an optional provider adapter.

## 4. Confirm existing x402 secrets remain separate

Existing seller/buyer secrets stay where they already belong.

Never paste into prompts, issues, commits or validation samples:

- private keys
- seed phrases
- API tokens
- wallet secrets

CareerOneStop credentials are provider-side credentials and receive the same treatment.

## 5. Give Codex one job

Use the exact prompt at the bottom of:

`docs/CODEX-SESSION-PLAN-2026-08-24.md`

Codex must create:

`milestone-4-5-role-reality-validation`

The first work is domain logic + tests, **not** payment or deployment.

## 6. Expected checkpoints

### Checkpoint A

Pure types/rules compile and synthetic tests pass.

### Checkpoint B

CareerOneStop adapter is bounded and optional; existing Evidence Slice still works when CareerOneStop is unconfigured.

### Checkpoint C

At least one sample packet can be inspected in fixture mode.

### Checkpoint D

If credentials work, generate real packets for multiple role families.

### Checkpoint E

Manually inspect the packets before allowing Codex to add a paid route.

## 7. The key human decision tonight

Ask:

> **Is this materially more useful than a salary lookup plus ordinary web/AI research?**

If **no**:

- stop
- preserve tests/research if useful
- document what is missing
- do not add an LLM or premium data tonight

If **yes**:

- continue through the payment-gated phase in the session plan
- expose `$0.50` only on Base Sepolia
- keep mainnet out of scope

## 8. What not to touch

Do not spend the session on:

- Talent Bench
- HobbyOS
- a new brand/name
- MPP
- MCP
- mainnet
- website/UI polish
- Evidence Slice upgrades
- company hiring-pressure signals
- LinkedIn scraping
- candidate/person data
- databases

The night's scarce resource is the quality of one product test.

## 9. End-of-session record

Before stopping for the night, update Issue #13 with:

- branch/commit
- tests/typecheck status
- provider status: fixture-only or live
- sample roles generated
- what looked genuinely useful
- what looked weak/misleading
- whether the paid-route gate was passed
- exact next step

Do not mark Product #2 selected merely because implementation completed.

## 10. Success definition

A successful evening ends with **less uncertainty**.

That can mean:

- Role Reality clearly earns a paid testnet experiment, or
- real data exposes that the product is too weak and we reject it before wasting more engineering time.

Both are better than shipping another endpoint because Codex made it easy.
