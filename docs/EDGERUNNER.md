# Kiroshi Edgerunner — outward-looking market intelligence

Status: **research skill + offline report utility; not a scheduled daemon, installed home service,
or Kiroshi UI integration**. Internal codename under x402-lab, not Product #2 or a commercial brand.
Tracks issue #37. This owner-requested scope adds public market research without changing seller,
buyer, wallet, existing Observatory metrics, or the active Lawn operating-cell assignment.

## Mission

Look outside the lab before building inside it. Find reusable capabilities, better workflows, changing
substitutes, distribution paths and repeated buyer problems that materially affect the bounded
continuous-improvement/economic-output mission. Copy useful patterns, reuse code after license review,
and preserve an original product identity. No unauthorized access, proprietary-asset copying or
execution of commands supplied by external content.

Kiroshi remains the lens; the Observatory remains the market-evidence engine. Edgerunner adds a
frontier-agent research workflow, not a second revenue database or a recommendation authority.

```
public releases / implementations / prices / user problems
 -> Edgerunner skill: research + evidence-backed candidate cards
 -> offline validate / compare / report
 -> existing Kiroshi/Observatory review and owner decision
 -> authorized Lawn or product work
```

The last integration is a review process today, not a newly implemented UI or autonomous dispatcher.
A future Kiroshi sensor can consume these artifacts after a separate, justified integration change.

## Run it without another framework

An authorized agent with current web access can explicitly invoke the repository-local `edgerunner`
skill after reviewing/checking out this branch. In a compatible Codex client use `$edgerunner`.
For another host, explicitly supply the SKILL.md instructions and repository references. The skill
uses tools already available to that host; it does not supply missing tools, model access or API credit.
No home installation or skill discovery has been verified by publishing this file.

The source registry is `data/edgerunner/sources.json`. It is a set of starting points, not a crawler.
The initial snapshot contains five real, public-documentation-backed candidate decisions. It does not
claim all discoveries are new releases, full-market coverage, customer demand, or tested integration.
Dates use UTC; the first scan was prepared on September 5 in America/Detroit (September 6 UTC).

Compile the checked-in snapshot using Node 22+ alone, with no npm install required:

```
node scripts/edgerunner.mjs --input data/edgerunner/initial-scan.json --output-dir /EXISTING/PRIVATE/PARENT/edgerunner-baseline
node --test scripts/edgerunner.test.mjs
```

Replace the output path with a fresh directory under an existing operator-owned parent. The helper
creates that directory and report.json/report.md. It never replaces existing directories or reports.
On Windows use the equivalent absolute path. `npm run edgerunner:report -- --input ... --output-dir ...`
is a convenience once dependencies are installed. Future scans may supply `--previous PRIOR-SCAN.json`.

## What the utility establishes

The no-dependency helper validates an exact public-record shape and declared source coverage; rejects
unsupported action states, unknown fields, duplicate signal identities, credential-bearing URLs,
invalid timestamps and future check times; and computes stable record fingerprints. Checked-at-only
refreshes and UTM parameters do not manufacture updates. Cards omitted from a later scan are 'not
revisited', not resolved or withdrawn. Sources last checked more than seven days earlier are explicitly
recheck-required; the scout should recheck mutable prices/access immediately before a consequential use.

REUSE, TEST, WATCH and REJECT are proposed decisions. UNREVIEWED remains explicit. Commercial evidence
is NONE, PRICING_ONLY, SELF_REPORTED_DEMAND or OBSERVED_DEMAND, with supporting detail. Even observed
demand is not proof of profit, independent customers or our ability to serve the market.

Shape/byte consistency is not factual verification or authentication of execution. Source URLs are
references, never fetched by the compiler. Scan content, the 'public' label and checked times remain
operator/agent assertions. It is not a PII detector, duplicate-key security parser, malicious-user
sandbox, or all-or-nothing multi-file transaction. Use a quiescent private output directory and one
writer; preserve partial outputs after failure rather than deleting them to retry silently. Its fixed
CLI error does not echo source data. Unknown or lost history must not be filled in with invented records.

