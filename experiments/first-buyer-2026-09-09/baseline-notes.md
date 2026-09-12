# Mature free substitute: integration log

Baseline integration start: **2026-09-09T05:18:04Z**. This starts after case/list freezing. It includes package setup, coding, reading library behavior, and initial verification. Research and benchmark authoring are separate evaluation overhead. Budget: 30 minutes wall clock.

Before baseline coding, the cases were frozen:

- Public manifest SHA256: `3bd315ec69839a0d425b0412e857a096367144b8d36f9029ebf50335a6523cf3`.
- Held-out manifest SHA256: `661481ddf2821177aadb2e6f2d19abf100e28f81acaab9fe50f904df1ca84ba1`.
- Full disposable list source revision: `8d5b14f53dff80842e841ee0ae14de2962cee66c`.
- Raw source-list SHA256: `9e94123b0f0ebd77ef9cd7c6e7dd39bf7d3b981f618a6d20632647e2de20649b`; 8,742 entries.

The same reviewer authored the cases and the baseline. The baseline therefore is not blind to held-out cases; they are held out from the candidate implementation. This asymmetry must be disclosed and limits claims about comparative generalization.

Method: `email-validator` for parsing/normalization and DNS semantics, `dnspython` for DNS data and errors, public pinned domain-list membership for review flags. Both installed system Python and bundled Python lacked these libraries at the start. Dependencies are installed in an isolated temporary directory, not into the user's Python environment.

No live contacts or private customer data are used. DNS fixtures use synthetic evidence, including real public domain names. No fixture execution may make a network lookup. Unknown fixture domains fail to REVIEW. Payment, mailbox ownership and mailbox existence are never tested or claimed.

## Pre-execution fixture amendment

At 2026-09-09T05:19:02.442747+00:00, reading the pinned library revealed that it rejects non-global fallback addresses. The original documentation-range IPv4/IPv6 fixtures were therefore not fair evidence for KEEP. Lead authorized correcting them before any baseline/candidate execution. Original case-freeze commit `72db0a6` and original timestamps remain preserved. These are synthetic DNS addresses; no SMTP or HTTP contact is made.

- `cases-public.json` / `P14`: `192.0.2.40` -> `1.1.1.1`. Original SHA256 `3bd315ec69839a0d425b0412e857a096367144b8d36f9029ebf50335a6523cf3`; amended SHA256 `c64f25dbd217acf8dcda8ff916b0e590d7f05b6b80b36d8da0fe7f428956b072`.
- `cases-heldout.json` / `H02`: `2001:db8::40` -> `2606:4700:4700::1111`. Original SHA256 `661481ddf2821177aadb2e6f2d19abf100e28f81acaab9fe50f904df1ca84ba1`; amended SHA256 `ecc772858f9a7755c72807181a683df22cec96e9ba677c7dd455dd96cd159fac`.

## First public integration result

Usable baseline completed at **2026-09-09T05:19:55.360746Z**, **111.361 seconds** after the recorded start. This is observed agent wall clock, including dependency setup and the pre-execution fixture correction; it is not a human implementation-time estimate, a production support estimate, or an external buyer measurement. It falls inside the 30-minute budget.

First public-case validation: **14/14 correct routes**, all mailbox-existence fields `UNKNOWN`, no crashes. Socket creation and connection were replaced with a function that raises during this validation; no network calls occurred. In-process execution for fourteen public cases was 8.991 ms; this number includes repeated set construction in this diagnostic driver and is not the official comparative timing. No held-out case was executed by the baseline reviewer. Lead owns the first complete twenty-case run and comparable process timing.

The baseline intentionally receives the same frozen DNS evidence and public list as the candidate. Fixture assembly is evaluation infrastructure, not a normal buyer integration requirement. Two small policy decisions supplement the library: mixed null/ordinary MX goes to REVIEW under RFC 7505, and reject-all sending SPF does not establish that receiving mail is impossible. The baseline author knew all fixture designs before coding; no holdout-blind performance claim is supported for the baseline.

## CLI contract and reproduction

`baseline.py` reads one JSON document from standard input and writes one JSON document to standard output. A single input is `{"email": "...", "dns": {...}, "disposableDomains": [...]}`. A batch is `{"inputs": [{"email": "...", "dns": {...}}, ...], "disposableDomains": [...]}` and returns an array in input order. Optional input IDs are echoed. Expected routes and case reasons are never passed to the triage function.

Each result includes `route`, `reason`, `mailboxExists: "UNKNOWN"`, `mailboxOwnership: "UNKNOWN"`, and DNS observations; parsed addresses also include normalization/domain and list-match evidence. KEEP means no obstacle found by the scoped checks, never mailbox validation. Both stdout and returned structures are ordinary JSON; the task can consume the decisions without a proprietary schema.

