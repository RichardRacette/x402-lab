# Desktop Handoff — 2026-08-24 Evening

Status: **start here when returning to the development desktop**

## 1. Pull latest `main`

Open the local `x402-lab` clone and pull today's latest strategy/docs commits.

Do not begin from an older branch or prompt that treats Recruiting Pressure or automated Role Reality as active products.

Active workstream: **Issue #14 — Milestone 4.5C: Search Preflight Workbench + first revenue**.

Issues #12 and #13 are invalidated/closed.

## 2. Read these three docs first

In this order:

1. `docs/FULL-PROJECT-AUDIT-2026-08-24.md`
2. `docs/BUSINESS-PLAN-V0.3.md`
3. `docs/CODEX-SESSION-PLAN-2026-08-24.md`

Then read `docs/ROADMAP.md` if more context is needed.

Older Role Reality / Recruiting Pressure docs are historical only.

## 3. CareerOneStop email is optional

CareerOneStop registration has been submitted.

If credentials arrive, put them only in local gitignored `.env`:

```text
CAREERONESTOP_USER_ID=...
CAREERONESTOP_API_TOKEN=...
```

Do not paste them into Codex prompts, GitHub issues, commits, screenshots or chat.

CareerOneStop is **not required tonight** and is not an approved foundation for transformed commercial scoring pending rights clarification.

Prefer fixtures/O*NET/BLS for the workbench where practical.

## 4. Preserve existing secrets and products

Do not expose:

- wallet private keys
- seed phrases
- provider tokens
- any future customer confidential data

Do not change the live Evidence Slice contract merely because a new internal workbench is being added.

## 5. Give Codex exactly one job

Use the exact prompt at the bottom of:

`docs/CODEX-SESSION-PLAN-2026-08-24.md`

Codex creates branch:

`milestone-4-5-search-preflight-workbench`

The task is an **internal fulfillment tool**, not payment/deployment.

## 6. Expected checkpoints

### A — domain model + fixtures

Structured req/search-plan types compile. Tests use deterministic market facts.

### B — draft generator

Workbench generates JSON + Markdown with sources/limitations and explicit human-review section.

### C — safety/honesty

No fake supply counts, no guaranteed fillability, no missing-data coercion, no unsupported market claims.

### D — sample set

Generate sanitized drafts for:

- Controls Engineer — Detroit, MI
- Maintenance Technician — Dallas, TX
- Supply Chain Manager — Columbus, OH
- Registered Nurse — Ann Arbor, MI
- Software Engineer — San Francisco, CA

### E — human finish-time test

Time how long it takes to make each draft genuinely usable.

## 7. The key decision tonight

Ask:

> **Does this workbench make a knowledgeable recruiter meaningfully faster and more consistent?**

Pass only if:

- draft is roughly >=70% useful
- source/geography/vintage are trustworthy
- reviewer-specific observations/questions add value beyond salary lookup
- finished review is plausible in <=25–30 minutes

If **no**:

- stop
- document why
- do not add an LLM, premium data, candidate scraping or UI to rescue it

If **yes**:

- finish sample briefs
- prepare for external recruiter validation
- still do **not** add a new paid x402 endpoint tonight

## 8. Do not touch tonight

Do not spend Codex time on:

- public Role Reality endpoint
- Recruiting Pressure
- Evidence Slice upgrades
- Talent Bench / HobbyOS
- rebrand
- mainnet
- MCP/MPP
- candidate sourcing/ranking
- LinkedIn scraping
- contact enrichment
- frontend/dashboard
- production database
- premium talent-data subscriptions

## 9. End-of-session record

Update **Issue #14** with:

- branch + commit
- test/typecheck result
- sample drafts generated
- data-source mode used
- average draft generation time
- human finish time for each reviewed sample
- useful recurring observations
- weak/misleading sections
- pass/fail against the 25–30 minute gate
- exact next external-validation step

## 10. Success definition

A good night does **not** end with another public endpoint.

It ends with one of:

1. a workbench good enough to support a real paid Search Preflight experiment, or
2. a cheap, documented rejection before more product engineering.

Both reduce uncertainty and protect the path to revenue.
