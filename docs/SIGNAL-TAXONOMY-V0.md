# Recruiting Pressure Signal Taxonomy V0

Status: **candidate rules for external validation**

Date: **2026-08-24**

This document defines the first explainable signals for `RECRUITING-PRESSURE-BRIEF-V0.md`.

The rules are intentionally small, deterministic, and auditable. They should be changed only when recruiter feedback or measured outcomes justify a change.

## Design rules

1. **Observable facts before inference.**
2. **No numeric magic score in V0.**
3. **Every signal must point to concrete job/source evidence.**
4. **Do not confuse hiring activity with proof of agency demand.**
5. **Do not infer age from a field that does not mean first-published date.**
6. **Do not infer reposting until our own history proves a close/reappearance sequence.**
7. **Agency focus matters.** A cluster is more useful when it matches the buyer's specialty.

## Normalization primitives

V0 needs only conservative normalization.

### Text normalization

For comparison keys:

- lowercase
- Unicode normalize
- collapse whitespace
- replace punctuation separators with spaces
- preserve meaningful tokens such as `c++`, `c#`, `3d`, `ev`, `ml`, `ai`
- do not stem aggressively

### Title key

Create a normalized title key for history matching.

Remove only a small set of obvious presentation noise where safe, such as:

- leading `new`
- job requisition numbers in clearly delimited suffixes
- duplicated whitespace

Do **not** erase seniority, discipline, shift, product, or specialty terms.

### Location key

Normalize whitespace/case and preserve city/state/country text. V0 does not need geocoding.

### Focus match

A job is a focus match when at least one normalized agency-focus keyword appears in:

1. title, or
2. Greenhouse department name, if present.

V0 should not perform fuzzy semantic matching with an LLM.

If `agencyFocus.locations` is supplied, a job must also match at least one supplied location substring to count as a focus match.

This conservative behavior trades recall for explainability.

## Signal 1 — `AGING_FOCUS_ROLES`

### Question

Are roles aligned to the agency's specialty staying publicly open long enough to deserve attention?

### Source requirement

A trustworthy `first_published` timestamp from the source.

For Greenhouse V0, retrieve individual job records when needed because the official job-detail response exposes `first_published`.

### Supporting threshold

At least **2 focus-matched active roles** first published **35+ days** before observation time.

### Strong threshold

Either:

- at least **2 focus-matched active roles** first published **65+ days** before observation time, or
- at least **4 focus-matched active roles** first published **35+ days** before observation time.

### Evidence payload

Return:

- count at 35+ days
- count at 65+ days
- each supporting role ID, title, location, first-published date, age in whole days, source URL

### Caveat

A role being old is not proof it is hard to fill. It is a pressure clue.

## Signal 2 — `SPECIALTY_CLUSTER`

### Question

Is the company hiring multiple people in the buyer's specialty at the same time?

### Supporting threshold

At least **3 active focus-matched roles**.

### Strong threshold

At least **6 active focus-matched roles**.

### Evidence payload

Return:

- focus role count
- total active role count
- matched keywords
- supporting role IDs/titles/locations

### Caveat

A cluster can represent healthy planned growth rather than recruiting difficulty. Pairing with age or repost evidence is more meaningful.

## Signal 3 — `TA_CAPACITY_PRESSURE_CLUE`

### Question

Is the company visibly hiring recruiting/TA capacity while carrying a meaningful hiring load?

### Recruiting/TA title tokens

Use a small deterministic matcher over job titles. Candidate terms:

- recruiter
- recruiting
- talent acquisition
- talent partner
- sourcer
- sourcing recruiter

Do not match generic `talent` alone because it creates false positives.

### Supporting threshold

At least **1 active recruiting/TA role** AND either:

- at least **10 total active jobs**, or
- at least **3 focus-matched active jobs**.

### Strong threshold

V0 should **not** classify this signal as strong by itself.

It remains supporting evidence until recruiter validation shows a stronger relationship.

### Evidence payload

Return:

- recruiting/TA role IDs and titles
- total active job count
- focus job count

### Caveat

Hiring a recruiter may reflect growth, replacement, specialization, or internal strategy. Do not claim internal TA is understaffed.

## Signal 4 — `REOPENED_OR_REPEATED_ROLE`

### Question

Did a materially similar role disappear and later reappear in our own observations?

### Availability

**Unavailable on first observation.**

This signal must remain disabled until x402-lab has sufficient snapshots.

### Match key

Conservatively match:

- normalized title key
- normalized location key
- same company/source

A future occupation-normalization layer can improve matching only after V0 validation.

### Supporting threshold

One confirmed close → reappearance event within the prior 120 days.

### Strong threshold

Either:

- the same normalized title/location reappears at least twice after closure events, or
- at least 2 distinct focus roles show a close → reappearance event.

### Evidence payload

Return observation timestamps proving:

- prior active state
- first absent/closed observation
- later active reappearance

### Caveat

A repost can reflect administrative changes, evergreen hiring, headcount duplication, or normal recruiting practice. It is evidence of recurring demand, not proof of failed recruiting.

## Deferred signals

Do not implement these in the first Codex slice:

### `HIRING_ACCELERATION`

Needs enough stable history to compare windows responsibly.

### `NEW_GEOGRAPHY`

Needs historical observations and careful location normalization.

### `FIRST_OBSERVED_FUNCTION`

Needs a longer baseline and occupation/function taxonomy.

### `ROLE_DIFFICULTY`

Potentially valuable, but requires calibrated labor-market data, O*NET/BLS inputs, or validated recruiter rules. Do not label roles "hard to fill" from intuition alone.

### `INTERNAL_TA_RATIO`

Potentially differentiated but requires trustworthy workforce/TA headcount data that V0 does not possess.

### funding / leadership-change / tech-stack signals

Crowded GTM signal territory and additional data dependencies. Defer until hiring-footprint evidence proves useful.

## Classification logic

Signals return one of:

- `strong`
- `supporting`

The overall brief returns:

### `high`

- 2+ strong signals; or
- 1 strong signal + 2+ supporting signals

### `moderate`

- 1 strong signal; or
- 2+ supporting signals

### `low`

The source is sufficiently complete for V0, but the conditions above are not met.

### `insufficient-data`

Examples:

- source unavailable
- no active jobs
- no focus matches when focus is required
- board exceeds hard processing bounds
- first-published detail cannot be obtained for enough focus roles to assess the requested age signal

## Confidence label

Confidence is about **coverage and evidence quality**, not certainty that an agency sale will happen.

### `high`

- source retrieved successfully
- all active/focus records required by the triggered signals were processed
- timestamps used by age signals are explicit source first-published values
- any history signal is supported by complete local observations

### `moderate`

- source is usable but some optional data is absent
- the classification does not depend on missing fields

### `low`

Do not return a pressure classification with low confidence. Prefer `insufficient-data`.

## Validation questions for recruiters

For each sample brief ask:

1. Would this change whether you prospect the company today?
2. Which signal is actually useful?
3. Which signal feels obvious/noisy?
4. What fact would make the packet worth paying for?
5. Would you want another company analyzed right now?
6. Would you want alerts when one of these signals changes?

The taxonomy should evolve from those answers, not from adding sophistication for its own sake.
