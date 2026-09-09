# Independent buyer review — first bounded sprint

Reviewer role: buyer/adversarial reviewer. Scope: public sources, governing doctrine/thesis, substitute choice, task criteria. Prototype implementation is deliberately not inspected. This is an internal simulated buyer, not an external customer or revealed willingness to pay. Spend: $0; no signups, payments, outreach, or messages to customers.

## Current judgment

None of the three ideas has yet demonstrated a reason for an independent buyer to pay x402-lab. Email-domain intake triage is the easiest bounded falsification experiment, but also faces a strong free substitute. Credentialless Apify access faces a direct first-party substitute. Public agent-readiness checks need a narrowly defined downstream task before a benchmark is meaningful.

The governing thesis explicitly treats a clean API and x402 support as distribution advantages rather than sufficient differentiation. Passing a self-generated test can establish limited technical utility; it cannot establish external demand, repeat purchasing, or willingness to pay.

## Strongest realistic substitutes

### Email-domain intake triage

For an existing CRM buyer, first inspect built-in validation and blocking settings. HubSpot, for example, supports configured email-domain blocks and a free-provider block setting on eligible subscriptions. That is an existing-subscription substitute for some intake policies; free-provider blocking must not be confused with disposable-mail detection. No particular buyer's subscription is assumed. [HubSpot documentation, updated September 2, 2026](https://knowledge.hubspot.com/forms/block-form-submissions-from-specific-email-domains).

