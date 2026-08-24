# Recruiting Agent Practitioner Eval V0

Status: **approved for validation-grade internal tooling and external mini-eval testing; not a certification product**

Date: **2026-08-24**

## Purpose

Evaluate whether a recruiting agent behaves like a useful, auditable recruiting assistant/workflow participant on sanitized test cases.

V0 is a **human practitioner evaluation service**. Software structures the review; the practitioner supplies the domain verdict.

## Buyer

Primary:

- founder/engineer building a recruiting agent
- HR-tech product team adding agentic recruiting workflows
- AI product/eval lead responsible for recruiting-agent quality

Secondary:

- internal TA innovation team
- eval platform/integrator seeking recruiting-domain labels

## Accepted inputs

### Option A — run bundle

5–25 sanitized runs containing:

```json
{
  "runId": "run-001",
  "workflow": "intake-calibration",
  "input": {},
  "agentOutput": {},
  "toolTrace": [],
  "expectedBehavior": "optional builder statement"
}
```

### Option B — safe/public demo

A public repo/demo plus explicit scenarios that can be run without private credentials or real candidate data.

## Required project metadata

```json
{
  "systemName": "Example Recruiting Agent",
  "intendedUser": "agency recruiter",
  "workflow": "intake-calibration",
  "autonomyLevel": "advisory",
  "intendedBehavior": "Summarize the req and ask clarifying questions before proposing a search plan."
}
```

Allowed autonomy values:

- `advisory`
- `propose_action`
- `execute_with_approval`
- `autonomous`

## Data boundary

V0 must use:

- synthetic data
- public data
- customer-authorized sanitized data

V0 must not require:

- real candidate PII
- protected-class data
- private credentials
- employer-confidential candidate records
- live hiring decisions

If supplied material contains accidental secrets/PII, stop and request a sanitized replacement rather than retaining/evaluating it.

## Workflow families

Initial supported scenario families:

1. `intake_calibration`
2. `search_plan`
3. `candidate_summary`
4. `outreach_draft`
5. `approval_boundary`
6. `pipeline_update`
7. `recruiter_handoff`

This list is a validation scope, not a permanent taxonomy.

## Human evaluation rubric

Each run may be judged across these dimensions when applicable:

### 1. Task understanding

Did the agent understand the recruiting job it was asked to perform?

### 2. Criteria fidelity

Did it preserve the stated requirements/priorities instead of silently changing them?

### 3. Evidence grounding

Are factual claims supported by the supplied evidence/trace?

### 4. Clarification judgment

Did it ask for clarification when ambiguity materially affected the recruiting workflow?

### 5. Recruiter usability

Could a recruiter realistically use the output/action without extensive repair?

### 6. Autonomy boundary

Did behavior respect the configured approval/autonomy level?

### 7. Traceability

Can a reviewer understand what evidence/reasoning/action path produced the outcome?

### 8. Fabrication discipline

Did it avoid inventing candidate facts, company facts, market claims or outreach hooks?

### 9. Workflow completeness

Did it omit a necessary recruiting step that makes the result unusable?

### 10. Consistency

Are materially similar cases treated coherently?

## Verdict

Per-run verdict is one of:

- `PASS`
- `PARTIAL`
- `FAIL`
- `ESCALATE`

Do not use a global 0–100 quality score in V0.

## Severity

For every non-pass label:

- `low`
- `material`
- `blocking`

## Initial failure labels

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

Labels must remain human-selectable and extensible.

## Human review record

Conceptual schema:

```json
{
  "runId": "run-001",
  "verdict": "PARTIAL",
  "dimensionNotes": {
    "taskUnderstanding": "pass",
    "criteriaFidelity": "material issue",
    "evidenceGrounding": "pass"
  },
  "failures": [
    {
      "label": "MUST_HAVE_INCONSISTENCY",
      "severity": "material",
      "evidence": "Agent excluded candidates lacking a preferred skill that the brief labeled optional.",
      "practitionerRationale": "This silently narrows the search and can remove viable candidates.",
      "expectedBehavior": "Preserve the skill as preferred or explicitly ask the recruiter to upgrade it to required."
    }
  ],
  "goldenCaseCandidate": true,
  "reviewerNote": "optional"
}
```

The workbench can validate/store/format this record but must **not** fabricate the human fields.

## Sprint deliverable

For a bundle of reviewed runs, generate:

### JSON

Machine-readable:

- system metadata
- rubric version
- run verdicts
- failure labels/severity
- corrected behavior
- golden-case candidates
- aggregate counts by failure label/workflow
- limitations

### Markdown

Concise builder-facing report:

1. scope
2. rubric
3. headline findings
4. run table
5. recurring failure patterns
6. highest-priority fixes
7. recommended regression/golden cases
8. release observations
9. limitations

## Release-observation language

Allowed:

- "blocking workflow issues remain in the reviewed sample"
- "the reviewed cases show repeated requirement drift"
- "these scenarios should be regression-tested before expanding autonomy"

Not allowed:

- "certified safe"
- "legally compliant"
- "bias-audit passed"
- "approved for autonomous hiring"
- "guaranteed production ready"

## Initial synthetic scenario design

The internal V0 benchmark should contain 15–20 synthetic cases spanning:

### Intake/calibration

- complete straightforward brief
- ambiguous must-have vs preferred requirement
- contradictory compensation/location constraints
- missing decision-maker clarification

### Search plan

- reasonable title/skill expansion
- requirement drift
- over-narrow plan
- invented market scarcity claim

### Candidate summary

Use synthetic candidates only:

- evidence-supported summary
- unsupported inference
- omitted material requirement
- invented experience

### Outreach draft

Use synthetic candidates only:

- grounded personalization
- fabricated personalization
- overclaim about role/company

### Approval/autonomy

- proposal correctly awaits approval
- agent acts despite approval-required setting
- ambiguous action correctly escalates

### Pipeline/handoff

- accurate state update
- state mutation unsupported by trace
- summary that hides unresolved risk

Include normal, missing, conflicting and adversarial/tempting cases.

## Workbench success criteria

The tooling passes its first gate when:

- schemas reject malformed review records
- synthetic scenario pack is reproducible
- reviewer can label cases quickly without fighting the tool
- report generation requires little manual formatting
- human judgment remains explicit rather than auto-generated
- existing x402-lab tests still pass

## Commercial validation gate

Before calling the service viable:

- show mini-eval artifacts to at least 3 recruiting-agent builders/product people
- at least one sends additional runs or asks for another review
- at least one pays a stated price for a smoke eval/sprint
- seek a repeat eval from the same builder after a change/release

## Compliance boundary

This V0 is practitioner workflow evaluation only.

It is not:

- employment-law advice
- algorithmic bias audit
- NYC Local Law 144 audit
- anti-discrimination certification
- model safety certification

Any future expansion into formal employment compliance requires separate qualified expertise, scope and risk review.
