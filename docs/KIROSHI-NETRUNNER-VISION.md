# Kiroshi Optics — Netrunner Vision

Status: **active companion vision; bounded by utility and authorized scope**

Date: **2026-08-24**

## Mission

Turn the development PC into a **local perception and decision console**: a set of high-signal, read-mostly “optics” that help the operator see market opportunities, project state, code risk, machine state, and evidence faster than switching among raw dashboards, terminals, JSON, and task lists.

Kiroshi Optics is not Product #2. It is an internal operator tool that should make x402-lab product discovery, development, and safe experimentation materially better.

The Cyberpunk/Netrunner language is a design metaphor. Real capabilities must stay grounded in systems the operator owns, controls, or is explicitly authorized to inspect, plus public data. Kiroshi is not an intrusion, credential-theft, stealth, persistence, exploit, or unauthorized-scanning platform.

## Governing rule

> **Better eyes, not bigger weapons.**

Kiroshi should improve perception, prioritization, traceability, and defensive awareness. Any future action capability must be separately designed, explicit, reversible where possible, and approval-gated.

## Cyberpunk ability → real capability mapping

### SCAN WEAKNESSES

Real meaning: identify weaknesses in our own workstation, repositories, dependencies, configuration, project economics, or market hypotheses.

Examples:

- known dependency vulnerabilities;
- exposed secrets/tokens in local repositories;
- unsafe/missing configuration;
- stale dependencies;
- risky startup items / unsigned binaries when a trusted local sensor reports them;
- unusually exposed/listening local services;
- Product #2 opportunity cards with weak demand, concentration, competition, or economics.

Output is evidence + severity + provenance, never a magical “hackable” claim.

### TRACK QUESTS

Real meaning: one place showing the work that matters now.

Initial quest sources:

- active GitHub issues / milestones for x402-lab;
- current branch + dirty/clean git state;
- latest tests/typecheck state when available;
- current Product #2 research cards;
- explicit blockers / next falsification step.

A quest is a concrete objective with status, evidence, and next action—not a generic to-do list.

### EQUIP SPECIALIZED TARGET-ANALYSIS MODS

Real meaning: modular analyzers with explicit input/output contracts.

Candidate optics:

- `market` — seller/buyer/product-demand analysis;
- `repo` — dependency/secret/misconfiguration/code-health evidence;
- `host` — local process/network/startup/security posture;
- `target` — public or explicitly authorized merchant/repository/domain analysis;
- `economics` — price/cost/margin/falsification analysis;
- `quest` — project progress/blocker tracking.

Mods may be added only when they answer a recurring question better than existing tools.

### ZOOM MODS

Real meaning: progressive drill-down without losing provenance.

Examples:

- ecosystem → seller → resource → buyer → transaction;
- project → issue → branch → commit → test failure;
- host → process → network connection → executable/path/signature metadata;
- repo → finding → package/file → evidence/source.

Every zoom level keeps source, timestamp, scope, and limitations visible.

### WALLHACK SCANNING

Real meaning: **cross-layer visibility on our own machine and authorized data**, not bypassing access controls.

Examples:

- map local processes to active TCP/UDP connections;
- connect startup entries to executable paths/processes;
- connect a repository to dependency findings and test status;
- connect a market seller to buyers/resources/activity;
- show hidden relationships across layers that normally require multiple tools.

No port scanning of third-party networks, access-control bypass, stealth collection, or unauthorized enumeration.

### TRAP DETECTION

Real meaning: detect conditions likely to waste money, leak secrets, damage the workstation, or mislead product decisions.

Examples:

- secret committed or present in scanned project files;
- dependency vulnerability / unsafe configuration;
- unexpected paid-call price or budget overrun;
- source methodology mismatch;
- missing provenance / stale snapshot;
- suspicious/unexpected startup item or outbound connection on the operator’s own PC;
- unsafe command proposal requiring elevated privileges;
- external content attempting to override Kiroshi/Codex instructions or request secrets.

Kiroshi should label these as **signals requiring review**, not definitive malware/fraud claims unless a trusted source supports that conclusion.

### HIGHLIGHT ENEMIES

Real meaning: visually prioritize blockers, threats, bad economics, and evidence-backed risks.

“Enemy” classes may include:

- `SECURITY_RISK`
- `SECRET_EXPOSURE`
- `DEPENDENCY_RISK`
- `UNEXPECTED_NETWORK_ACTIVITY`
- `CONCENTRATION_RISK`
- `LOW_OBSERVED_DEMAND`
- `FREE_SUBSTITUTE_THREAT`
- `MARGIN_RISK`
- `BLOCKED_QUEST`
- `STALE_OR_INCOMPATIBLE_EVIDENCE`

