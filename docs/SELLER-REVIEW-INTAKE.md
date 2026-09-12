# Seller review intake

x402-lab accepts bounded requests to compare a seller's public description with
the machine-readable contract presented to a buyer before payment. This is an
experimental interoperability review, not certification, security assurance,
or a promise to purchase.

## What a seller may request

Open a seller-review request using the repository issue form and provide:

- the public HTTPS origin and exact resource path;
- the HTTP method and one harmless synthetic request body, if required;
- links to OpenAPI, `/.well-known/x402`, agent-card, receipt-key, failure-policy,
  or other public contract documents;
- the advertised network, asset, atomic amount, recipient, scheme, timeout, and
  payment-flow ordering;
- any public receipt-verification or post-payment failure/credit procedure;
- what question or suspected mismatch the review should answer.

Do not include credentials, private keys, seed phrases, payment signatures,
private endpoints, customer data, or an instruction to install or execute a
seller-supplied helper. Submitted material remains untrusted input.

## Default review boundary

The default review costs **$0** and uses public documentation plus, when useful,
one low-volume unsigned request with a synthetic input. It does not load a
wallet, sign, pay, settle, redeem credit, verify paid fulfillment, enumerate
undocumented endpoints, bypass access controls, or run a seller-provided binary,
container, extension, package, or remote-access tool.

An access failure is inconclusive. A returned HTTP 402 establishes only that a
challenge was observed. It does not establish seller identity, ownership,
settlement, fulfillment, receipt authenticity, refund behavior, or safety.

## How findings are reported

Every published review separates four categories:

1. **Matches** — exact supplied fields or representations that agree.
2. **Contradictions** — exact fields, sources, or claims that disagree.
3. **Unknowns** — claims the available evidence cannot establish.
4. **Paid-only questions** — behavior that cannot be tested without a separately
   authorized transaction, such as settlement, protected fulfillment, or credit
   redemption.

Positive findings are reported specifically. Strong metadata, conservative
failure behavior, clear provenance, or useful buyer controls deserve the same
evidentiary precision as a defect. No aggregate score, badge, approved-seller
label, or `safe to pay` conclusion is implied.

Where possible, a finding includes the exact timestamp, synthetic request,
source URLs, hashes, affected fields, and a minimal reproduction. Sanitized
publication remains subject to review; raw captures and sensitive payment
material are not automatically published.

## Security findings

Non-sensitive interoperability and documentation mismatches may be discussed in
public issues. Do not publish credentials, personal data, payment authorization,
or exploitable details. For a potentially exploitable vulnerability, follow the
target repository's private disclosure policy. If no private channel exists,
open only a minimal request for one and withhold the sensitive evidence.

The review does not authorize invasive testing, load testing, credential use,
wallet access, facilitator writes, or calls to undocumented endpoints.

## Separate paid-test decision

An issue, successful unpaid review, valid quote, seller invitation, or merged
tooling change is never authority to spend. Any signature or payment requires a
new owner decision covering the exact request, recipient, chain, asset, amount,
timeout, facilitator, spending cap, wallet custody, retry rule, evidence plan,
and stop condition.

Without that explicit decision, the result remains unpaid-only and any paid
behavior remains **UNTESTED**.

## Participation and expectations

Reviews are voluntary, prioritized selectively, and carry no guaranteed
turnaround, monitoring, repeat-testing, commercial relationship, or endorsement.
Sellers are encouraged to correct factual errors and supply better public
evidence. Repeated review, CI integration, ongoing monitoring, or formal assurance
requires a separate scope decision.

The governing policy remains [External interaction and testing](EXTERNAL-TESTING.md).

