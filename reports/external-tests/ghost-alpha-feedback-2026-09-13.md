# Ghost design-partner alpha: feedback and bounded correction

## Evidence and interpretation

The Ghost operator reported the result in [PR #55 comment 5652461055](https://github.com/RichardRacette/x402-lab/pull/55#issuecomment-5652461055)
and [issue #50 comment 5652489577](https://github.com/RichardRacette/x402-lab/issues/50#issuecomment-5652489577).
Both comments describe the same operator and alpha cycle; they are not independent
adoption evidence. The operator linked Ghost production-v1 revision
`09407944e8ac32e0a28d9a286b177d3b1cc3091e` as their current revision. That is not
the x402-lab evaluator revision or a preserved input/output packet.

| Observation | Provenance and meaning |
| --- | --- |
| Pre-deploy and fresh unpaid post-deploy runs returned REVIEW_REQUIRED with zero contradictions | Operator-reported use in two release stages; not an independent replay by x402-lab |
| Post-deploy term-drift detection was the strongest value | Concrete usefulness reported by one operator; no specific detected drift or changed release decision was supplied |
| Evidence-packet preparation was most of the manual work | Recurring friction reported; time savings and end-to-end self-service remain unestablished |
| Raw header versus excerpted body can falsely contradict | Reproduced locally with explicitly synthetic evidence; corrected below |

The comments do not supply the exact failing packet or both run outputs. The
regressions reproduce the reported class of defect, not Ghost's original bytes.
Unaided configuration, repeat adoption across release cycles, broader demand and
willingness to pay remain unestablished. Two runs by one operator do not meet the
documented independent-operator advancement threshold.

## Correction

At prior PR head `d1c44b4a1a44c53eba4c3c345ba468fbcb30b20e`, `header.body`
compared decoded JSON without checking declared coverage. Omission from an
excerpt could therefore become FAIL and gate exit 1.

Evaluator 0.1.1 requires matching header/body coverage for this JSON comparison.
Complete versus excerpt now stays UNKNOWN, even when supplied JSON matches.
With no independent FAIL, the gate returns REVIEW_REQUIRED / exit 3. Complete
mismatches, matching-coverage excerpt contradictions and independently supplied
advertised-term contradictions still block; drift and parsing rules are unchanged.
The schema and gate exit contract are unchanged. No packet schema or collection
feature was added.

Five new synthetic regressions failed before the fix; all 49 focused evaluator
and gate tests pass afterward. Coverage includes both directions of mixed
coverage, equal JSON, omitted fields, deterministic CLI output in both stages,
and an independent contradiction still taking precedence over UNKNOWN.
Typecheck and `git diff --check` pass.
The full suite passes 291/291 using Node 24.19.0 with `node --import tsx --test`
over the same TypeScript and script test files. The normal local `npm test`
launcher stops before tests because this workspace refuses the tsx CLI IPC pipe
(`listen EPERM`); no test code or permissions were changed to work around it.
GitHub CI separately runs the normal repository launcher on Node 22.

## Disposition and stopping point

Alpha feedback received; bounded correctness response complete. Retain PR #55 as
draft and unpromoted. Keep issue #50 open as the existing evidence thread; the
two-stage alpha invitation has been fulfilled and is not sent again. Evidence
preparation is recorded as learning, not an approved collector/product backlog.
No merge, further outreach, monitoring, live collection, receipt-verifier work,
package publication, hosting or paid experiment is initiated by this response.

Ghost remains **QUALIFY_UNPAID / PAYMENT_NOT_AUTHORIZED**. This response used
offline synthetic/retained fixtures only: no Ghost endpoint call, wallet, signing,
payment, settlement, fulfillment, credit redemption or live receipt-authenticity
test. No payment authorization is inferred from any gate result.