Pinned dependencies are in `baseline-requirements.txt`. For this run they were installed under `/private/tmp/x402-buyer-baseline-20260909-deps`; invoke with `PYTHONPATH=/private/tmp/x402-buyer-baseline-20260909-deps python3 experiments/first-buyer-2026-09-09/baseline.py`. This temporary path is an execution convenience, not a committed dependency. A new environment can install the same requirements into a virtual environment. The runtime used was system Python 3.13.

## Limits

This is a small, deliberately selected convenience sample. The deterministic fixtures prove no live DNS uptime, blocklist freshness, mailbox existence, or production accuracy. The first public run is development verification and must remain separate from the held-out score. The baseline requires no account, API credential, payment, or customer-contact disclosure; after dependency/list setup it runs entirely locally. Library/list updates remain buyer maintenance, but this experiment does not measure their future burden.

## Independent audit after the first complete run

The lead's first complete run is preserved in `results-first-run.json`, measured at `2026-09-09T05:20:39.712Z`, SHA256 `3c3719a50a05eea87035ac59a1d0f9b583c8c22055b559b7f303a4c6cd49d375`. Both methods scored **19/20 against the original expectations**, including 14/14 public and 5/6 held out. Both had **zero false definitive BLOCK results and zero mailbox-existence claims** under the harness checks. The reviewer inspected the returned evidence, not candidate source.

H04 was the only mismatch. Its `notmailinator.com` domain was intended as an unlisted suffix-boundary test, but it is an **exact member** of the pinned disposable-domain list. The reviewer independently fetched the original upstream file at revision `8d5b14f53dff80842e841ee0ae14de2962cee66c` again and verified one exact occurrence at line 5,640. Its raw SHA256 remained `9e94123b0f0ebd77ef9cd7c6e7dd39bf7d3b981f618a6d20632647e2de20649b`. The embedded snapshot agrees. Accordingly, both implementations correctly returned REVIEW for list membership. This says nothing about whether the list's real-world domain classification is accurate.

The original KEEP expectation is a benchmark-author error, not a product failure. **Do not rewrite the original case, first-run output, code, hashes, or headline raw score.** Excluding the defective case leaves **19/19 valid cases for each method**. If H04's expected route is interpreted correctly as REVIEW, the existing outputs support **20/20 for each method as a diagnostic correction only**. No rerun or post-holdout implementation change is needed. No replacement boundary case is introduced: it would be a new test, and cannot rescue the already absent comparative advantage.

Recorded cold-batch process times were candidate **62.845 ms** and baseline **224.965 ms**, for twenty cases each. These are single local process measurements with different runtimes, imports and JSON handling; they exclude live DNS, seller/network availability, payment and buyer work. The candidate's lower fixture execution time is not the preregistered 50% buyer-integration saving.

The methods are equivalent under the allowed task routes, with one operational distinction: H01's valid SMTPUTF8 address is KEEP in the baseline and explicitly unsupported REVIEW in the candidate. Both satisfy the frozen conservative policy, but this is not proof of equal manual-review burden in a real workflow.

## Threats to inference and buyer decision

- The reviewer authored the cases and baseline, so the baseline had knowledge of every expected route. Only the candidate had six held-out inputs. This is an internal adversarial comparison, not a fully blinded trial.
- The two non-global fallback addresses were corrected before execution and are separately recorded above; H04 was discovered after the first complete run and remains unchanged. These defects limit confidence in the benchmark author's coverage and prevent treating this small sample as a production accuracy estimate.
- The sample contains synthetic email local parts and synthetic DNS evidence. Public domain names do not make the DNS fixtures live evidence. It tests neither list freshness/completeness nor external domain truth.
- The 111.361-second baseline setup measurement is real evaluator wall clock, but there is no matched external buyer integration timing. Candidate coding time and process startup cannot establish that missing measure.
- Review is deliberately an acceptable outcome for some uncertainty. Equal route scores do not measure conversion, false-positive costs, future review effort, deliverability, or paid buyer value.
- No external customer, independent purchase decision, signup, payment, fulfillment, recurring use, or willingness to pay was observed. No revenue should be entered in economic reports.

The buyer-role recommendation is **choose the free mature substitute or the already-owned intake workflow; make no purchase and build no seller in this sprint**. There is zero demonstrated correctness advantage and no demonstrated buyer-integration advantage. The result rejects the tested wedge for this bounded sprint; it does not establish that all email utilities are unviable.

Documentation audit: the preregistration's initial phrase about hashes being recorded before either implementation reads expected results would overstate baseline blindness; the lead was asked to clarify that hashes preceded code, and holdouts were withheld from the candidate implementer. At review time, root README was unchanged and no experiment README existed. A later summary should retain raw/valid/diagnostic denominators, disclose the benchmark error and role asymmetry, and avoid calling the reviewer an external customer.