For the developer/agent buyer in this experiment, use the established `email-validator` Python package plus a pinned public disposable-domain list. The library covers syntax, normalization/internationalization, DNS MX checks, null MX, A/AAAA fallback, and timeout handling; it expressly does not establish mailbox existence. It can reuse a caching resolver. This is substantially stronger than a deliberately naive regex-plus-MX baseline. [Maintainer documentation](https://github.com/JoshData/python-email-validator).

The community disposable-domain list supplies public data with permissive reuse terms and instructions for matching registrable domains rather than arbitrary substrings. A maintained public list is a substitute input, not a proprietary asset. Pin the fetched revision and inspect false positives/allowlist handling. [List maintainer documentation](https://github.com/disposable-email-domains/disposable-email-domains).

Keep the address processing local; send only domains to DNS. Pin dependencies and list version. Document the operational burden of updating them, but do not invent future maintenance hours or claim the seller removes that burden without evidence.

### Credentialless Apify access

Apify itself announced eligible Actor access through x402 without an Apify account or API key on June 26, 2026; its API reference currently describes agentic payment authentication. The strongest substitute is direct first-party discovery and payment, not account signup. A reseller would need a specific, evidenced advantage beyond supplying credentials. [Apify changelog](https://apify.com/change-log/pay-for-apify-actors-with-x402), [official API reference](https://docs.apify.com/api/v2).

No paid execution was attempted. Some official pages describe different experimental payment flows, so exact eligibility and payment constraints should be recorded from the selected Actor's current contract if this idea advances. The first-party alternative alone is sufficient to falsify a broad claim that account-free access is unavailable.

### Public agent-readiness checks

The free baseline is the buyer's actual HTTP/client request, schema validation and, where applicable, the official MCP Inspector. Inspector can connect to a remote endpoint, initialize, list tools, and call a tool through its CLI. It already exposes the failure points a broad readiness wrapper would summarize. [MCP Inspector](https://github.com/modelcontextprotocol/inspector), [CLI documentation](https://github.com/modelcontextprotocol/inspector/blob/main/clients/cli/README.md).

A useful task would name a particular client, discover a particular capability, and complete a harmless representative call. Returning a high readiness score, finding `llms.txt`, or detecting an HTTP 402 does not prove that a buyer can complete its job. Do not pay for a generic score until downstream predictive value or a material support burden is established.

## Proposed email task — requires lead freeze before cases are created

Given a batch of newly submitted CRM email addresses and an explicit intake policy, assign each record to one of these business actions:

1. Request correction for definitive syntax errors or authoritative evidence that the domain does not receive mail.
2. Preserve the contact for review/retry when network evidence is unavailable, contradictory, unsupported, or insufficient.
3. Flag membership in a specifically versioned disposable-domain list for the buyer's policy decision.
4. Continue ordinary intake when these checks find no obstacle, while keeping mailbox ownership and mailbox existence unverified.

The output can be any usable form. Success means correct actions for the contacts, auditable reasons, no dropped records, and no unjustified claims. It does not mean conforming to the seller's preferred JSON.

Null MX and ordinary absence of MX must be distinguished: SMTP can fall back to A/AAAA in the absence of MX; a null MX explicitly announces no mail service. [RFC 7505](https://www.rfc-editor.org/rfc/rfc7505.html).

## Comparison protocol to freeze in advance

- Twenty cases, with fourteen disclosed development cases and six reviewer-held cases. Freeze case IDs, expected acceptable actions, provenance and hashes before prototype work; reveal held-out inputs only when the seller contract is frozen.
- Include ordinary public-provider/corporate inputs, unfamiliar internationalized inputs, normalization needs, malformed input, null MX, nonexistent domain, fallback DNS, temporary DNS failure, and disposable-list boundary conditions. No private customer data or SMTP probes.
- Use real public DNS observations for the live smoke test and deterministic DNS fixtures for failure and uncommon cases. Both seller and substitute receive equivalent evidence. Never count synthetic evidence as a live reliability result.
- Record baseline setup time, intervention count, execution time, successful task outcomes and failures. Give the baseline mature libraries and normal tooling; do not force it to match the seller schema or deny it caching.
- Have the blind buyer receive only the fixed task, public contract/examples, and endpoint. No source inspection, private helper code, hidden expected outputs, or implementation coaching.
- First-run results remain first-run results. Any clarification or repair is counted separately. A rerun after a fix is diagnostic, not a replacement for the original score.

## Proposed hard gates and decision rule

Lead-frozen technical floor (superseding the reviewer's initial proposal): all twenty records accounted for; at least nineteen correct action decisions; zero false definitive BLOCK results or claims that DNS or list membership proves mailbox existence or ownership; zero definitive rejection caused solely by timeout/SERVFAIL or unfamiliar-but-supported input; explicit unknowns retained for review. Unsupported valid SMTPUTF8 may be routed to review if that unsupported status is explicit; it may not be silently destroyed or relabeled as nonexistent.

The nineteen-of-twenty threshold is a coarse screening choice, not an estimate of production accuracy. Report all disagreements and the full denominator. A one-case gain is five percentage points in this tiny convenience sample.

The candidate must reach that floor and outperform the strongest substitute on the lead-frozen buyer threshold: at least four more correct decisions, or at least 50% measured integration-effort reduction with equivalent correctness. It must have no material privacy/supply disadvantage and buyer cost must not exceed the substitute including already-owned tools at zero marginal cost. Report raw measurements; a measured evaluator setup time is not itself an external buyer integration measurement. Marginal formatting convenience, a payment round trip, or output-schema compliance is insufficient.

If both methods produce the same useful decisions with comparable effort, the prototype is a tie and the commercial wedge fails this round. If the baseline wins, reject or park the proposed seller. If the seller wins, it earns a later external-buyer test, not product selection or a demand claim.

## Skeptical viability assessment

Email-domain checks rest on public DNS and public lists. Generic agent capability becoming cheaper makes assembly and maintenance easier for buyers. Possible durable value would have to come from demonstrated reliability, fresh exclusive evidence, customer workflow state, or distribution; none is observed here. A false rejection costs the buyer a legitimate contact, while recurring calls alone reward the seller. Conservative review routing and versioned evidence help align incentives, but they do not create demand.

An honest final outcome may be: the bounded experiment eliminated three weak wedges at low cost and preserved reusable evaluation knowledge. That fulfills the doctrine better than selecting a product because implementation was easy.

## Final independent audit and buyer-role choice

The comparison has now run. Both candidate and mature free baseline scored **19/20 on the original fixed expectations**, with zero false definitive BLOCK decisions and zero unsupported mailbox-existence claims. The only discrepancy, H04, is a benchmark expectation defect: `notmailinator.com` is an exact member of the supplied disposable list, so REVIEW is the correct policy action. I independently fetched the pinned upstream revision again and confirmed the exact member at line 5,640 with the original raw hash unchanged.

The first run remains intact. Removing H04 leaves **19/19 valid cases for both**. Correcting its interpretation to REVIEW yields **20/20 for both as a diagnostic rescore only**, using the existing outputs. No original case/result/code was changed after holdout exposure, and no replacement case was added.

The preregistered material-advantage gate is not met: the candidate adds zero correct decisions and there is no matched measurement of buyer integration savings. Its shorter single-run local process time (62.845 ms versus 224.965 ms) is not buyer integration time. The baseline's measured 111.361-second setup is internal evaluator work and cannot stand in for an external buyer comparison.

I would use the free local library/list workflow, or the buyer's already-owned intake controls, and make no purchase. This is the judgment of an **internal simulated buyer/reviewer**, not an external customer or demonstrated market demand. The bounded conclusion is **NO_BUILD for the tested seller wedge**. It is not a claim that every email-validation business is unviable.

Material limits: the reviewer created both the cases and the baseline; only the candidate was held out from six inputs. Two fallback fixtures needed correction before execution; H04's expected action was wrong. All DNS evidence is synthetic. The candidate routes supported-by-the-baseline SMTPUTF8 input to explicit unsupported REVIEW, which passes the conservative policy but may create more manual work. The test establishes neither production accuracy nor equal review burden, live reliability, list freshness, payment fulfillment, demand, retention or willingness to pay. The detailed immutable hashes and audit are in the owned `baseline-notes.md` artifact.