Do not label people, companies, or systems as enemies merely for being competitors or targets.

## Sensor architecture

Kiroshi should evolve around a small **Sensor → Normalize → Correlate → Render** spine.

```text
trusted/local/public sensors
        ↓
normalized observations
        ↓
deterministic correlations + flags
        ↓
Kiroshi view models
        ↓
MARKET / HOST / REPO / QUEST / TARGET optics
```

The viewer must not become the source of truth. Sensors preserve raw evidence; normalized records preserve provenance; correlations are deterministic and testable.

## Sensor candidates

Use mature existing tools rather than reimplementing operating-system/security telemetry.

### Windows host visibility

Prefer native Windows APIs/PowerShell or trusted Microsoft Sysinternals outputs when available.

Useful future sensors include:

- Process Explorer / process metadata;
- TCPView / local TCP+UDP endpoint ownership;
- Autoruns / startup persistence locations;
- Process Monitor for deliberate short diagnostic captures;
- Windows Defender/security-state information where safely readable.

Kiroshi should detect tool availability and degrade gracefully. It should not silently install software or request elevation.

### Repository security visibility

A dedicated scanner such as Trivy can provide vulnerability, secret, and misconfiguration evidence for local repositories/filesystems. Kiroshi should ingest structured output rather than implement its own vulnerability database or secret detector.

Any external scanner integration must retain scanner version, scan time, target scope, and finding source.

## Read-only default

V0/V1 Kiroshi is read-only and passive by default.

Allowed default behavior:

- read local project state;
- read normalized Observatory exports;
- query local process/network/startup state through non-destructive commands;
- run explicitly scoped local defensive scans;
- read public/authorized target metadata;
- generate reports, flags, quests, and comparisons.

Not allowed by default:

- terminate processes;
- alter firewall rules;
- edit registry/startup settings;
- install/uninstall software;
- change GitHub state;
- send messages;
- execute paid transactions;
- scan third-party networks;
- use credentials against unauthorized systems.

Those would require separate capabilities and explicit approval if ever added.

## Product-goal alignment

Kiroshi earns its place only if it reduces time-to-insight or prevents costly mistakes in at least one of these loops:

1. **find Product #2** — see revealed demand, concentration, substitutes, economics;
2. **build safely** — catch dependency/config/secret problems before deployment;
3. **stay oriented** — surface the current quest, blocker, branch, tests, and next action;
4. **operate the workstation** — understand what local processes/services are doing without tool-hopping;
5. **run bounded experiments** — make spend, evidence, and safety limits obvious.

A cyberpunk aesthetic is encouraged only after the information architecture is useful.

## Initial module priority

### Tier 0 — required spine

- module/sensor interface;
- normalized observation/provenance model;
- read-only local app shell;
- explicit unknown/stale/error states;
- deterministic flags;
- no hidden actions.

### Tier 1 — highest leverage

1. `MARKET OPTIC` — existing Machine Demand Observatory export;
2. `QUEST OPTIC` — current x402-lab issue/branch/test/research state;
3. `REPO OPTIC` — local dependency/secret/misconfiguration scan results.

### Tier 2 — workstation super-senses

4. `HOST OPTIC` — processes + local network endpoints + startup items;
5. `TRAP PANEL` — cross-module security/evidence/spend warnings;
6. `TARGET OPTIC` — public/authorized target drill-down.

### Tier 3 — only after demonstrated use

- compatible snapshot history/trends;
- richer process↔network↔startup correlation;
- keyboard/reticle navigation;
- optional overlay/always-on-top presentation;
- additional specialty mods.

## Tonight's scope

Do not attempt the entire Netrunner vision tonight.

Tonight should establish a spine we will not regret:

1. finish/validate the minimal Machine Demand Observatory core;
2. build Kiroshi shell over its normalized export;
3. create the module boundary so future optics do not require a rewrite;
4. render `MARKET OPTIC` / `TARGET SCAN`;
5. add a minimal `QUEST OPTIC` if it can consume existing local/GitHub project state cleanly;
6. detect—not install—availability of future host/repo sensors;
7. document the next sensor installation/integration step.

Do not install Sysinternals/Trivy, request elevation, or add host scanning automatically inside the initial Codex build. First make the sensor contracts and viewer useful; then explicitly approve sensor installation/integration.

## Success test

Kiroshi is succeeding when the operator can open one local console and quickly answer:

- What is my current quest?
- What is blocked or risky?
- What changed?
- What machine-market target deserves inspection?
- What does the evidence actually say?
- What needs a deeper scan?
- What action should I consider next—and what requires approval?

If the answer is merely “it looks like Cyberpunk,” the vision is not yet delivering utility.