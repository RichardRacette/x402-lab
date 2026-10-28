# Public evidence guide

Documentation review: **2026-10-28**. Source snapshot before this documentation pass: [`7b5af8f87f670b1cdb61ce3fc99c41dfe00749a8`](https://github.com/RichardRacette/x402-lab/tree/7b5af8f87f670b1cdb61ce3fc99c41dfe00749a8).

This guide distinguishes repository records, reported historical execution, fresh execution, and commercial outcomes. Reading a record does not rerun its experiment. This pass did not contact a deployed seller, sign a payment, access a wallet, run the application test suite, or verify present-day service availability.

## What this project demonstrates

A bounded machine-commerce research project: investigate a protocol, build constrained buyer/seller tooling, preserve experiment evidence, and reject products when a maintained free alternative removes the proposed advantage.

Richard Racette's portfolio contribution is project direction, experiment selection, requirements, review and acceptance decisions, and AI-assisted implementation/integration. x402, its SDKs, chains, payment standards and third-party libraries are upstream work, not inventions of this repository. The project's MIT license is unchanged; dependency terms remain their own.

## Evidence map

| Claim | Evidence and date | Supported interpretation | Not established |
| --- | --- | --- | --- |
| Seller/testnet protocol loop | [Historical handoff](https://github.com/RichardRacette/x402-lab/blob/7b5af8f87f670b1cdb61ce3fc99c41dfe00749a8/HANDOFF.md), verified 2026-09-05 | The repository reports prior Base Sepolia settlement and fulfillment. The handoff's own dated recheck reports HTTP 200 health and an unpaid HTTP 402 challenge; it explicitly did not make a payment. | A fresh settlement check, current uptime, production readiness, external customer revenue. |
| Approval-gated Buyer Trace adapter | [Adapter record](https://github.com/RichardRacette/x402-lab/blob/7b5af8f87f670b1cdb61ce3fc99c41dfe00749a8/docs/BUYER-TRACE-ADAPTER.md), 2026-09-05 with 2026-09-08 compatibility update | Documented LOCAL_E2E_VERIFIED / LIVE_NOT_RUN; approval, drift, timeout and reservation controls. | Live execution, independent settlement reconciliation, or permission to purchase. |
| Decision not to build another seller | [September 9 decision](https://github.com/RichardRacette/x402-lab/blob/7b5af8f87f670b1cdb61ce3fc99c41dfe00749a8/docs/first-buyer-2026-09-09/decision.md) | A bounded email-intake comparison did not show the required advantage over a maintained free substitute. Outcome: NO_BUILD. | A conclusion that all machine commerce fails, broad comparative superiority, or product-market fit. |
| Historical automated verification | Same September 9 decision, verification section | Reports 178 TypeScript + 16 Edgerunner + 41 economics checks = 235 passing tests in that dated local run. | A fresh test run today, comprehensive security assurance, or the current PR's CI result. |
| Buyer demand | Same decision and historical handoff | External paid use and repeat independent purchase were not demonstrated in the reviewed records. | Customers, recurring revenue, conversion, or a market-size estimate. |

These are documentation-backed claims, not an independent audit of every underlying log or transaction receipt. Follow the records and reproduce the relevant check before increasing a claim's strength.

## The most useful experiment to inspect

Start with the [locked protocol](first-buyer-2026-09-09/preregistration.md), [reproduction instructions](../experiments/first-buyer-2026-09-09/README.md), [untouched first result](../experiments/first-buyer-2026-09-09/results-first-run.json), [benchmark audit](../experiments/first-buyer-2026-09-09/results-audit.json), and [decision](first-buyer-2026-09-09/decision.md).

The original routing score was **19/20 for both implementations**. One benchmark expectation was defective. Excluding that case leaves **19/19 for both**; a corrected-expectation diagnostic yields 20/20 on the same outputs. The diagnostic is not an additional experiment or twenty more tests. The reviewer authored the baseline and cases, so this was not a fully blind study. One cold subprocess timing sample is not production latency or measured buyer integration savings.

The useful outcome was the decision to stop, preserve the original result, and avoid launching another seller without evidence of advantage. Provider/paid-service spend for that experiment was reported as $0; existing account/model usage was not assigned an invented incremental cost.

## Historical-document precedence

The 2026-09-05 HANDOFF.md is preserved as a dated record. Its statements that Buyer Trace implementation is unfinished and issue #27 is the next engineering task predate later work. The adapter record and September 9 decision supersede those particular status statements. Neither a historical next step nor this portfolio pass authorizes a new implementation lane, live purchase, deployment, or product selection.

Seller testnet evidence and Buyer Trace's separately gated purchase path must not be conflated. In particular, a seller testnet demonstration does not authorize the adapter's documented mainnet purchase path.

## Reproduction without live spending

In an isolated checkout, inspect package scripts and [CONTRIBUTING.md](../CONTRIBUTING.md), then use the project's normal verification contract:

```sh
npm ci
npm run typecheck
npm test
```

Tests and CI must not make real payments. Do not provision wallet material, copy production environment files, run an execution command, start a new deployment, or change payment/network settings for a portfolio review. The experiment README contains its own separate reproduction contract.

Record the exact commit, date, environment, command, exit code, counts, failures and limitations for every new run. A CI badge is a link to a changing result, not a permanent guarantee.

## Claim wording

Supported: "Directed an AI-assisted machine-commerce research project, documenting historical testnet protocol evidence, approval-gated buyer tooling and a controlled no-build decision against a maintained free alternative."

Not supported by the reviewed evidence: "Built x402," "launched a profitable autonomous business," "proved customer demand," "production-secure payment infrastructure," or "235 tests pass today."

## Next evidence work, not automatic authorization

Reproduce the existing offline checks on the exact proposed revision, inspect raw protocol evidence before elevating its claim, and record the current CI result. A fresh availability check or any live transaction needs its own explicit scope. No new paid APIs, wallets, paid purchases, deployment or external outreach is authorized by this document.
