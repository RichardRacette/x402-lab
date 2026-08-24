# Product Discovery Round 3 — Domain Expert Evals

Status: **current product-discovery decision**

Date: **2026-08-24**

## Decision

The leading first-revenue experiment is now:

> **Recruiting Agent Practitioner Eval — human domain-expert evaluation of recruiting-agent runs, workflows, and traces.**

This supersedes the Search Preflight service as the primary commercial experiment.

Search Preflight remains useful as **one evaluation scenario family** because intake/search calibration is a real recruiting workflow. It is no longer the main thing being sold.

## Why the project moved again

A zero-based review asked the project to ignore sunk effort and rank the available revenue experiments against the actual goal: profitable external revenue and a path to defensible repeat use.

### Search Preflight weakness

Most production recruiting agents are sold to recruiters/hiring teams and deliberately preserve an internal human approval layer.

That creates a structural problem with selling an outside recruiter review on every requisition:

> the target customer may already have the exact human expert we are charging them to add.

Search Preflight may still be valuable to boutiques, founder-led hiring teams or autonomous systems without recruiting expertise, but it is not the strongest default wedge.

### Domain-expert eval strength

The AI-agent industry has a documented last-mile evaluation problem:

- engineers can inspect traces but often cannot judge domain correctness
- generic LLM-as-judge metrics need calibration against human expert labels
- expert review identifies failure modes and creates golden cases / regression tests
- mature eval workflows explicitly route nuanced/high-stakes cases to subject-matter experts

Commercial human-evaluation vendors already sell:

- one-off expert evaluation sprints
- adversarial/red-team sprints
- ongoing evaluation retainers
- domain-expert pods

Public current examples include specialist sprints around the hundreds of dollars and retained programs in the thousands per month.

This proves the *service class* has real commercial value.

## Why recruiting is a plausible vertical

Recruiting agents are proliferating rapidly.

Current 2026 products/examples include:

- Findem Calibration Agent and other autonomous talent-workflow agents
- Wrangle recruiting agent
- HireAgent
- 100Networks agents
- AgentLink
- Pin
- SAP/SmartRecruiters public recruiting-agent example
- LangChain Academy recruiting-agent + LangSmith eval harness example
- many public hobby/startup recruiting-agent builds

These systems perform or assist with:

- intake/calibration
- sourcing
- candidate summaries
- ranking/screening support
- outreach
- scheduling
- pipeline updates
- market/comp context

The workflows look simple in demos but contain large amounts of tacit recruiter judgment.

## Existing competition

### ProofMap

ProofMap currently markets an **AI Recruiting Agent Evaluation** use case and provides a self-service evaluation platform with deterministic/evaluator-assisted tests, objectives, guardrails and runtime comparison.

This is important validation, not automatic disqualification.

ProofMap is primarily **evaluation infrastructure**.

Our proposed first service is:

> **bring the recruiter/domain judgment** — define realistic cases, label nuanced failures, provide corrected behavior and turn practitioner feedback into a reusable eval set.

A future buyer could use our output *inside* ProofMap, LangSmith, Label Studio, DeepEval, an internal harness, or no formal eval platform at all.

### Generic expert-eval providers

Prolific, OpenTrain, nxted, OSCABE, Shaip and others provide human/domain-expert evaluation at scale.

Their public positioning strongly emphasizes medicine, law, finance, STEM, coding and languages.

We did not identify a clearly packaged **recruiting-practitioner eval sprint for recruiting agents** during this research pass.

That is a niche gap, not proof of demand.

## Working product: Recruiting Agent Practitioner Eval

### Buyer

Primary:

- founder / engineer building a recruiting agent
- HR-tech startup shipping an agentic recruiting workflow
- recruiting-software product team adding AI/agent behavior

Secondary:

- recruiting team building an internal agent
- AI eval platform that needs a recruiting-domain reviewer

### One-sentence proposition