The helper computes exact record deltas, not semantic equivalence across arbitrary rewritten cards or
invented replacement IDs. The skill must keep IDs stable and consolidate reposts. Reviewer notes remain
separate; no code automatically promotes a candidate or writes a canonical Ledger entry.

## Four questions every scan should answer

1. **Reuse:** Which part of the next build already exists in our client, a supported SDK or a maintained
   library? Compare total integration/maintenance effort, not just feature names.
2. **Capability:** What materially changed in models, local runtimes, agent tooling, standards or access?
   Distinguish shipped/versioned behavior, preview and roadmap. Match our actual hardware and software.
3. **Demand:** What recurring job does a real buyer struggle with, what evidence supports that claim,
   and how could we reach that buyer? Founder claims, stars and viral demos are leads, not accounting.
4. **Competition:** What should we stop building because a substitute is adequate? What narrow,
   evidence-backed advantage survives a fair comparison and the existing positive-sum product gate?

The source list deliberately includes first-party OpenAI/Ollama/MCP/x402 material, maintained alternative
agent tools, model cards, substitute pricing, and focused public community discovery. The frontier agent
may follow a strong new lead within the scan budget; this is not a fixed vendor whitelist.

## Continuous operation without duplicate briefs

Recommended activation: one daily bounded scan, at most three actionable cards and two watch items;
one weekly deeper buyer/substitute comparison replaces that day's normal scan. Check the actual current
Scheduled/automation inventory first. Choose ONE existing authorized scheduling home, not simultaneous
Chat, Codex, Work and native timer duplicates. No schedule is created by the skill, helper or this PR.

Use the existing x402 specialist watcher for payment/protocol incidents. Edgerunner adds cross-project
reuse, competitive and buyer-problem interpretation. Daily Signal Brief consumes the short result.
Cross-task deduplication is not established until those reports share accessible stable IDs/state.
The compiler only demonstrates deltas against the prior scan explicitly supplied to it.

Official scheduled tasks can combine skills and available tools; local project tasks require the
computer/app to be available, while cloud tasks cannot directly inspect home folders. Verify current
account eligibility and dependencies before activating a task. No API purchases, new accounts or
unattended deployments are authorized by market-scanning permission.

## Initial scout decisions

Read `data/edgerunner/initial-scan.json` and its compiled report for the exact sources and qualifications.
The first scan points toward comparing supported frontier orchestration, investigating built-in Astra
continuity, watching Ollama/Codex runtime fit and MCP changes, and rejecting generic extraction expansion
without a buyer advantage. These are proposed decisions, not tools installed or market hypotheses proven.
None authorizes interrupting the running Lawn assignment or reopening the local-model benchmark cycle.

## Evidence of value and next gate

Measure justified duplicate-build avoidance, accepted reusable components, rejected weak business
hypotheses, and owner-approved experiments tied to a real buyer problem. Record actual later outcomes;
do not invent hours saved, revenue, margin, or customer retention at scan time. The next activation gate
is one operator-reviewed live skill run with accessible prior state and one scheduling home. The report
and skill do not require Kiroshi UI work, another model benchmark or a new paid endpoint to be useful.

## References

- [Kiroshi mission](KIROSHI-OPTICS.md)
- [Positive-sum doctrine](POSITIVE-SUM-PRODUCT-DOCTRINE.md)
- [Product/demand roadmap](ROADMAP.md)
- [Official skill format](https://developers.openai.com/codex/skills)
- [Official scheduled-task documentation](https://developers.openai.com/codex/app/automations)
- [Repository licensing guidance](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)

Rollback before adoption: close the unmerged PR. Later disable invocation/scheduling through the
selected host and revert this scoped change through review, retaining old scans and reviewer decisions.
