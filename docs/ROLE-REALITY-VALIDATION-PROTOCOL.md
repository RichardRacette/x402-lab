# Role Reality Check — External Validation Protocol

Status: **required before Product #2 promotion**

Date: **2026-08-24**

## Purpose

Test whether Role Reality Check changes a real recruiter's decision or workflow.

The objective is **not** to collect compliments.

The objective is to discover whether the packet is worth paying for and what, if anything, creates the value.

## Who to test with

Prefer people who currently make decisions about whether/how to work a requisition:

- agency recruiters
- agency account managers / owners
- internal recruiters handling intake
- recruiting operations leaders

Avoid relying only on AI enthusiasts or friends who are evaluating the technology rather than the recruiting decision.

## Minimum validation set

Before Product #2 is treated as commercially promising:

- show real packets to at least **5 external recruiters**
- include at least **2 people who do agency/contingent/direct-hire work** if possible
- use multiple role families, not five engineering roles
- do not explain the intended conclusion before they inspect the packet

This is a learning threshold, not statistical proof.

## Test procedure

### 1. Start with the req, not the product pitch

Give the tester the role inputs first:

- title
- location
- compensation
- constraints

Ask:

> If this landed on your desk today, what would you want to know before you start sourcing?

Capture their answer before showing Role Reality.

### 2. Show the packet without selling it

Do not say:

- "this is our new AI product"
- "this should save you time"
- "we think this predicts fillability"

Say only:

> Here is a market packet generated from those inputs. Walk me through what you notice and what you would actually use.

### 3. Ask behavior questions

Preferred questions:

1. What, if anything, would you do differently after seeing this?
2. Would any of this change the intake conversation with the hiring manager/client?
3. Which field or flag is most useful?
4. Which part is obvious, misleading, or unnecessary?
5. What would you still have to research yourself before starting?
6. Is anything important missing that blocks a decision?
7. How would you get this information today without this packet?
8. Roughly how much time does that take you today?
9. Give me another real role where this would be useful—or tell me why you would not.

### 4. Test price with an actual choice

Avoid a vague "Would you pay for this?"

Use a forced tradeoff such as:

> Assume this exact packet were available instantly for $0.50 each with no subscription. For your next ten new reqs, would you buy zero, some, or all ten? Which ones and why?

Then test a higher human-facing price if value is clear:

> If the packet were $2 or $5, what would have to be true for you to still buy it?

Do not optimize price from one interview.

### 5. Test API/agent fit

Ask workflow questions only after value is established:

- Would you want this automatically during intake?
- Would you want your recruiting agent/CRM/ATS to call it?
- Would you rather receive a report, JSON/API response, or both?
- Would you want a second call after the client changes compensation/location/requirements?

The strongest machine-commerce use case is a workflow that naturally triggers another purchase after a req changes.

## Evidence to record per tester

Record a compact structured note:

```text
role tested
recruiter type
current workflow
current time spent on market calibration
packet changed decision? yes/no/unclear
changed intake question? yes/no
requested another role? yes/no
would buy at $0.50? zero/some/all
would buy at $2? zero/some/all
would buy at $5? zero/some/all
most useful field
missing field
misleading/noisy field
preferred integration
verbatim behavior-changing statement (short)
```

Do not collect confidential client/candidate data in the repo.

## Strong positive signals

Rank evidence roughly in this order:

1. tester gives us another real role without prompting
2. tester says the packet changes what they will ask/do on a live req
3. tester asks to receive future packets automatically
4. tester asks how to connect it to their workflow/API
5. tester offers or agrees to pay for additional packets
6. tester can name a concrete manual research step the packet replaces
7. tester says it is useful

Compliments alone are weak evidence.

## Negative signals

Treat these seriously:

- "I already know this from a two-minute salary search"
- no change to intake/search behavior
- every tester asks for proprietary candidate-pool counts rather than the provided market facts
- occupation mappings frequently feel wrong
- compensation is the only useful section
- data is too stale/coarse for the roles recruiters actually work
- nobody supplies a second role
- users only want a polished PDF rather than repeated decision support

## Continue threshold

Role Reality earns further investment when, from the first 5 external recruiter tests:

- at least **3/5** say the packet changes an intake/search action **or** removes a meaningful manual research step; and
- at least **2/5** voluntarily request another role or want the packet embedded in a recurring workflow; and
- no systemic data-quality issue invalidates the core market facts.

These thresholds are deliberately demanding but can be revisited with evidence.

## Paid-test threshold

A public paid Product #2 should not be promoted merely because the code works.

Prefer at least one of:

- an external recruiter explicitly agrees to buy another packet at a stated price,
- a developer/recruiting-tool builder asks to integrate it,
- a payment-capable external agent has a real workflow where the packet substitutes for manual/upstream work.

Then test Base Sepolia first.

## Kill/pivot threshold

Pause Role Reality rather than expanding it if:

- fewer than 2 of the first 5 testers change any decision/workflow,
- the product is consistently described as information they already get trivially,
- open-data limitations make the most valuable roles unreliable,
- the missing information would require a premium data cost that destroys the intended economics before demand is proven.

Do not respond to failure by adding an LLM.

## What to learn if it fails

A failed validation should still answer:

- Was the decision point wrong?
- Was the data too weak?
- Was the packet too broad?
- Was compensation the only valuable primitive?
- Did recruiters want candidate-supply evidence instead?
- Was the best value actually a client-facing calibration artifact?
- Did a different repeated workflow reveal itself?

Capture that before choosing Product #3.