> **Send sanitized recruiting-agent test runs or traces. A practicing recruiter labels what works, what fails in real recruiting, why it fails, what the agent should have done, and which cases should become regression tests.**

### What is being purchased

Not legal certification.

Not a statutory bias audit.

Not a claim that the agent is safe for every employment use.

The buyer purchases **practitioner workflow-quality evaluation**.

## V0 input

Accept one of:

1. 5–25 sanitized agent runs containing input + output
2. a public demo/repo plus explicit test scenarios we can run without credentials
3. structured traces supplied by the builder with secrets/PII removed

Required metadata:

- workflow type
- intended user
- intended agent behavior
- autonomy level: `advisory | propose_action | execute_with_approval | autonomous`
- known constraints / expected outcome

Do not accept real candidate PII during V0.

Do not ask for employer secrets, API keys or private production data.

## V0 evaluation dimensions

The human reviewer should judge observable recruiting-workflow quality such as:

1. **task understanding** — did the agent understand the recruiting job?
2. **criteria fidelity** — did it preserve the stated must-haves / priorities rather than drift?
3. **evidence grounding** — are claims supported by supplied/source evidence?
4. **clarification judgment** — did it ask when the brief was materially ambiguous?
5. **recruiter usability** — is the output actionable to a recruiter/hiring partner?
6. **autonomy boundary** — did it escalate or seek approval when the configured workflow required it?
7. **traceability** — can a reviewer understand why the agent did what it did?
8. **fabrication discipline** — did it invent candidate/company facts, outreach hooks or market claims?
9. **workflow completeness** — did it omit a step that makes the output unusable?
10. **consistency** — does similar input produce materially coherent treatment?

Avoid evaluating protected-class outcomes or offering legal compliance conclusions without qualified legal/bias-audit scope.

## Initial failure taxonomy

Suggested V0 labels:

- `REQUIREMENT_DRIFT`
- `MISSING_CLARIFICATION`
- `UNSUPPORTED_INFERENCE`
- `EVIDENCE_GAP`
- `OVERCONFIDENT_CLAIM`
- `SEARCH_PLAN_MISMATCH`
- `MUST_HAVE_INCONSISTENCY`
- `OUTREACH_FABRICATION`
- `AUTONOMY_BOUNDARY_MISS`
- `HUMAN_REVIEW_NEEDED`
- `AUDITABILITY_GAP`
- `RECRUITER_USABILITY_GAP`
- `INCOMPLETE_WORKFLOW`
- `OTHER_DOMAIN_FAILURE`

This taxonomy must evolve from real reviews.

## Per-run verdict

Prefer small categorical judgments over fake precision:

- `PASS`
- `PARTIAL`
- `FAIL`
- `ESCALATE`

Every non-pass needs:

- failure label(s)
- short recruiter rationale
- expected/corrected behavior
- severity: `low | material | blocking`

No generic 0–100 quality score in V0.

## Deliverable

A V0 sprint should produce:

1. evaluation rubric used
2. run-by-run verdict table
3. prioritized failure patterns
4. corrected/golden behavior examples
5. 5–10 recommended regression cases
6. release/readiness observations **without certification language**
7. limitations
8. machine-readable JSON + concise Markdown report

A useful report should be immediately actionable by a product/engineering team.

## Pricing hypothesis

Do not underprice domain-expert work as a micropayment.

Suggested learning ladder:

### Free mini sample

`3–5 runs` for one or two carefully selected builders to prove the format and obtain product feedback.

### Practitioner Smoke Eval

`10 runs` — test roughly **$99–$149**.

### Practitioner Eval Sprint

`20–25 runs + failure taxonomy + golden cases` — test roughly **$249**.

### Larger / recurring

Quote after evidence. Potentially `$500+` or monthly cadence if a team wants release-by-release review.

Current specialist human-eval providers validate that domain-expert evaluation can support pricing in this general range and much higher at scale.

## Unit economics target

Use internal owner-time value >= `$50/hour`.

