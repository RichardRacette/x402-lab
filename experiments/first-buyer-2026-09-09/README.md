# Email intake falsification, September 9, 2026

**NO_BUILD.** This is an offline comparison artifact, not an offered API or production
validator. See [decision and evidence](../../docs/first-buyer-2026-09-09/decision.md).
The seller gate failed, so no server, payment adapter, deployment or launch package
was built. Existing production code/configuration is unchanged.

## Reproduce

From the repository root, use Node 22+ and Python 3.10+:

```sh
python3 -m venv /tmp/first-buyer-venv
/tmp/first-buyer-venv/bin/python -m pip install -r experiments/first-buyer-2026-09-09/baseline-requirements.txt
BUYER_BASELINE_PYTHON=/tmp/first-buyer-venv/bin/python node experiments/first-buyer-2026-09-09/run-comparison.mjs --output /tmp/first-buyer-rerun.json
node experiments/first-buyer-2026-09-09/audit-results.mjs
```

Package installation requires public package access. The comparison itself is
entirely offline: both implementations use identical supplied DNS fixtures and
list contents; neither performs DNS, SMTP, HTTP, wallet or payment operations.
Choose new temporary paths if they already exist. The comparison refuses to
replace an existing result. It checks the frozen case/core/dependency hashes.
Expected routes are only used by the scorer, never passed as implementation input.

Local run: Node 24.19.0 and Python 3.12.14, using the bundled Python and dependencies
installed into an isolated temporary directory. The baseline's earlier development
check used system Python 3.13; that is separate from the lead's full comparison.
Timing is one cold CLI batch of twenty per implementation, including process
startup and JSON/list work. It excludes network, hosting and payment, so its
62.85 ms / 224.97 ms difference cannot establish production latency or buyer savings.

## Preserved results and audit

- `cases-public.json`: fourteen disclosed cases and the full pinned disposable list.
- `cases-heldout.json`: six cases withheld from the candidate implementer. The
  baseline author created these cases and knew them; generalization is asymmetric.
- `candidate.mjs`: frozen bespoke Node core. `candidate-cli.mjs` is only a stdin adapter.
- `baseline.py`: mature `email-validator`/`dnspython` substitute plus small intake-policy adapter.
- `results-first-run.json`: untouched first run, **19/20 for each**, zero false BLOCK
  decisions and zero mailbox-existence claims.
- `results-audit.json`: one erroneous benchmark expectation explained. H04's
  `notmailinator.com` is an exact member of the pinned list, so REVIEW was correct.
  Both arms passed **19/19 valid original cases**. Correcting that expectation gives
  **20/20 each diagnostically**, not a fresh test or new held-out success.
- `audit-results.mjs`: reproduces the exact-list-membership diagnosis from saved files.

The original case freeze is in commit `72db0a6`. Before first execution, two synthetic
fallback IPs were corrected from documentation ranges to globally routable values.
Hashes and amendment reasons are recorded in `baseline-notes.md`; no expected route
changed in that amendment. Candidate code had started before the amendment but
was not changed in response. Neither implementation was tuned after heldout results.

No-build is represented as an existing manual-review queue: twenty records retained,
zero automatically resolved, zero incremental software charge. Human resolution
and time are unmeasured; queueing is not useful task completion. A developer can
instead adopt the free baseline, with no new paid seller integration.

## Data and limits

The embedded 8,742-entry list comes from disposable-email-domains at revision
`8d5b14f53dff80842e841ee0ae14de2962cee66c`, source file
`disposable_email_blocklist.conf`, raw SHA-256
`9e94123b0f0ebd77ef9cd7c6e7dd39bf7d3b981f618a6d20632647e2de20649b`.
See `DISPOSABLE-LIST-LICENSE.txt` (CC0). List membership means listed in that
snapshot, not proof of abuse or permanent disposability. Full addresses are
synthetic test inputs, not private customer records.

DNS answers are synthetic, even where the domain names are real. The frozen list
revision is auditable; current DNS freshness, list update reliability and paid
competitor performance are not measured. The bespoke candidate lacks a complete
RFC parser and production safeguards, and its fallback-IP/SPF policies need further
review before real use. This artifact is retained to explain rejection, not shipped
as a supported free or paid product.

The predeclared material gate required a four-case quality advantage or a 50%
measured independent buyer integration saving at equal correctness, with acceptable
costs/supply. Neither was demonstrated. Internal coding time is not customer
integration effort. A tie is a failure of the proposed paid wedge, not evidence
that all managed email-validation businesses are unviable.