Target for a `$249` 20–25-run sprint after tooling:

- human review + report <= ~2 hours
- no paid data dependency
- minimal model/tool variable cost
- high gross contribution after actual marketplace/payment fees

If a 20-run review takes 5+ hours, either raise price, reduce scope or improve the review workbench before scaling.

## Repeat trigger

This service has a natural repeat event:

> every meaningful agent release, prompt/tool change, autonomy expansion, or new recruiting workflow needs regression evaluation.

A second evaluation from the same builder is a strong signal.

## Distribution

### Direct builder outreach

Highest-value first test.

Current public/open recruiting-agent projects and small vendors provide a concrete target set for respectful outreach offering a small free practitioner review.

Do not spam.

### the402

Once fulfillment quality is proven, list the sprint as a human service purchasable by agents through x402 escrow.

Potential listing:

`Recruiting Agent Practitioner Eval — Human Domain Review`

Agent submits sanitized runs/traces and receives JSON + Markdown asynchronously.

Current the402 public pricing states the provider receives their listed price and the buyer pays an additional 5% platform fee, but actual provider terms should be verified at onboarding.

### General AI-eval marketplaces

OpenTrain/other expert networks could validate demand for recruiting-domain evaluation, but this is secondary to testing our own product.

## Strategic fit with x402-lab

This direction preserves the original machine-economy thesis in a stronger way:

1. agents/builders can buy expert evaluation
2. human labels accumulate
3. repeated labels form a domain benchmark
4. benchmark cases become a reusable digital asset
5. deterministic / model-based evaluators are calibrated against human judgment
6. proven automated evaluation components can become x402-paid tools

The long-term machine product is therefore **earned from expert labels**, not guessed upfront.

## Moat ladder

### V0

Human recruiting judgment.

Weak but real.

### V1

Recruiting-agent failure taxonomy + curated regression scenarios.

### V2

Human-labeled benchmark corpus across recruiting workflows.

### V3

Automated evaluator calibrated against human labels, with measured agreement.

### V4

Workflow-specific eval APIs / MCP tools / x402 paid evaluation.

### V5

Continuous recruiting-agent QA / release gate with practitioner escalation.

This is a substantially more defensible flywheel than wrapping public labor-market data.

## Safety / scope boundaries

V0 must avoid becoming an unqualified compliance or employment-law service.

- no legal certification
- no NYC LL144 bias audit claim
- no claim that an agent is legally compliant
- no real adverse-employment decisions
- no candidate PII required
- no protected-class scoring
- no employer-confidential dataset required

The output is practitioner product-quality feedback.

## Outside-work / IP gate

Before accepting real paid work, the project owner must verify any applicable employment/contract terms covering:

- outside business / moonlighting
- conflicts of interest
- invention/IP assignment
- use of employer equipment/time
- confidentiality
- competitive activity

Use only personal equipment/accounts/time and public or customer-authorized materials.

Do not use current or former employer proprietary recruiting processes, candidate records, internal data or confidential documents.

This gate is mandatory before first commercial customer.

## Validation gates

### Gate A — artifact quality

Create a 10–20-case recruiting-agent eval pack and manually verify that the rubric/failure labels capture meaningful practitioner judgment.

### Gate B — builder response

Show a mini review to at least three recruiting-agent builders/product people.

Positive evidence:

- they disagree/engage with specific labels rather than merely compliment format
- they ask for more runs
- they add one of the cases to their own eval/regression process
- they ask how to repeat the review after changes

### Gate C — willingness to pay

At least one external buyer pays a stated price for an eval sprint.

### Gate D — repeat

Same buyer purchases another sprint/release review.

### Gate E — productization

Only automate evaluation dimensions after human labels show stable criteria and enough agreement to justify it.

## Current recommendation

Tonight should build a **Recruiting Agent Eval Workbench / benchmark harness**, not Search Preflight and not a paid endpoint.

The workbench should make human review fast, structured, reusable, and machine-readable.
